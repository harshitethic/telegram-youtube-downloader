import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createByteLimiter } from '../lib/byte-limit.js';

async function collect(chunks, maxBytes) {
  const received = [];
  await pipeline(
    Readable.from(chunks),
    createByteLimiter(maxBytes),
    new Writable({ write(chunk, _encoding, done) { received.push(chunk); done(); } }),
  );
  return Buffer.concat(received);
}

test('passes an exact-limit multi-chunk download', async () => {
  assert.equal((await collect([Buffer.alloc(4), Buffer.alloc(6)], 10)).length, 10);
});

test('aborts a download as soon as its next chunk exceeds the limit', async () => {
  await assert.rejects(
    collect([Buffer.alloc(4), Buffer.alloc(7)], 10),
    /exceeds the configured file size limit/,
  );
});

test('rejects invalid budgets before reading', () => {
  for (const limit of [0, -1, Infinity, NaN, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => createByteLimiter(limit), RangeError);
  }
});

test('allows an empty stream without inventing bytes', async () => {
  assert.equal((await collect([], 1)).length, 0);
});
