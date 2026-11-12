import assert from 'node:assert/strict';
import test from 'node:test';

import { extractVideoId } from '../video-url.js';

const VIDEO_ID = 'dQw4w9WgXcQ';

test('accepts genuine YouTube video URL formats', () => {
  const links = [
    'https://youtube.com/watch?v=' + VIDEO_ID,
    'https://www.youtube.com/watch?v=' + VIDEO_ID + '&t=42',
    'http://m.youtube.com/watch?v=' + VIDEO_ID,
    'https://music.youtube.com/watch?v=' + VIDEO_ID,
    'https://youtube.com/shorts/' + VIDEO_ID,
    'https://www.youtube.com/embed/' + VIDEO_ID,
    'https://www.youtube.com/live/' + VIDEO_ID,
    'https://youtu.be/' + VIDEO_ID + '?t=42',
  ];
  for (const link of links) {
    assert.equal(extractVideoId(link), VIDEO_ID, link);
  }
});

test('rejects lookalike YouTube hosts and credential tricks', () => {
  const links = [
    'https://notyoutube.com/watch?v=' + VIDEO_ID,
    'https://fakeyoutube.com/watch?v=' + VIDEO_ID,
    'https://youtube.com.evil.example/watch?v=' + VIDEO_ID,
    'https://youtube.com@notyoutube.com/watch?v=' + VIDEO_ID,
    'https://youtu.be.evil.example/' + VIDEO_ID,
  ];
  for (const link of links) {
    assert.equal(extractVideoId(link), null, link);
  }
});

test('rejects non-web protocols and invalid video IDs', () => {
  const links = [
    'ftp://youtube.com/watch?v=' + VIDEO_ID,
    'javascript:alert(1)',
    'not a URL',
    'https://youtube.com/watch?v=short',
    'https://youtube.com/watch?v=dQw4w9WgXcQextra',
    'https://youtu.be/',
    'https://youtube.com/watch',
    '',
    null,
    undefined,
  ];
  for (const link of links) {
    assert.equal(extractVideoId(link), null, String(link));
  }
});
