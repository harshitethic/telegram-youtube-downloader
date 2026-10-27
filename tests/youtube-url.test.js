import test from 'node:test';
import assert from 'node:assert/strict';
import { extractVideoId } from '../lib/youtube-url.js';

const id = 'dQw4w9WgXcQ';

test('accepts canonical and supported YouTube link formats', () => {
  for (const url of [
    'https://www.youtube.com/watch?v=' + id + '&t=10',
    'https://youtube.com/watch?v=' + id,
    'https://m.youtube.com/watch?v=' + id,
    'https://youtu.be/' + id + '?si=something',
    'https://youtube.com/shorts/' + id,
    'https://www.youtube.com/embed/' + id,
    'https://www.youtube.com/live/' + id,
  ]) assert.equal(extractVideoId(url), id, url);
});

test('rejects lookalike domains and unsupported URL schemes', () => {
  for (const url of [
    'https://evil-youtube.com/watch?v=' + id,
    'https://notyoutube.com/watch?v=' + id,
    'https://youtube.com.evil.invalid/watch?v=' + id,
    'https://youtube.com@evil.invalid/watch?v=' + id,
    'ftp://youtube.com/watch?v=' + id,
    'javascript://youtube.com/watch?v=' + id,
  ]) assert.equal(extractVideoId(url), null, url);
});

test('rejects invalid IDs and unrelated paths', () => {
  for (const url of [
    'https://youtu.be/not-valid',
    'https://youtube.com/watch?v=' + id + 'EXTRA',
    'https://youtube.com/watch?v=',
    'https://youtube.com/channel/' + id,
    'https://youtube.com/shorts/' + id + '/extra',
    'not a URL',
  ]) assert.equal(extractVideoId(url), null, url);
});
