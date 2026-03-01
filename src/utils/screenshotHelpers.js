import { MIN_SCREENSHOTS } from '../constants';
import { DEFAULT_BACKGROUND } from './backgroundUtils';

export const buildEmptyScreenshot = (id) => ({
  id,
  backgroundType: DEFAULT_BACKGROUND.type,
  backgroundColor: DEFAULT_BACKGROUND.color,
  backgroundColor2: DEFAULT_BACKGROUND.color2,
  backgroundAngle: DEFAULT_BACKGROUND.angle,
  layers: [],
});

export const createInitialScreenshots = () =>
  Array.from({ length: MIN_SCREENSHOTS }, (_, index) => buildEmptyScreenshot(index + 1));

export const reorderByIndex = (items, fromIndex, toIndex) => {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

export const estimateLayerHeight = (layer) => {
  if (!layer) {
    return 0;
  }

  if (typeof layer.height === 'number') {
    return layer.height;
  }

  if (layer.type === 'text') {
    const text = layer.text || '';
    const lines = text.split('\n').length || 1;
    return Math.max(40, (layer.fontSize || 64) * 1.1 * lines);
  }

  return 0;
};
