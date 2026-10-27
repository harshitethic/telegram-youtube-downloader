import { Transform } from 'node:stream';

/** Abort a stream before it writes beyond the configured byte budget. */
export function createByteLimiter(maxBytes) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) {
    throw new RangeError('Maximum download size must be a positive safe integer');
  }
  let received = 0;
  return new Transform({
    transform(chunk, encoding, callback) {
      const length = Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk, encoding);
      if (length > maxBytes - received) {
        callback(new Error('Download exceeds the configured file size limit.'));
        return;
      }
      received += length;
      callback(null, chunk);
    },
  });
}
