import { getImageSource, getMockupScreenSource } from './imageSources';

const PROJECT_SCHEMA = 'sspro.project';
const PROJECT_VERSION = 1;

function isDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:');
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to encode image for project export.'));
    reader.readAsDataURL(blob);
  });
}

async function sourceToDataUrl(source) {
  if (!source) {
    return null;
  }

  if (isDataUrl(source)) {
    return source;
  }

  const response = await fetch(source);
  if (!response.ok) {
    throw new Error('Failed to read image source for project export.');
  }

  const blob = await response.blob();
  return blobToDataUrl(blob);
}

async function dataUrlToObjectUrl(dataUrl) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return window.URL.createObjectURL(blob);
}

export async function serializeProject({ screenshots, activeScreenshotId }) {
  const serializedScreenshots = await Promise.all(
    screenshots.map(async (shot) => {
      const serializedLayers = await Promise.all(
        shot.layers.map(async (layer) => {
          const nextLayer = { ...layer };
          delete nextLayer.dataUrl;
          delete nextLayer.screenDataUrl;

          if (layer.type === 'image') {
            nextLayer.imageSrc = await sourceToDataUrl(getImageSource(layer));
          }

          if (layer.type === 'mockup') {
            nextLayer.screenImageSrc = await sourceToDataUrl(getMockupScreenSource(layer));
          }

          return nextLayer;
        }),
      );

      return {
        ...shot,
        layers: serializedLayers,
      };
    }),
  );

  return {
    schema: PROJECT_SCHEMA,
    version: PROJECT_VERSION,
    exportedAt: new Date().toISOString(),
    activeScreenshotId,
    screenshots: serializedScreenshots,
  };
}

export async function hydrateProject(rawProject) {
  if (!rawProject || rawProject.schema !== PROJECT_SCHEMA || rawProject.version !== PROJECT_VERSION) {
    throw new Error('Invalid project file format.');
  }

  if (!Array.isArray(rawProject.screenshots) || rawProject.screenshots.length === 0) {
    throw new Error('Project file has no screenshots.');
  }

  const screenshots = await Promise.all(
    rawProject.screenshots.map(async (shot) => {
      const layers = await Promise.all(
        (shot.layers || []).map(async (layer) => {
          const nextLayer = { ...layer };
          const imageSource = getImageSource(layer);
          const screenSource = getMockupScreenSource(layer);

          if (layer.type === 'image') {
            if (imageSource && !isDataUrl(imageSource)) {
              throw new Error('Project image source is not portable. Please re-export project.');
            }

            nextLayer.imageSrc = imageSource ? await dataUrlToObjectUrl(imageSource) : null;
          }

          if (layer.type === 'mockup') {
            if (screenSource && !isDataUrl(screenSource)) {
              throw new Error('Project mockup source is not portable. Please re-export project.');
            }

            nextLayer.screenImageSrc = screenSource ? await dataUrlToObjectUrl(screenSource) : null;
          }

          delete nextLayer.dataUrl;
          delete nextLayer.screenDataUrl;

          return nextLayer;
        }),
      );

      return {
        ...shot,
        layers,
      };
    }),
  );

  return {
    activeScreenshotId: rawProject.activeScreenshotId,
    screenshots,
  };
}
