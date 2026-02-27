export const getImageSource = (layer) => layer?.imageSrc || layer?.dataUrl || null;

export const getMockupScreenSource = (layer) =>
  layer?.screenImageSrc || layer?.screenDataUrl || null;
