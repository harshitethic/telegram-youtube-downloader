// Reserve a per-chat download before asynchronous metadata and stream setup.
export function reserveDownload(downloads, chatId) {
  if (downloads.has(chatId)) return null;

  let cancelled = false;
  let stream;
  const task = {
    get cancelled() {
      return cancelled;
    },
    ensureActive() {
      if (cancelled) throw new Error('Download cancelled by user.');
    },
    bindStream(nextStream) {
      stream = nextStream;
      if (cancelled) stream.destroy();
    },
    cancel() {
      if (cancelled) return;
      cancelled = true;
      stream?.destroy(new Error('Download cancelled by user.'));
    },
  };
  downloads.set(chatId, task);
  return task;
}

export function releaseDownload(downloads, chatId, task) {
  // An older task must never remove a newer task's reservation.
  if (downloads.get(chatId) === task) downloads.delete(chatId);
}
