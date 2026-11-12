import assert from 'node:assert/strict';
import test from 'node:test';

import { releaseDownload, reserveDownload } from '../download-state.js';

test('reserves each chat before its first asynchronous step', () => {
  const downloads = new Map();
  const first = reserveDownload(downloads, 42);
  assert.ok(first);
  assert.equal(reserveDownload(downloads, 42), null);
  assert.ok(reserveDownload(downloads, 43));
  assert.equal(downloads.get(42), first);
});

test('cancel during metadata setup aborts and closes a later stream', () => {
  const downloads = new Map();
  const task = reserveDownload(downloads, 42);
  let destroyed = 0;
  task.cancel();
  assert.equal(task.cancelled, true);
  assert.throws(() => task.ensureActive(), /Download cancelled/);
  task.bindStream({ destroy: () => { destroyed += 1; } });
  assert.equal(destroyed, 1);
});

test('cancel while streaming destroys once and remains idempotent', () => {
  const downloads = new Map();
  const task = reserveDownload(downloads, 42);
  const errors = [];
  task.bindStream({ destroy: (error) => errors.push(error) });
  task.cancel();
  task.cancel();
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /Download cancelled/);
  releaseDownload(downloads, 42, task);
  assert.equal(downloads.has(42), false);
});

test('finishing an old task never clears a new reservation', () => {
  const downloads = new Map();
  const oldTask = reserveDownload(downloads, 42);
  releaseDownload(downloads, 42, oldTask);
  const nextTask = reserveDownload(downloads, 42);
  releaseDownload(downloads, 42, oldTask);
  assert.equal(downloads.get(42), nextTask);
  releaseDownload(downloads, 42, nextTask);
  assert.equal(downloads.has(42), false);
});
