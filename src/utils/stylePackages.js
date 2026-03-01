import { buildDecorPreset, buildMockupPreset } from './layerPresets';

const STYLE_PACKAGE_CONFIG = {
  'bold-launch': {
    backgroundType: 'linear',
    backgroundColor: '#ff5a3d',
    backgroundColor2: '#ffcc33',
    backgroundAngle: 130,
    text: {
      fontFamily: 'Sora',
      color: '#ffffff',
      lineHeight: 1.02,
    },
    image: {
      opacity: 0.96,
      blendMode: 'normal',
    },
    shape: {
      opacity: 0.46,
      blur: 24,
    },
    shapeByKind: {
      orb: { color: '#ffd8cc', color2: '#ffffff' },
      ring: { color: '#ffffff', color2: '#ff8a66' },
      pill: { color: '#2f1a13', color2: '#7a2d1c' },
      glow: { color: '#ff8a66', color2: '#ffd166' },
    },
    mockup: {
      mockupStyle: 'realistic',
      frameColor: '#1f2937',
      accentColor: '#9ca3af',
      screenBg: '#111827',
      shadowBlur: 56,
      shadowOpacity: 0.4,
    },
    starter: {
      headline: 'Launch Faster.\nShip Sharper.',
      shapeKind: 'glow',
    },
  },
  'minimal-clean': {
    backgroundType: 'solid',
    backgroundColor: '#f5f7fb',
    backgroundColor2: '#f5f7fb',
    backgroundAngle: 0,
    text: {
      fontFamily: 'Manrope',
      color: '#0f172a',
      lineHeight: 1.08,
    },
    image: {
      opacity: 1,
      blendMode: 'normal',
    },
    shape: {
      opacity: 0.18,
      blur: 12,
    },
    shapeByKind: {
      orb: { color: '#cbd5e1', color2: '#f8fafc' },
      ring: { color: '#94a3b8', color2: '#e2e8f0' },
      pill: { color: '#e2e8f0', color2: '#cbd5e1' },
      glow: { color: '#94a3b8', color2: '#e2e8f0' },
    },
    mockup: {
      mockupStyle: 'flat',
      frameColor: '#0f172a',
      accentColor: '#334155',
      screenBg: '#ffffff',
      shadowBlur: 12,
      shadowOpacity: 0.12,
    },
    starter: {
      headline: 'Simple Design.\nClear Message.',
      shapeKind: 'pill',
    },
  },
  'gaming-neon': {
    backgroundType: 'radial',
    backgroundColor: '#7c3aed',
    backgroundColor2: '#0b1120',
    backgroundAngle: 0,
    text: {
      fontFamily: 'Outfit',
      color: '#c4b5fd',
      lineHeight: 1.02,
    },
    image: {
      opacity: 0.92,
      blendMode: 'screen',
    },
    shape: {
      opacity: 0.56,
      blur: 34,
    },
    shapeByKind: {
      orb: { color: '#22d3ee', color2: '#a78bfa' },
      ring: { color: '#06b6d4', color2: '#8b5cf6' },
      pill: { color: '#1e1b4b', color2: '#312e81' },
      glow: { color: '#22d3ee', color2: '#a78bfa' },
    },
    mockup: {
      mockupStyle: 'rounded',
      frameColor: '#0b1120',
      accentColor: '#67e8f9',
      screenBg: '#030712',
      shadowBlur: 62,
      shadowOpacity: 0.54,
    },
    starter: {
      headline: 'Level Up.\nPlay Hard.',
      shapeKind: 'ring',
    },
  },
};

function buildStarterTextLayer({ allocateLayerId, devicePreset, config }) {
  return {
    id: allocateLayerId(),
    type: 'text',
    name: 'Headline 1',
    visible: true,
    locked: false,
    blendMode: 'normal',
    text: config.starter.headline,
    x: 86,
    y: 240,
    width: Math.round(devicePreset.width * 0.82),
    fontSize: 138,
    lineHeight: config.text.lineHeight,
    color: config.text.color,
    align: 'left',
    fontFamily: config.text.fontFamily,
    opacity: 1,
    rotation: 0,
  };
}

