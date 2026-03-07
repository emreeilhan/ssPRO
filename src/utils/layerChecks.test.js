import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getLayerWarnings } from './layerChecks.js';

describe('getLayerWarnings / normalizeHexColor fallbacks', () => {
  const devicePreset = { width: 1000, height: 1000 };

  // Helper to create a basic layer with a specific color
  const createScreenshot = (color) => ({
    backgroundColor: '#101010', // Dark background
    backgroundType: 'solid',
    layers: [
      {
        id: '1',
        name: 'Test Layer',
        type: 'text',
        visible: true,
        color: color,
        text: 'Hello',
        x: 100,
        y: 100,
        width: 200,
        fontSize: 48, // Not large text, requires 4.5 contrast ratio
      },
    ],
  });

  // The background is #101010.
  // The fallback color for text layer in getLayerWarnings is layer.color || '#101010'.
  // Inside normalizeHexColor, it falls back to the provided fallback '#101010'.
  // Contrast of #101010 against #101010 is 1:1, which is < 4.5, so a warning is generated.
  // We check if the expected contrast warning is present, which confirms the fallback color was used.

  test('falls back when color is not a string', () => {
    const screenshot = createScreenshot(null);
    const warnings = getLayerWarnings(screenshot, devicePreset);
    const contrastWarning = warnings.find((w) => w.type === 'contrast');

    assert.ok(contrastWarning, 'Should produce a contrast warning');
    assert.match(contrastWarning.message, /1\.00:1/, 'Contrast should be 1.00:1 indicating fallback was used');
  });

  test('falls back when color does not start with #', () => {
    const screenshot = createScreenshot('123456');
    const warnings = getLayerWarnings(screenshot, devicePreset);
    const contrastWarning = warnings.find((w) => w.type === 'contrast');

    assert.ok(contrastWarning, 'Should produce a contrast warning');
    assert.match(contrastWarning.message, /1\.00:1/, 'Contrast should be 1.00:1 indicating fallback was used');
  });

  test('falls back when hex length is invalid', () => {
    const screenshot = createScreenshot('#12345'); // Invalid length
    const warnings = getLayerWarnings(screenshot, devicePreset);
    const contrastWarning = warnings.find((w) => w.type === 'contrast');

    assert.ok(contrastWarning, 'Should produce a contrast warning');
    assert.match(contrastWarning.message, /1\.00:1/, 'Contrast should be 1.00:1 indicating fallback was used');
  });
});
