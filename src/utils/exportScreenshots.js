import JSZip from 'jszip';
import Konva from 'konva';
import { saveAs } from 'file-saver';
import { getImageSource, getMockupScreenSource } from './imageSources';

const resolveBlendMode = (value) => (value && value !== 'normal' ? value : 'source-over');
const ZIP_PHASE_START_PERCENT = 90;

function throwIfAborted(signal) {
  if (!signal?.aborted) {
    return;
  }

  const error = new Error('Export cancelled.');
  error.name = 'AbortError';
  throw error;
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image load failed during export.'));
    image.src = source;
  });
}

function stageToBlob(stage) {
  return new Promise((resolve, reject) => {
    stage.toBlob({
      mimeType: 'image/png',
      pixelRatio: 1,
      callback: (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error('Failed to generate screenshot blob.'));
      },
    });
  });
}

function drawRoundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawMockup(layer, rootLayer, screenAsset) {
  const style = layer.mockupStyle || 'realistic';
  const width = layer.width;
  const height = layer.height;
  const bezel = layer.bezel || 20;
  const cornerRadius = layer.cornerRadius || 84;
  const topInset = style === 'realistic' ? bezel * 1.7 : bezel * 1.4;
  const sideInset = bezel;
  const bottomInset = bezel * 1.2;
  const screenWidth = Math.max(40, width - sideInset * 2);
  const screenHeight = Math.max(60, height - topInset - bottomInset);
  const screenCornerRadius = Math.max(12, cornerRadius - bezel * 0.8);

  const group = new Konva.Group({
    x: layer.x,
    y: layer.y,
    width,
    height,
    opacity: layer.opacity ?? 1,
    globalCompositeOperation: resolveBlendMode(layer.blendMode),
    rotation: layer.rotation || 0,
  });

  group.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width,
      height,
      cornerRadius,
      fill: layer.frameColor || '#0f172a',
      shadowColor: '#0f172a',
      shadowBlur: layer.shadowBlur || 0,
      shadowOpacity: layer.shadowOpacity || 0,
      shadowOffsetY: style === 'flat' ? 0 : 12,
    }),
  );

  if (style !== 'flat') {
    group.add(
      new Konva.Rect({
        x: bezel * 0.35,
        y: bezel * 0.35,
        width: width - bezel * 0.7,
        height: height - bezel * 0.7,
        cornerRadius: Math.max(10, cornerRadius - bezel * 0.45),
        stroke: layer.accentColor || '#334155',
        strokeWidth: style === 'realistic' ? 1.6 : 1.2,
        opacity: style === 'realistic' ? 0.65 : 0.5,
      }),
    );
  }

  const screenGroup = new Konva.Group({
    x: sideInset,
    y: topInset,
    clipFunc: (ctx) => drawRoundedRectPath(ctx, 0, 0, screenWidth, screenHeight, screenCornerRadius),
  });

  screenGroup.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: screenWidth,
      height: screenHeight,
      cornerRadius: screenCornerRadius,
      fill: layer.screenBg || '#0b0b0b',
    }),
  );

  if (screenAsset) {
    const fitRatio = Math.max(screenWidth / screenAsset.width, screenHeight / screenAsset.height);
    const drawWidth = screenAsset.width * fitRatio;
    const drawHeight = screenAsset.height * fitRatio;

    screenGroup.add(
      new Konva.Image({
        image: screenAsset,
        x: (screenWidth - drawWidth) / 2,
        y: (screenHeight - drawHeight) / 2,
        width: drawWidth,
        height: drawHeight,
      }),
    );
  }

  group.add(screenGroup);

  if (style !== 'flat') {
    const notchWidth = width * 0.26;
    const notchHeight = style === 'realistic' ? bezel * 0.7 : bezel * 0.52;
    group.add(
      new Konva.Rect({
        x: (width - notchWidth) / 2,
        y: bezel * 0.38,
        width: notchWidth,
        height: notchHeight,
        cornerRadius: notchHeight / 2,
        fill: style === 'rounded' ? '#94a3b8' : '#020617',
        opacity: 0.95,
      }),
    );
  }

  rootLayer.add(group);
}

export function buildScreenshotFileName(index, devicePreset) {
  const number = String(index + 1).padStart(2, '0');
  return `screenshot_${number}_${devicePreset.filenameSuffix}.png`;
}

