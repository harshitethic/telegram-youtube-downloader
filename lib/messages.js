/** No Telegram parse_mode: video titles can contain arbitrary Markdown punctuation. */
export function startingMessage(title) {
  return '🎬 ' + title + '\nStarting download…';
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return 'unknown size';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return value.toFixed(value >= 10 ? 0 : 1) + ' ' + units[unit];
}

export function progressMessage(title, size, rate) {
  return '🎬 ' + title + '\n📦 ' + formatBytes(size) +
    ' downloaded\n⚡ ' + formatBytes(rate) + '/s';
}
