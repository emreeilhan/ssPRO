import JSZip from 'jszip';
import Konva from 'konva';
import { saveAs } from 'file-saver';

function dataUrlToBlob(dataUrl) {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const array = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    array[i] = binary.charCodeAt(i);
  }

  return new Blob([array], { type: mime });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image load failed during export.'));
    image.src = dataUrl;
  });
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

    if (item.type === 'image' && item.dataUrl) {
      const imageAsset = await loadImage(item.dataUrl);
      layer.add(
        new Konva.Image({
          image: imageAsset,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
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
          shadowColor: item.color || '#ff65a3',
          shadowBlur: item.blur || 34,
          shadowOpacity: 0.7,
          rotation: item.rotation || 0,
        }),
      );
    }
  }

  layer.draw();
  const dataUrl = stage.toDataURL({
    mimeType: 'image/png',
    pixelRatio: 1,
  });

  stage.destroy();
  tempContainer.remove();

  return dataUrlToBlob(dataUrl);
}

export async function exportSingleScreenshot({ screenshot, index, devicePreset }) {
  const blob = await renderScreenshotBlob(screenshot, devicePreset);
  saveAs(blob, buildScreenshotFileName(index, devicePreset));
}

export async function exportAllScreenshots({ screenshots, devicePreset, locales = [] }) {
  const zip = new JSZip();
  const localeList = Array.isArray(locales) && locales.length > 0 ? locales : ['en-US'];
  const deviceFolder = devicePreset.filenameSuffix;

  for (let i = 0; i < screenshots.length; i += 1) {
    const blob = await renderScreenshotBlob(screenshots[i], devicePreset);
    const screenshotName = buildScreenshotFileName(i, devicePreset);

    for (const locale of localeList) {
      zip.file(`Root/${locale}/${deviceFolder}/${screenshotName}`, blob);
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `app_store_screenshots_${devicePreset.filenameSuffix}.zip`);
}
