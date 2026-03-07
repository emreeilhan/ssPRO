import test from 'node:test';
import assert from 'node:assert';
import { estimateTextHeight } from './layerChecks.js';

test('estimateTextHeight', async (t) => {
  await t.test('default values with no text', () => {
    const layer = {};
    const height = estimateTextHeight(layer);
    // default fontSize=64, lineHeight=1.1, paragraphLines=1
    // height = 1 * 64 * 1.1 = 70.4
    assert.strictEqual(height, 70.4);
  });

  await t.test('single word fitting on one line', () => {
    const layer = { text: 'Hello', fontSize: 64, lineHeight: 1.1, width: 400 };
    // maxCharsPerLine = Math.max(1, Math.floor(400 / (64 * 0.55))) = Math.floor(400 / 35.2) = 11
    // 'Hello' length = 5 <= 11. Lines = 1
    // height = 1 * 64 * 1.1 = 70.4
    const height = estimateTextHeight(layer);
    assert.strictEqual(height, 70.4);
  });

  await t.test('multiple words fitting on one line', () => {
    const layer = { text: 'Hello world', fontSize: 64, lineHeight: 1.1, width: 400 };
    // maxCharsPerLine = 11
    // 'Hello world' length = 11 <= 11. Lines = 1
    const height = estimateTextHeight(layer);
    assert.strictEqual(height, 70.4);
  });

  await t.test('multiple words wrapping to new lines', () => {
    const layer = { text: 'Hello world again', fontSize: 64, lineHeight: 1.1, width: 400 };
    // maxCharsPerLine = 11
    // 'Hello' (5) + ' world' (6) = 11 <= 11
    // next word 'again' (5) -> currentLength + 1 + 5 = 11 + 1 + 5 = 17 > 11. Wrapping to new line.
    // lines = 2
    // height = 2 * 64 * 1.1 = 140.8
    const height = estimateTextHeight(layer);
    assert.strictEqual(height, 140.8);
  });

  await t.test('explicit newlines (\\n)', () => {
    const layer = { text: 'Hello\nworld', fontSize: 64, lineHeight: 1.1, width: 400 };
    // split by \n gives ['Hello', 'world']
    // Each fits on one line.
    // lines = 1 + 1 = 2
    // height = 2 * 64 * 1.1 = 140.8
    const height = estimateTextHeight(layer);
    assert.strictEqual(height, 140.8);
  });

  await t.test('long words exceeding maxCharsPerLine', () => {
    const layer = { text: 'Supercalifragilisticexpialidocious', fontSize: 64, lineHeight: 1.1, width: 400 };
    // maxCharsPerLine = 11
    // The word length is 34.
    // For a single word, it's considered 1 line if it's the only word in the line.
    // Let's check logic:
    // for (const word of words) {
    //   if (!currentLength) { currentLength = word.length; continue; } // currentLength = 34
    // }
    // returns 1 line.
    // height = 1 * 64 * 1.1 = 70.4
    const height = estimateTextHeight(layer);
    assert.strictEqual(height, 70.4);
  });

  await t.test('custom fontSize and lineHeight', () => {
    const layer = { text: 'Test\nnewlines', fontSize: 32, lineHeight: 1.5, width: 400 };
    // split by \n gives ['Test', 'newlines']
    // maxCharsPerLine = Math.floor(400 / (32 * 0.55)) = Math.floor(400 / 17.6) = 22
    // 'Test' (4) <= 22 (1 line)
    // 'newlines' (8) <= 22 (1 line)
    // total lines = 2
    // height = Math.max(32 * 1.5, 2 * 32 * 1.5) = Math.max(48, 96) = 96
    const height = estimateTextHeight(layer);
    assert.strictEqual(height, 96);
  });

  await t.test('empty strings and multiple spaces', () => {
    const layer = { text: '   Hello     world   ', fontSize: 64, lineHeight: 1.1, width: 400 };
    // words = paragraph.split(/\s+/).filter(Boolean)
    // words = ['Hello', 'world']
    // maxCharsPerLine = 11
    // 'Hello world' fits on 1 line.
    const height = estimateTextHeight(layer);
    assert.strictEqual(height, 70.4);
  });

  await t.test('minimum returned height is at least one line', () => {
    const layer = { text: '', fontSize: 30, lineHeight: 1.0, width: 400 };
    // lines = 1
    // height = Math.max(30 * 1.0, 1 * 30 * 1.0) = 30
    const height = estimateTextHeight(layer);
    assert.strictEqual(height, 30);
  });
});
