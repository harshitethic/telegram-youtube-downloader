import test from 'node:test';
import assert from 'node:assert/strict';
import { PassThrough } from 'node:stream';
import { reserveDownload } from '../lib/download-slot.js';

test('second request for a chat cannot reserve while first is pending', () => {
  const map = new Map();
  const first = reserveDownload(map, 42);
  assert.ok(first);
  assert.equal(reserveDownload(map, 42), null);
  assert.ok(reserveDownload(map, 43));
  assert.equal(map.get(42), first);
});

test('early cancellation is remembered and closes a later-attached stream', () => {
  const map = new Map();
  const slot = reserveDownload(map, 42);
  slot.cancel();
  const stream = new PassThrough();
  slot.attach(stream);
  assert.equal(slot.cancelled, true);
  assert.equal(stream.destroyed, true);
});

test('cancellation closes active stream and preserves independent chats', () => {
  const map = new Map();
  const first = reserveDownload(map, 42);
  const other = reserveDownload(map, 43);
  const stream = new PassThrough();
  first.attach(stream);
  first.cancel();
  assert.equal(stream.destroyed, true);
  assert.equal(other.cancelled, false);
});
