const DECOR_PRESETS = {
  orb: {
    shapeKind: 'orb',
    color: '#6fa8ff',
    color2: '#d6e5ff',
    opacity: 0.36,
    blur: 28,
    width: 440,
    height: 440,
  },
  ring: {
    shapeKind: 'ring',
    color: '#145bff',
    color2: '#8bb0ff',
    opacity: 0.6,
    blur: 10,
    strokeWidth: 26,
    width: 420,
    height: 420,
  },
  pill: {
    shapeKind: 'pill',
    color: '#111827',
    color2: '#4b5563',
    opacity: 0.2,
    blur: 0,
    cornerRadius: 180,
    width: 520,
    height: 180,
  },
  glow: {
    shapeKind: 'glow',
    color: '#ff65a3',
    color2: '#ffd166',
    opacity: 0.34,
    blur: 34,
    cornerRadius: 28,
    width: 500,
    height: 260,
  },
};

const MOCKUP_PRESETS = {
  realistic: {
    mockupStyle: 'realistic',
    width: 820,
    height: 1680,
    bezel: 26,
    cornerRadius: 120,
    frameColor: '#0f172a',
    accentColor: '#334155',
    screenBg: '#0b0b0b',
    shadowBlur: 46,
    shadowOpacity: 0.34,
  },
  flat: {
    mockupStyle: 'flat',
    width: 800,
    height: 1640,
    bezel: 16,
    cornerRadius: 54,
    frameColor: '#0f172a',
    accentColor: '#0f172a',
    screenBg: '#0b0b0b',
    shadowBlur: 0,
    shadowOpacity: 0,
  },
  rounded: {
    mockupStyle: 'rounded',
    width: 810,
    height: 1660,
    bezel: 22,
    cornerRadius: 164,
    frameColor: '#f8fafc',
    accentColor: '#dbeafe',
    screenBg: '#0b0b0b',
    shadowBlur: 30,
    shadowOpacity: 0.24,
  },
};

export const buildDecorPreset = (kind) => DECOR_PRESETS[kind] || DECOR_PRESETS.orb;

export const buildMockupPreset = (style) => MOCKUP_PRESETS[style] || MOCKUP_PRESETS.realistic;
