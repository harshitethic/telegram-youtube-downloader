# Telegram YouTube Downloader

A Telegram bot built with Node.js that downloads YouTube videos and sends them directly to a Telegram chat.

> ⚠️ Use this project only for content you have permission to download. Respect YouTube's Terms of Service, copyright, and local laws.

## ✨ Features

- 🎬 Download YouTube videos with `/yt <youtube link>`
- 🛑 Cancel an active download with `/cancel`
- 📊 Live download-size and speed updates
- 🧹 Automatic temporary-file cleanup
- 🛡️ YouTube URL validation for watch, shorts, live, embed, and short links
- 📦 MP4 video + audio downloads through `youtubei.js`
- 🚫 Prevents concurrent downloads in the same chat
- ❤️ `/health` endpoint for deployment monitoring
- ⚙️ Configurable port, download directory, and file-size limit
- 🤖 Supports Telegram bot usernames in commands, such as `/yt@YourBot`
- 🧪 GitHub Actions CI checks JavaScript syntax on pushes and pull requests

## 🧰 Tech Stack

- Node.js 18+
- Telegram Bot API
- `node-telegram-bot-api`
- `youtubei.js`
- Express
- dotenv

## 🚀 Getting Started

### 1. Clone

```bash
git clone https://github.com/harshitethic/telegram-youtube-downloader.git
cd telegram-youtube-downloader
```

### 2. Install

```bash
npm install
```

### 3. Configure

Create a bot with [@BotFather](https://t.me/BotFather), then set the token.

Linux / macOS:

```bash
export TELEGRAM_BOT_TOKEN="your-bot-token"
```

Windows PowerShell:

```powershell
$env:TELEGRAM_BOT_TOKEN="your-bot-token"
```

Optional settings:

```bash
export PORT="3948"
export DOWNLOAD_DIR="./downloads"
export MAX_FILE_SIZE_MB="49"
```

The legacy `B` environment variable is still accepted for compatibility, but new deployments should use `TELEGRAM_BOT_TOKEN`.

### 4. Run

```bash
npm start
```

## 📖 Commands

| Command | Description |
| --- | --- |
| `/start` | Show bot instructions |
| `/help` | Show available commands |
| `/yt <youtube link>` | Download a YouTube video |
| `/cancel` | Cancel your active download |

Example:

```text
/yt https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

## 🩺 Health Check

```text
GET /health
```

Example response:

```json
{"status":"ok","service":"telegram-youtube-downloader"}
```

## 🧪 Development

Syntax check:

```bash
npm run check
```

CI runs the same check automatically on pushes and pull requests.

## 🗺️ Roadmap

### v2.0 — Better Downloads

- [x] Migrate from `ytdl-core` to maintained `youtubei.js`
- [x] File-size guard before Telegram upload
- [x] Configurable download directory
- [ ] Audio-only downloads (`/mp3`)
- [ ] Quality selection (`/quality`)
- [ ] Inline quality/format buttons
- [ ] Playlist support with safe limits

### v2.1 — Better UX

- [x] Download cancellation
- [x] Live transfer-speed updates
- [ ] Percentage + ETA when source size is known
- [ ] Download queue
- [ ] Per-user rate limiting
- [ ] Cleaner thumbnails and metadata
- [ ] Friendly error categories for age/region/private videos

### v3.0 — Production

- [x] GitHub Actions CI
- [ ] Automated unit/integration tests
- [ ] Docker image
- [ ] Structured logging
- [ ] Persistent job queue
- [ ] Metrics and monitoring
- [ ] Automatic dependency/security scanning
- [ ] Provider abstraction for future YouTube downloader backends

## 🔐 Security & Privacy

- Never commit your Telegram bot token to Git.
- Never ask users for passwords, private keys, or seed phrases.
- Temporary video files are removed after processing.
- Keep secrets in environment variables or a secret manager in production.

## ⚠️ Limitations

- YouTube can change its internal API, and no unofficial downloader can guarantee permanent compatibility.
- Server IP reputation, regional restrictions, authentication requirements, and YouTube changes can still cause individual videos to fail. `youtubei.js` documents server-IP blocking as a possible cause of failed video-info requests. citeturn216823search5
- Telegram and the configured `MAX_FILE_SIZE_MB` limit can prevent very large videos from being sent.

## 🤝 Contributing

Issues and pull requests are welcome.

Before opening a PR:

```bash
npm install
npm run check
```

## 📄 License

MIT
