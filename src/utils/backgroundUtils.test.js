import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeHex } from './backgroundUtils.js';

test('normalizeHex', async (t) => {
  await t.test('returns fallback for non-string inputs', () => {
    assert.equal(normalizeHex(null, '#000000'), '#000000');
    assert.equal(normalizeHex(undefined, '#000000'), '#000000');
    assert.equal(normalizeHex(123456, '#000000'), '#000000');
    assert.equal(normalizeHex({}, '#000000'), '#000000');
    assert.equal(normalizeHex([], '#000000'), '#000000');
  });

  await t.test('returns fallback for string without # prefix', () => {
    assert.equal(normalizeHex('ffffff', '#000000'), '#000000');
    assert.equal(normalizeHex('ff0000', '#000000'), '#000000');
    assert.equal(normalizeHex('invalid', '#000000'), '#000000');
  });

  await t.test('trims whitespace from input', () => {
    assert.equal(normalizeHex(' #ff0000 ', '#000000'), '#ff0000');
    assert.equal(normalizeHex('\t#00ff00\n', '#000000'), '#00ff00');
  });

  await t.test('expands 3-character hex to 6-character', () => {
    assert.equal(normalizeHex('#fff', '#000000'), '#ffffff');
    assert.equal(normalizeHex('#f00', '#000000'), '#ff0000');
    assert.equal(normalizeHex('#123', '#000000'), '#112233');
  });

  await t.test('expands 4-character hex to 6-character, dropping the alpha channel', () => {
    assert.equal(normalizeHex('#fffa', '#000000'), '#ffffff');
    assert.equal(normalizeHex('#f008', '#000000'), '#ff0000');
    assert.equal(normalizeHex('#1234', '#000000'), '#112233');
  });

  await t.test('returns 6-character hex unchanged', () => {
    assert.equal(normalizeHex('#ffffff', '#000000'), '#ffffff');
    assert.equal(normalizeHex('#ff0000', '#000000'), '#ff0000');
    assert.equal(normalizeHex('#123456', '#000000'), '#123456');
  });

  await t.test('slices 8-character hex to 6-character, dropping the alpha channel', () => {
    assert.equal(normalizeHex('#ffffffff', '#000000'), '#ffffff');
    assert.equal(normalizeHex('#ff0000aa', '#000000'), '#ff0000');
    assert.equal(normalizeHex('#12345678', '#000000'), '#123456');
  });

  await t.test('returns fallback for invalid hex lengths', () => {
    assert.equal(normalizeHex('#f', '#000000'), '#000000');
    assert.equal(normalizeHex('#ff', '#000000'), '#000000');
    assert.equal(normalizeHex('#fffff', '#000000'), '#000000');
    assert.equal(normalizeHex('#fffffff', '#000000'), '#000000');
    assert.equal(normalizeHex('#fffffffff', '#000000'), '#000000');
  });
});
