// Stop writing as soon as a transfer exceeds the configured disk-size limit.
import { Transform } from 'node:stream';

export function createByteLimit(maxBytes) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) {
    throw new RangeError('maxBytes must be a positive safe integer');
  }

  let total = 0;
  return new Transform({
    transform(chunk, _encoding, callback) {
      if (chunk.length > maxBytes - total) {
        callback(new Error('Download exceeds the configured file-size limit.'));
        return;
      }
      total += chunk.length;
      callback(null, chunk);
    },
  });
}
