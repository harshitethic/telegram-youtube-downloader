import test from 'node:test';
import assert from 'node:assert/strict';
import { startingMessage, progressMessage, formatBytes } from '../lib/messages.js';

test('keeps Markdown-like characters literally in starting messages', () => {
  const title = 'Hello_[demo]* ' + String.fromCharCode(96) + 'episode' + String.fromCharCode(96) + ' [test]';
  assert.equal(startingMessage(title), '🎬 ' + title + '\nStarting download…');
});

test('keeps punctuation literally in progress updates', () => {
  const title = 'Songs_[part 2]*';
  assert.equal(progressMessage(title, 2048, 1024), '🎬 ' + title + '\n📦 2.0 KB downloaded\n⚡ 1.0 KB/s');
});

test('handles large and unknown byte counts', () => {
  assert.equal(formatBytes(1024 * 1024), '1.0 MB');
  assert.equal(formatBytes(NaN), 'unknown size');
});
