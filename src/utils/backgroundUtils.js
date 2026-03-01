export const DEFAULT_BACKGROUND = {
  type: 'solid',
  color: '#ffffff',
  color2: '#f3f4f6',
  angle: 135,
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function normalizeHex(input, fallback) {
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
      .slice(0, 3)
      .split('')
      .map((char) => char + char)
      .join('');
    return `#${expanded}`;
  }

  if (hex.length === 6 || hex.length === 8) {
    return `#${hex.slice(0, 6)}`;
  }

  return fallback;
}

function normalizeBackgroundType(value) {
  if (value === 'linear' || value === 'radial') {
    return value;
  }
  return 'solid';
}

export function resolveBackgroundConfig(screenshot) {
  const type = normalizeBackgroundType(screenshot?.backgroundType || screenshot?.background?.type);
  const color = normalizeHex(
    screenshot?.backgroundColor || screenshot?.background?.color || DEFAULT_BACKGROUND.color,
    DEFAULT_BACKGROUND.color,
  );
  const color2 = normalizeHex(
    screenshot?.backgroundColor2 || screenshot?.background?.color2 || DEFAULT_BACKGROUND.color2,
    DEFAULT_BACKGROUND.color2,
  );
  const rawAngle = Number(screenshot?.backgroundAngle ?? screenshot?.background?.angle ?? DEFAULT_BACKGROUND.angle);
  const angle = Number.isFinite(rawAngle) ? clamp(rawAngle, 0, 360) : DEFAULT_BACKGROUND.angle;

  return { type, color, color2, angle };
}

export function buildBackgroundRectConfig({ screenshot, width, height }) {
  const background = resolveBackgroundConfig(screenshot);

  if (background.type === 'solid') {
    return { fill: background.color };
  }

  if (background.type === 'linear') {
    const radians = (background.angle * Math.PI) / 180;
    const diagonal = Math.sqrt(width ** 2 + height ** 2);
    const cx = width / 2;
    const cy = height / 2;
    const dx = Math.cos(radians) * (diagonal / 2);
    const dy = Math.sin(radians) * (diagonal / 2);

    return {
      fillLinearGradientStartPoint: { x: cx - dx, y: cy - dy },
      fillLinearGradientEndPoint: { x: cx + dx, y: cy + dy },
      fillLinearGradientColorStops: [0, background.color, 1, background.color2],
    };
  }

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.max(width, height) * 0.82;

  return {
    fillRadialGradientStartPoint: { x: centerX, y: centerY },
    fillRadialGradientStartRadius: 0,
    fillRadialGradientEndPoint: { x: centerX, y: centerY },
    fillRadialGradientEndRadius: radius,
    fillRadialGradientColorStops: [0, background.color, 1, background.color2],
  };
}

function blendHexColors(colorA, colorB, ratio = 0.5) {
  const safeRatio = clamp(ratio, 0, 1);
  const a = normalizeHex(colorA, '#000000').slice(1);
  const b = normalizeHex(colorB, '#000000').slice(1);

  const ar = Number.parseInt(a.slice(0, 2), 16);
  const ag = Number.parseInt(a.slice(2, 4), 16);
  const ab = Number.parseInt(a.slice(4, 6), 16);
  const br = Number.parseInt(b.slice(0, 2), 16);
  const bg = Number.parseInt(b.slice(2, 4), 16);
  const bb = Number.parseInt(b.slice(4, 6), 16);

  const toHex = (value) => Math.round(value).toString(16).padStart(2, '0');
  const rr = ar * (1 - safeRatio) + br * safeRatio;
  const rg = ag * (1 - safeRatio) + bg * safeRatio;
  const rb = ab * (1 - safeRatio) + bb * safeRatio;

  return `#${toHex(rr)}${toHex(rg)}${toHex(rb)}`;
}

export function getBackgroundContrastColor(screenshot) {
  const background = resolveBackgroundConfig(screenshot);

  if (background.type === 'solid') {
    return background.color;
  }

  return blendHexColors(background.color, background.color2, 0.5);
}
