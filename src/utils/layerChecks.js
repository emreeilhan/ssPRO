export function estimateTextHeight(layer) {
  const text = layer.text || '';
  const fontSize = layer.fontSize || 64;
  const lineHeight = layer.lineHeight || 1.1;
  const maxCharsPerLine = Math.max(1, Math.floor((layer.width || 400) / (fontSize * 0.55)));

  const paragraphLines = text
    .split('\n')
    .map((paragraph) => {
      const words = paragraph.split(/\s+/).filter(Boolean);

      if (!words.length) {
        return 1;
      }

      let lines = 1;
      let currentLength = 0;

      for (const word of words) {
        if (!currentLength) {
          currentLength = word.length;
          continue;
        }

        const nextLength = currentLength + 1 + word.length;
        if (nextLength <= maxCharsPerLine) {
          currentLength = nextLength;
        } else {
          lines += 1;
          currentLength = word.length;
        }
      }

      return lines;
    })
    .reduce((sum, lineCount) => sum + lineCount, 0);

  return Math.max(fontSize * lineHeight, paragraphLines * fontSize * lineHeight);
}

export function getTextBounds(layer) {
  const width = layer.width || 400;
  const height = estimateTextHeight(layer);

  return {
    x: layer.x || 0,
    y: layer.y || 0,
    width,
    height,
  };
}

export function getLayerWarnings(screenshot, devicePreset) {
  if (!screenshot) {
    return [];
  }

  const warnings = [];

  screenshot.layers.forEach((layer) => {
    if (layer.type !== 'text' || layer.visible === false) {
      return;
    }

    const bounds = getTextBounds(layer);

    const exceedsWidth = bounds.x < 0 || bounds.x + bounds.width > devicePreset.width;
    if (exceedsWidth) {
      warnings.push({
        layerId: layer.id,
        layerName: layer.name,
        type: 'width',
        message: `${layer.name} exceeds horizontal bounds.`,
      });
    }
  });

  return warnings;
}
