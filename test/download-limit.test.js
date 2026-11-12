import assert from 'node:assert/strict';
import test from 'node:test';
import { Readable, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createByteLimit } from '../download-limit.js';

async function transfer(chunks, limit) {
  const written = [];
  const target = new Writable({
    write(chunk, _encoding, next) {
      written.push(Buffer.from(chunk));
      next();
    },
  });
  await pipeline(Readable.from(chunks.map((c) => Buffer.from(c))), createByteLimit(limit), target);
  return Buffer.concat(written).toString();
}

test('permits files exactly at configured byte limit', async () => {
  assert.equal(await transfer(['hello', ' world'], 11), 'hello world');
});

test('rejects overflowing download before passing the excessive chunk to disk', async () => {
  const written = [];
  const target = new Writable({
    write(chunk, _encoding, next) {
      written.push(Buffer.from(chunk));
      next();
    },
  });
  await assert.rejects(
    pipeline(
      Readable.from([Buffer.from('hello'), Buffer.from(' world')]),
      createByteLimit(10),
      target,
    ),
    /exceeds the configured file-size limit/,
  );
  assert.equal(Buffer.concat(written).toString(), 'hello');
});

test('rejects a single oversized chunk without writing any bytes', async () => {
  await assert.rejects(transfer(['large'], 2), /file-size limit/);
});

test('rejects invalid limits', () => {
  for (const value of [0, -1, NaN, Infinity, 2.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => createByteLimit(value), RangeError);
  }
});
