const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const port = Number(process.env.PORT) || 3948;
const token = process.env.TELEGRAM_BOT_TOKEN || process.env.B;

if (!token) {
  throw new Error('Missing TELEGRAM_BOT_TOKEN environment variable.');
}

const app = express();
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

const bot = new TelegramBot(token, { polling: true });
const downloads = new Map();

const safeTitle = (title) =>
  title.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').replace(/\s+/g, ' ').trim().slice(0, 80) || 'video';

const downloadVideo = async (chatId, url) => {
  let tempPath;
  let updateInterval;

  try {
    const videoInfo = await ytdl.getInfo(url);
    const details = videoInfo.videoDetails;
    const title = details.title || 'video';
    const fileName = `${safeTitle(title)}-${crypto.randomUUID()}.mp4`;
    tempPath = path.join(__dirname, fileName);

    const progressMessage = await bot.sendMessage(
      chatId,
      `*Downloading video:* ${title}`,
      { parse_mode: 'Markdown' }
    );

    const downloadStream = ytdl(url, {
      filter: 'audioandvideo',
      quality: 'highest',
    });
    const writeStream = fs.createWriteStream(tempPath);

    downloads.set(chatId, { tempPath, stream: downloadStream });

    updateInterval = setInterval(() => {
      const progress = writeStream.bytesWritten / (1024 * 1024);
      bot.editMessageText(
        `*Downloading video:* ${title} (${progress.toFixed(2)} MB) 📦`,
        {
          chat_id: chatId,
          message_id: progressMessage.message_id,
          parse_mode: 'Markdown',
        }
      ).catch((error) => console.error('Progress update failed:', error.message));
    }, 2000);

    await new Promise((resolve, reject) => {
      downloadStream.on('error', reject);
      writeStream.on('error', reject);
      writeStream.on('finish', resolve);
      downloadStream.pipe(writeStream);
    });

    clearInterval(updateInterval);
    updateInterval = undefined;

    await bot.sendVideo(chatId, tempPath, {
      caption: `*Video downloaded:* ${title}`,
      duration: Number(details.lengthSeconds) || undefined,
      parse_mode: 'Markdown',
    });
  } catch (error) {
    console.error('Download failed:', error);
    await bot.sendMessage(chatId, '❌ Error downloading that video. Please try again later.');
  } finally {
    if (updateInterval) clearInterval(updateInterval);
    downloads.delete(chatId);

    if (tempPath) {
      await fs.promises.unlink(tempPath).catch(() => {});
    }
  }
};

bot.onText(/^\/yt(?:@\w+)?(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const url = match && match[1] ? match[1].trim() : '';

  if (!url || !ytdl.validateURL(url)) {
    await bot.sendMessage(chatId, '❌ Invalid YouTube URL. Usage: /yt <youtube link>');
    return;
  }

  if (downloads.has(chatId)) {
    await bot.sendMessage(chatId, '⏳ You already have a download in progress.');
    return;
  }

  await downloadVideo(chatId, url);
});

bot.onText(/^\/start(?:@\w+)?$/i, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    'Hey! I am TsuyuDL. Send /yt followed by a YouTube link and I will download the video for you.'
  );
});

bot.onText(/^\/help(?:@\w+)?$/i, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    'Commands:\n/start - Show instructions\n/help - Show this help\n/yt <youtube link> - Download a YouTube video'
  );
});

bot.on('polling_error', (error) => {
  console.error('Telegram polling error:', error.message);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});