async function renderScreenshotBlob(screenshot, devicePreset) {
  if (devicePreset.width !== 1290 || devicePreset.height !== 2796) {
    throw new Error('Export resolution mismatch. Expected 1290x2796.');
  }

  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'fixed';
  tempContainer.style.left = '-99999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '1px';
  tempContainer.style.height = '1px';
  document.body.appendChild(tempContainer);

  const stage = new Konva.Stage({
    container: tempContainer,
    width: devicePreset.width,
    height: devicePreset.height,
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: devicePreset.width,
      height: devicePreset.height,
      fill: screenshot.backgroundColor || '#ffffff',
    }),
  );

  for (const item of screenshot.layers) {
    if (item.visible === false) {
      continue;
    }

    const imageSource = getImageSource(item);
    if (item.type === 'image' && imageSource) {
      const imageAsset = await loadImage(imageSource);
      layer.add(
        new Konva.Image({
          image: imageAsset,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          opacity: item.opacity ?? 1,
          globalCompositeOperation: resolveBlendMode(item.blendMode),
          rotation: item.rotation || 0,
        }),
      );
    }

    if (item.type === 'text') {
      layer.add(
        new Konva.Text({
          x: item.x,
          y: item.y,
          width: item.width,
          text: item.text || '',
          fontSize: item.fontSize || 64,
          lineHeight: item.lineHeight || 1.1,
          fontFamily: item.fontFamily || 'IBM Plex Sans',
          fill: item.color || '#101010',
          opacity: item.opacity ?? 1,
          globalCompositeOperation: resolveBlendMode(item.blendMode),
          align: item.align || 'left',
          rotation: item.rotation || 0,
        }),
      );
    }

    if (item.type === 'shape' && item.shapeKind === 'orb') {
      layer.add(
        new Konva.Ellipse({
          x: item.x + item.width / 2,
          y: item.y + item.height / 2,
          radiusX: item.width / 2,
          radiusY: item.height / 2,
          fillRadialGradientStartPoint: { x: 0, y: 0 },
          fillRadialGradientStartRadius: 0,
          fillRadialGradientEndPoint: { x: 0, y: 0 },
          fillRadialGradientEndRadius: Math.max(item.width, item.height) / 2,
          fillRadialGradientColorStops: [0, item.color2 || '#d6e5ff', 1, item.color || '#6fa8ff'],
          opacity: item.opacity ?? 0.35,
          globalCompositeOperation: resolveBlendMode(item.blendMode),
          shadowColor: item.color || '#6fa8ff',
          shadowBlur: item.blur || 28,
          shadowOpacity: 0.45,
          rotation: item.rotation || 0,
        }),
      );
    }

    if (item.type === 'shape' && item.shapeKind === 'ring') {
      layer.add(
        new Konva.Ellipse({
          x: item.x + item.width / 2,
          y: item.y + item.height / 2,
          radiusX: item.width / 2,
          radiusY: item.height / 2,
          stroke: item.color || '#145bff',
          strokeWidth: item.strokeWidth || 20,
          opacity: item.opacity ?? 0.6,
          globalCompositeOperation: resolveBlendMode(item.blendMode),
          shadowColor: item.color2 || item.color || '#145bff',
          shadowBlur: item.blur || 10,
          shadowOpacity: 0.5,
          rotation: item.rotation || 0,
        }),
      );
    }

    if (item.type === 'shape' && item.shapeKind === 'pill') {
      layer.add(
        new Konva.Rect({
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          cornerRadius: item.cornerRadius || Math.min(item.height, item.width) / 2,
          fillLinearGradientStartPoint: { x: 0, y: 0 },
          fillLinearGradientEndPoint: { x: item.width, y: 0 },
          fillLinearGradientColorStops: [0, item.color || '#111827', 1, item.color2 || '#4b5563'],
          opacity: item.opacity ?? 0.2,
          globalCompositeOperation: resolveBlendMode(item.blendMode),
          rotation: item.rotation || 0,
        }),
      );
    }

    if (item.type === 'shape' && item.shapeKind === 'glow') {
      layer.add(
        new Konva.Rect({
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          cornerRadius: item.cornerRadius || 24,
          fillLinearGradientStartPoint: { x: 0, y: 0 },
          fillLinearGradientEndPoint: { x: item.width, y: item.height },
          fillLinearGradientColorStops: [0, item.color || '#ff65a3', 1, item.color2 || '#ffd166'],
          opacity: item.opacity ?? 0.34,
          globalCompositeOperation: resolveBlendMode(item.blendMode),
          shadowColor: item.color || '#ff65a3',
          shadowBlur: item.blur || 34,
          shadowOpacity: 0.7,
          rotation: item.rotation || 0,
        }),
      );
    }

    if (item.type === 'mockup') {
      let screenAsset = null;
      const screenSource = getMockupScreenSource(item);
      if (screenSource) {
        screenAsset = await loadImage(screenSource);
      }
      drawMockup(item, layer, screenAsset);
    }
  }

  layer.draw();
  const blob = await stageToBlob(stage);

  stage.destroy();
  tempContainer.remove();

  return blob;
}

export async function exportSingleScreenshot({ screenshot, index, devicePreset, signal }) {
  throwIfAborted(signal);
  const blob = await renderScreenshotBlob(screenshot, devicePreset);
  throwIfAborted(signal);
  saveAs(blob, buildScreenshotFileName(index, devicePreset));
}

export async function exportAllScreenshots({
  screenshots,
  devicePreset,
  locales = [],
  signal,
  onProgress,
}) {
  throwIfAborted(signal);
  const zip = new JSZip();
  const localeList = Array.isArray(locales) && locales.length > 0 ? locales : ['en-US'];
  const deviceFolder = devicePreset.filenameSuffix;
  const total = screenshots.length;

  for (let i = 0; i < screenshots.length; i += 1) {
    throwIfAborted(signal);
    const blob = await renderScreenshotBlob(screenshots[i], devicePreset);
    throwIfAborted(signal);
    const screenshotName = buildScreenshotFileName(i, devicePreset);

    for (const locale of localeList) {
      zip.file(`Root/${locale}/${deviceFolder}/${screenshotName}`, blob);
    }

    const renderPercent = total > 0 ? Math.round(((i + 1) / total) * ZIP_PHASE_START_PERCENT) : 0;
    onProgress?.({
      phase: 'render',
      current: i + 1,
      total,
      percent: renderPercent,
      message: `Rendering ${i + 1}/${total}`,
    });
  }

  throwIfAborted(signal);
  const zipBlob = await zip.generateAsync(
    { type: 'blob' },
    (metadata) => {
      const zipPercent = Math.round(
        ZIP_PHASE_START_PERCENT + (metadata.percent / 100) * (100 - ZIP_PHASE_START_PERCENT),
      );
      onProgress?.({
        phase: 'zip',
        current: total,
        total,
        percent: Math.min(100, zipPercent),
        message: `Packaging ZIP ${Math.round(metadata.percent)}%`,
      });
    },
  );
  throwIfAborted(signal);
  saveAs(zipBlob, `app_store_screenshots_${devicePreset.filenameSuffix}.zip`);
}
