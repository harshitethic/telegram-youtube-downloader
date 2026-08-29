import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import { Innertube, UniversalCache } from 'youtubei.js';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import 'dotenv/config';

const PORT = Number(process.env.PORT) || 3948;
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.B;
const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB) || 49;
const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR || path.join(process.env.TMPDIR || process.cwd(), 'downloads');

if (!TOKEN) throw new Error('Missing TELEGRAM_BOT_TOKEN environment variable.');

await fs.promises.mkdir(DOWNLOAD_DIR, { recursive: true });

const app = express();
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'telegram-youtube-downloader' }));
app.listen(PORT, () => console.log(`Health server listening on port ${PORT}`));

const bot = new TelegramBot(TOKEN, { polling: true });
const downloads = new Map();
let youtube;

async function getYouTube() {
  if (!youtube) {
    youtube = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true,
      client_type: 'WEB',
    });
  }
  return youtube;
}

function extractVideoId(input) {
  try {
    const url = new URL(input);
    if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0] || null;
    if (url.hostname.endsWith('youtube.com')) {
      if (url.pathname === '/watch') return url.searchParams.get('v');
      const match = url.pathname.match(/^\/(shorts|embed|live)\/([^/?]+)/);
      if (match) return match[2];
    }
  } catch {}
  return null;
}

function safeTitle(title) {
  return String(title || 'video')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || 'video';
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return 'unknown size';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

async function downloadVideo(chatId, input) {
  let tempPath;
  let progressInterval;
  let nodeStream;
  let cancelled = false;

  try {
    const videoId = extractVideoId(input);
    if (!videoId) throw new Error('Invalid YouTube URL.');

    const yt = await getYouTube();
    const info = await yt.getBasicInfo(videoId);
    const title = info.basic_info?.title || 'video';
    const duration = Number(info.basic_info?.duration || 0);
    tempPath = path.join(DOWNLOAD_DIR, `${safeTitle(title)}-${crypto.randomUUID()}.mp4`);

    const progressMessage = await bot.sendMessage(chatId, `🎬 *${title}*\nStarting download…`, { parse_mode: 'Markdown' });

    const webStream = await yt.download(videoId, {
      type: 'video+audio',
      quality: 'best',
      format: 'mp4',
      client: 'WEB',
    });

    nodeStream = Readable.fromWeb(webStream);
    downloads.set(chatId, {
      cancel: () => {
        cancelled = true;
        nodeStream?.destroy(new Error('Download cancelled by user.'));
      },
    });

    const startedAt = Date.now();
    progressInterval = setInterval(() => {
      fs.stat(tempPath, (err, stats) => {
        if (err) return;
        const elapsed = Math.max((Date.now() - startedAt) / 1000, 1);
        const rate = stats.size / elapsed;
        bot.editMessageText(
          `🎬 *${title}*\n📦 ${formatBytes(stats.size)} downloaded\n⚡ ${formatBytes(rate)}/s`,
          { chat_id: chatId, message_id: progressMessage.message_id, parse_mode: 'Markdown' }
        ).catch(() => {});
      });
    }, 3000);

    await pipeline(nodeStream, fs.createWriteStream(tempPath));

    const stats = await fs.promises.stat(tempPath);
    if (stats.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      throw new Error(`File is larger than the configured ${MAX_FILE_SIZE_MB} MB limit.`);
    }

    await bot.sendVideo(chatId, tempPath, {
      caption: `✅ ${title}`,
      duration: duration || undefined,
      supports_streaming: true,
    });
  } catch (error) {
    console.error('Download failed:', error.message);
    await bot.sendMessage(chatId, cancelled ? '🛑 Download cancelled.' : `❌ ${error.message || 'Download failed.'}`).catch(() => {});
  } finally {
    if (progressInterval) clearInterval(progressInterval);
    downloads.delete(chatId);
    if (nodeStream && !nodeStream.destroyed) nodeStream.destroy();
    if (tempPath) await fs.promises.unlink(tempPath).catch(() => {});
  }
}

bot.onText(/^\/yt(?:@\w+)?(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const url = match?.[1]?.trim() || '';
  if (!extractVideoId(url)) {
    await bot.sendMessage(chatId, '❌ Invalid YouTube URL. Usage: /yt <youtube link>');
    return;
  }
  if (downloads.has(chatId)) {
    await bot.sendMessage(chatId, '⏳ You already have a download in progress. Use /cancel to stop it.');
    return;
  }
  await downloadVideo(chatId, url);
});

bot.onText(/^\/cancel(?:@\w+)?$/i, async (msg) => {
  const active = downloads.get(msg.chat.id);
  if (!active) return bot.sendMessage(msg.chat.id, 'ℹ️ You do not have an active download.');
  active.cancel();
  await bot.sendMessage(msg.chat.id, '🛑 Cancelling your download…');
});

bot.onText(/^\/(start|help)(?:@\w+)?$/i, async (msg, match) => {
  if (match?.[1] === 'start') {
    await bot.sendMessage(msg.chat.id, '👋 I\'m TsuyuDL.\n\nUse /yt <youtube link> to download a video.\nUse /cancel to stop a running download.');
    return;
  }
  await bot.sendMessage(msg.chat.id, 'Commands:\n/start - Show instructions\n/help - Show this help\n/yt <youtube link> - Download a YouTube video\n/cancel - Cancel your active download');
});

bot.on('polling_error', (error) => console.error('Telegram polling error:', error.message));
process.on('unhandledRejection', (error) => console.error('Unhandled rejection:', error));
