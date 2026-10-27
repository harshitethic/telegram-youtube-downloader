import test from 'node:test';
import assert from 'node:assert/strict';
import { readBoundedInteger } from '../lib/config.js';

const port = { name: 'PORT', fallback: 3948, min: 1, max: 65535 };
const size = { name: 'MAX_FILE_SIZE_MB', fallback: 49, min: 1, max: 2048 };

test('defaults only when the setting is absent or empty', () => {
  assert.equal(readBoundedInteger(undefined, port), 3948);
  assert.equal(readBoundedInteger('', size), 49);
});

test('accepts safe integer settings at exact bounds', () => {
  assert.equal(readBoundedInteger('1', port), 1);
  assert.equal(readBoundedInteger('65535', port), 65535);
  assert.equal(readBoundedInteger('2048', size), 2048);
});

test('rejects noninteger and out-of-range configurations', () => {
  for (const value of ['abc', '0', '-10', '65536', 'Infinity', 'NaN', '1.5', '9007199254740992']) {
    assert.throws(() => readBoundedInteger(value, port), RangeError, value);
  }
});

test('rejects invalid file-size configurations', () => {
  for (const value of ['0', '-1', '2049', '0.25', 'Infinity']) {
    assert.throws(() => readBoundedInteger(value, size), RangeError, value);
  }
});
