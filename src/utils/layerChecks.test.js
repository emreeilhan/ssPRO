import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getLayerWarnings } from './layerChecks.js';

describe('normalizeHexColor fallbacks (via getLayerWarnings)', () => {
  const devicePreset = { width: 1000, height: 1000 };

  // Creates a screenshot with a valid background and a single text layer
  // with a specific color to test normalization
  const createScreenshotWithColor = (color) => ({
    background: { type: 'solid', color: '#000000' }, // Dark background
    layers: [
      {
        id: '1',
        name: 'TestText',
        type: 'text',
        visible: true,
        text: 'Test',
        x: 100,
        y: 100,
        width: 200,
        fontSize: 64,
        color: color,
      }
    ]
  });

  test('falls back to #101010 for non-string input', () => {
    // A non-string color should fallback to #101010, which against a dark background
    // (#000000) will trigger a contrast warning (1.00:1 contrast)
    const screenshot = createScreenshotWithColor(123456);
    const warnings = getLayerWarnings(screenshot, devicePreset);

    const contrastWarning = warnings.find(w => w.type === 'contrast');
    assert.ok(contrastWarning, 'Should have a contrast warning');
    assert.match(contrastWarning.message, /1\.10:1/, 'Contrast should match fallback #101010 against #000000');
  });

  test('falls back to #101010 for string not starting with #', () => {
    // A string without # should fallback to #101010
    const screenshot = createScreenshotWithColor('ffffff'); // Note missing #
    const warnings = getLayerWarnings(screenshot, devicePreset);

    const contrastWarning = warnings.find(w => w.type === 'contrast');
    assert.ok(contrastWarning, 'Should have a contrast warning');
    assert.match(contrastWarning.message, /1\.10:1/, 'Contrast should match fallback #101010 against #000000');
  });

  test('falls back to #101010 for invalid hex length', () => {
    // An invalid length hex should fallback to #101010
    const screenshot = createScreenshotWithColor('#12'); // Too short
    const warnings = getLayerWarnings(screenshot, devicePreset);

    const contrastWarning = warnings.find(w => w.type === 'contrast');
    assert.ok(contrastWarning, 'Should have a contrast warning');
    assert.match(contrastWarning.message, /1\.10:1/, 'Contrast should match fallback #101010 against #000000');
  });

  test('correctly normalizes valid hex colors', () => {
    // A valid hex color should be used correctly, causing no warning against dark background
    const screenshot = createScreenshotWithColor('#ffffff'); // Valid white
    const warnings = getLayerWarnings(screenshot, devicePreset);

    const contrastWarning = warnings.find(w => w.type === 'contrast');
    assert.strictEqual(contrastWarning, undefined, 'Should not have a contrast warning with valid bright color');
  });
});