function buildStarterShapeLayer({ allocateLayerId, config }) {
  const shapeKind = config.starter.shapeKind || 'orb';
  const preset = buildDecorPreset(shapeKind);
  const shapePatch = config.shapeByKind[shapeKind] || {};

  return {
    id: allocateLayerId(),
    type: 'shape',
    shapeKind,
    name: 'Decor 1',
    visible: true,
    locked: false,
    blendMode: 'normal',
    x: 120,
    y: 1240,
    width: preset.width,
    height: preset.height,
    color: shapePatch.color || preset.color,
    color2: shapePatch.color2 || preset.color2,
    opacity: config.shape.opacity,
    blur: config.shape.blur,
    strokeWidth: preset.strokeWidth || 0,
    cornerRadius: preset.cornerRadius || 0,
    rotation: 0,
  };
}

function buildStarterMockupLayer({ allocateLayerId, devicePreset, config }) {
  const preset = buildMockupPreset(config.mockup.mockupStyle || 'realistic');

  return {
    id: allocateLayerId(),
    type: 'mockup',
    name: 'Mockup 1',
    visible: true,
    locked: false,
    blendMode: 'normal',
    opacity: 1,
    x: Math.round((devicePreset.width - preset.width) / 2),
    y: 740,
    width: preset.width,
    height: preset.height,
    rotation: 0,
    mockupStyle: config.mockup.mockupStyle,
    bezel: preset.bezel,
    cornerRadius: preset.cornerRadius,
    frameColor: config.mockup.frameColor,
    accentColor: config.mockup.accentColor,
    screenBg: config.mockup.screenBg,
    shadowBlur: config.mockup.shadowBlur,
    shadowOpacity: config.mockup.shadowOpacity,
    screenImageSrc: null,
  };
}

function patchShapeLayer(layer, config) {
  const shapeKind = layer.shapeKind || 'orb';
  const shapePatch = config.shapeByKind[shapeKind] || {};
  return {
    ...layer,
    opacity: config.shape.opacity,
    blur: config.shape.blur,
    color: shapePatch.color || layer.color,
    color2: shapePatch.color2 || layer.color2,
  };
}

export function applyStylePackageToScreenshot({
  screenshot,
  packageId,
  allocateLayerId,
  devicePreset,
}) {
  const config = STYLE_PACKAGE_CONFIG[packageId];
  if (!config) {
    return screenshot;
  }

  let nextLayers = screenshot.layers.map((layer) => {
    if (layer.type === 'text') {
      return {
        ...layer,
        fontFamily: config.text.fontFamily,
        color: config.text.color,
        lineHeight: config.text.lineHeight,
      };
    }

    if (layer.type === 'image') {
      return {
        ...layer,
        opacity: config.image.opacity,
        blendMode: config.image.blendMode,
      };
    }

    if (layer.type === 'shape') {
      return patchShapeLayer(layer, config);
    }

    if (layer.type === 'mockup') {
      return {
        ...layer,
        mockupStyle: config.mockup.mockupStyle,
        frameColor: config.mockup.frameColor,
        accentColor: config.mockup.accentColor,
        screenBg: config.mockup.screenBg,
        shadowBlur: config.mockup.shadowBlur,
        shadowOpacity: config.mockup.shadowOpacity,
      };
    }

    return layer;
  });

  if (!nextLayers.length) {
    nextLayers = [
      buildStarterTextLayer({ allocateLayerId, devicePreset, config }),
      buildStarterShapeLayer({ allocateLayerId, config }),
      buildStarterMockupLayer({ allocateLayerId, devicePreset, config }),
    ];
  }

  return {
    ...screenshot,
    backgroundType: config.backgroundType,
    backgroundColor: config.backgroundColor,
    backgroundColor2: config.backgroundColor2,
    backgroundAngle: config.backgroundAngle,
    layers: nextLayers,
  };
}
