import assert from 'node:assert/strict';
import test from 'node:test';
import { sendDownloadStart, updateDownloadProgress } from '../download-messages.js';

const MARKUP_TITLE = 'The [test](movie) _sample_ *bold* `source`';

test('start message sends an external title literally without Markdown parsing', async () => {
  const observed = [];
  const bot = { sendMessage: (...args) => {
    observed.push(args);
    return Promise.resolve({ message_id: 17 });
  } };
  const result = await sendDownloadStart(bot, 42, MARKUP_TITLE);
  assert.deepEqual(result, { message_id: 17 });
  assert.deepEqual(observed, [[42, `🎬 ${MARKUP_TITLE}\nStarting download…`]]);
});

test('progress edit is plain text and carries only Telegram routing options', async () => {
  const observed = [];
  const bot = { editMessageText: (...args) => {
    observed.push(args);
    return Promise.resolve(true);
  } };
  assert.equal(
    await updateDownloadProgress(bot, 42, 17, MARKUP_TITLE, '12 MB', '3 MB'),
    true,
  );
  assert.deepEqual(observed, [[
    `🎬 ${MARKUP_TITLE}\n📦 12 MB downloaded\n⚡ 3 MB/s`,
    { chat_id: 42, message_id: 17 },
  ]]);
});

test('start and progress display plain titles with punctuation unchanged', async () => {
  const title = 'A [broken * _ Markdown title';
  let startText = '';
  let progressText = '';
  const bot = {
    sendMessage: (_chat, text) => { startText = text; return Promise.resolve({ message_id: 1 }); },
    editMessageText: (text) => { progressText = text; return Promise.resolve(true); },
  };
  await sendDownloadStart(bot, 1, title);
  await updateDownloadProgress(bot, 1, 1, title, '0 B', '0 B');
  assert.ok(startText.includes(title));
  assert.ok(progressText.includes(title));
});
