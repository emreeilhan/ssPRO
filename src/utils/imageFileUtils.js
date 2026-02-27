export const createObjectURL = (file) => window.URL.createObjectURL(file);

export const readImageDimensions = (source) =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve({ width: image.width, height: image.height });
    image.onerror = () => reject(new Error('Image decode failed.'));
    image.src = source;
  });
