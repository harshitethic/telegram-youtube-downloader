/** A chat's reservation must be created before any asynchronous work begins. */
export function reserveDownload(active, chatId) {
  if (active.has(chatId)) return null;
  const slot = {
    cancelled: false,
    stream: null,
    cancel() {
      this.cancelled = true;
      if (this.stream && !this.stream.destroyed) this.stream.destroy();
    },
    attach(stream) {
      this.stream = stream;
      if (this.cancelled && !stream.destroyed) stream.destroy();
    },
  };
  active.set(chatId, slot);
  return slot;
}
