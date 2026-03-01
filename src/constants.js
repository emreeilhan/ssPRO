export const DEVICE_PRESET = {
  id: 'iphone_6_7',
  label: 'iPhone 6.7 inch',
  width: 1290,
  height: 2796,
  filenameSuffix: '6_7inch',
};

export const MIN_SCREENSHOTS = 5;

export const EXPORT_LOCALES = ['en-US', 'de-DE', 'tr-TR'];

export const BACKGROUND_TYPES = [
  { id: 'solid', label: 'Solid' },
  { id: 'linear', label: 'Linear' },
  { id: 'radial', label: 'Radial' },
];

export const BACKGROUND_PRESETS = [
  {
    id: 'clean-white',
    label: 'Clean White',
    type: 'solid',
    color: '#ffffff',
    color2: '#ffffff',
    angle: 135,
  },
  {
    id: 'soft-gray',
    label: 'Soft Gray',
    type: 'solid',
    color: '#f3f4f6',
    color2: '#f3f4f6',
    angle: 135,
  },
  {
    id: 'deep-night',
    label: 'Deep Night',
    type: 'solid',
    color: '#0f172a',
    color2: '#0f172a',
    angle: 135,
  },
  {
    id: 'sunset-flow',
    label: 'Sunset Flow',
    type: 'linear',
    color: '#ff6b6b',
    color2: '#feca57',
    angle: 135,
  },
  {
    id: 'ocean-breeze',
    label: 'Ocean Breeze',
    type: 'linear',
    color: '#22d3ee',
    color2: '#2563eb',
    angle: 120,
  },
  {
    id: 'mint-shift',
    label: 'Mint Shift',
    type: 'linear',
    color: '#6ee7b7',
    color2: '#14b8a6',
    angle: 35,
  },
  {
    id: 'aurora-glow',
    label: 'Aurora Glow',
    type: 'radial',
    color: '#a5b4fc',
    color2: '#f8fafc',
    angle: 0,
  },
  {
    id: 'lava-core',
    label: 'Lava Core',
    type: 'radial',
    color: '#fb7185',
    color2: '#581c87',
    angle: 0,
  },
];

export const TEXT_FONT_OPTIONS = [
  'IBM Plex Sans',
  'Manrope',
  'DM Sans',
  'Sora',
  'Outfit',
  'Plus Jakarta Sans',
  'Urbanist',
  'Nunito Sans',
  'Poppins',
  'Barlow',
  'Merriweather',
  'Lora',
  'Playfair Display',
  'Bebas Neue',
  'Archivo',
];

export const TYPOGRAPHY_SCALES = [
  {
    id: 'hero',
    label: 'Hero',
    fontSize: 148,
    lineHeight: 1.02,
    width: 1110,
  },
  {
    id: 'subhead',
    label: 'Subhead',
    fontSize: 92,
    lineHeight: 1.1,
    width: 1020,
  },
  {
    id: 'caption',
    label: 'Caption',
    fontSize: 54,
    lineHeight: 1.24,
    width: 960,
  },
];
