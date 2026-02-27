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

function normalizeHexColor(input, fallback = '#000000') {
  if (typeof input !== 'string') {
    return fallback;
  }

  const value = input.trim();
  if (!value.startsWith('#')) {
    return fallback;
  }

  const hex = value.slice(1);

  if (hex.length === 3 || hex.length === 4) {
    const expanded = hex
      .split('')
      .map((char) => char + char)
      .join('')
      .slice(0, 6);
    return `#${expanded}`;
  }

  if (hex.length === 6 || hex.length === 8) {
    return `#${hex.slice(0, 6)}`;
  }

  return fallback;
}

function hexToRgb(hexColor) {
  const normalized = normalizeHexColor(hexColor);
  const value = normalized.slice(1);

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function srgbToLinear(channel) {
  const v = channel / 255;
  if (v <= 0.03928) {
    return v / 12.92;
  }
  return ((v + 0.055) / 1.055) ** 2.4;
}

function getRelativeLuminance(hexColor) {
  const { r, g, b } = hexToRgb(hexColor);
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function getContrastRatio(foregroundHex, backgroundHex) {
  const l1 = getRelativeLuminance(foregroundHex);
  const l2 = getRelativeLuminance(backgroundHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getLayerWarnings(screenshot, devicePreset) {
  if (!screenshot) {
    return [];
  }

  const SAFE_AREA_MARGIN_X = Math.round(devicePreset.width * 0.05);
  const SAFE_AREA_MARGIN_Y = Math.round(devicePreset.height * 0.05);
  const MIN_FONT_SIZE = 42;
  const backgroundColor = normalizeHexColor(screenshot.backgroundColor || '#ffffff', '#ffffff');
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

    const exceedsHeight = bounds.y < 0 || bounds.y + bounds.height > devicePreset.height;
    if (exceedsHeight) {
      warnings.push({
        layerId: layer.id,
        layerName: layer.name,
        type: 'height',
        message: `${layer.name} exceeds vertical bounds.`,
      });
    }

    const violatesSafeArea =
      bounds.x < SAFE_AREA_MARGIN_X ||
      bounds.y < SAFE_AREA_MARGIN_Y ||
      bounds.x + bounds.width > devicePreset.width - SAFE_AREA_MARGIN_X ||
      bounds.y + bounds.height > devicePreset.height - SAFE_AREA_MARGIN_Y;

    if (violatesSafeArea) {
      warnings.push({
        layerId: layer.id,
        layerName: layer.name,
        type: 'safe-area',
        message: `${layer.name} is outside recommended safe area (${SAFE_AREA_MARGIN_X}px/${SAFE_AREA_MARGIN_Y}px margins).`,
      });
    }

    const fontSize = layer.fontSize || 64;
    if (fontSize < MIN_FONT_SIZE) {
      warnings.push({
        layerId: layer.id,
        layerName: layer.name,
        type: 'font-size',
        message: `${layer.name} font size (${Math.round(fontSize)}px) is below recommended minimum (${MIN_FONT_SIZE}px).`,
      });
    }

    const textColor = normalizeHexColor(layer.color || '#101010', '#101010');
    const contrastRatio = getContrastRatio(textColor, backgroundColor);
    const isLargeText = fontSize >= 56;
    const minContrast = isLargeText ? 3 : 4.5;

    if (contrastRatio < minContrast) {
      warnings.push({
        layerId: layer.id,
        layerName: layer.name,
        type: 'contrast',
        message: `${layer.name} has low contrast (${contrastRatio.toFixed(2)}:1). Target at least ${minContrast}:1.`,
      });
    }
  });

  return warnings;
}
