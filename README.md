# Telegram YouTube Downloader

A lightweight Telegram bot built with Node.js that downloads YouTube videos and sends them directly to a Telegram chat.

> ⚠️ Use this project only for content you have permission to download. Respect YouTube's Terms of Service, copyright, and local laws.

## ✨ Features

- 🎬 Download YouTube videos with `/yt <youtube link>`
- 📦 Sends the downloaded video directly to Telegram
- 📊 Shows download progress in the chat
- 🧹 Automatically removes temporary files after sending
- 🛡️ Validates YouTube URLs before downloading
- 🔒 Uses environment variables for the bot token
- 🚫 Prevents multiple downloads at the same time in one chat
- ❤️ Includes a lightweight `/health` endpoint for deployment monitoring
- ⚙️ Configurable server port through `PORT`
- 🤖 Supports Telegram bot usernames in commands, such as `/yt@YourBot`

## 🧰 Tech Stack

- Node.js
- Telegram Bot API
- `node-telegram-bot-api`
- `ytdl-core`
- Express
- dotenv

## 📁 Project Structure

```text
telegram-youtube-downloader/
├── index.js
├── package.json
├── package-lock.json
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/harshitethic/telegram-youtube-downloader.git
cd telegram-youtube-downloader
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a Telegram bot

Create a bot with [@BotFather](https://t.me/BotFather) and copy the bot token.

Set the token as an environment variable. The preferred variable is `TELEGRAM_BOT_TOKEN`.

### Linux / macOS

```bash
export TELEGRAM_BOT_TOKEN="your-bot-token"
```

### Windows PowerShell

```powershell
$env:TELEGRAM_BOT_TOKEN="your-bot-token"
```

### 4. Start the bot

```bash
npm start
```

The default health server runs on port `3948`. Change it with `PORT` when deploying.

## 📖 Commands

| Command | Description |
| --- | --- |
| `/start` | Show bot instructions |
| `/help` | Show available commands |
| `/yt <youtube link>` | Download a YouTube video |

### Example

```text
/yt https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

## 🔧 Configuration

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | Yes | — | Telegram bot token from BotFather |
| `PORT` | No | `3948` | Port used by the health server |

For backwards compatibility, the current code also accepts the older `B` variable, but new deployments should use `TELEGRAM_BOT_TOKEN`.

## 🩺 Health Check

The bot exposes:

```text
GET /health
```

Example response:

```json
{"status":"ok"}
```

This can be used with hosting-platform health checks or uptime monitoring.

## 🧪 Development

Check the JavaScript syntax before committing:

```bash
npm run check
```

## 🗺️ Roadmap

### v1.x — Stability

- [x] Safer credential handling
- [x] URL validation
- [x] Download progress updates
- [x] Temporary-file cleanup
- [x] Error handling for download/write streams
- [x] Health endpoint
- [ ] Add automated tests
- [ ] Add GitHub Actions CI

### v2.0 — Better Downloads

- [ ] Audio-only downloads (`/mp3`)
- [ ] Quality selection (`/quality`)
- [ ] User-friendly format selection with inline buttons
- [ ] Download size/file-size checks before starting
- [ ] Better handling of videos that exceed Telegram upload limits
- [ ] Configurable temporary download directory

### v2.1 — User Experience

- [ ] Cancel an active download with `/cancel`
- [ ] Queue downloads instead of rejecting concurrent requests
- [ ] Progress percentage and estimated remaining time
- [ ] Cleaner video metadata and thumbnails
- [ ] Per-user usage limits and basic rate limiting

### v3.0 — Production Readiness

- [ ] Persistent job queue (Redis or equivalent)
- [ ] Structured logging
- [ ] Metrics and monitoring
- [ ] Docker image and deployment guide
- [ ] Automatic dependency/security checks
- [ ] Better provider abstraction so the downloader backend can be replaced when `ytdl-core` compatibility changes

## 🔐 Security & Privacy

- Never commit your Telegram bot token to Git.
- Never ask users for passwords, private keys, or seed phrases.
- Temporary video files are deleted after processing.
- Keep credentials in environment variables or a secret manager in production.

## ⚠️ Limitations

- YouTube can change its internals and break downloader libraries such as `ytdl-core`.
- Telegram imposes file-size and upload constraints that can prevent very large videos from being sent.
- Download speed depends on the source video, network connection, hosting environment, and Telegram upload speed.

## 🤝 Contributing

Issues and pull requests are welcome. For larger changes, open an issue first so the proposed approach can be discussed.

Before opening a PR:

```bash
npm install
npm run check
```

## 📄 License

ISC

---

Built with Node.js and the Telegram Bot API.