// Video titles originate outside this bot. Send them as literal text so
// Telegram Markdown/HTML parsers cannot reject titles containing syntax.
export function sendDownloadStart(bot, chatId, title) {
  return bot.sendMessage(chatId, `🎬 ${title}\nStarting download…`);
}

export function updateDownloadProgress(bot, chatId, messageId, title, bytes, rate) {
  return bot.editMessageText(
    `🎬 ${title}\n📦 ${bytes} downloaded\n⚡ ${rate}/s`,
    { chat_id: chatId, message_id: messageId },
  );
}
