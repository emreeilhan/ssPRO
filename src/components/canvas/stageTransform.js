export const commitTransformForLayer = ({ layer, node, previewScale, onLayerUpdate }) => {
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();

  node.scaleX(1);
  node.scaleY(1);

  const baseUpdate = {
    x: Math.round(node.x() / previewScale),
    y: Math.round(node.y() / previewScale),
    rotation: Number(node.rotation().toFixed(2)),
  };

  if (layer.type === 'image') {
    onLayerUpdate(layer.id, {
      ...baseUpdate,
      width: Math.max(30, Math.round((node.width() * scaleX) / previewScale)),
      height: Math.max(30, Math.round((node.height() * scaleY) / previewScale)),
    });
    return;
  }

  if (layer.type === 'text') {
    onLayerUpdate(layer.id, {
      ...baseUpdate,
      width: Math.max(80, Math.round((node.width() * scaleX) / previewScale)),
      fontSize: Math.max(18, Math.round((layer.fontSize || 64) * scaleY)),
    });
    return;
  }

  if (layer.type === 'shape') {
    const nextWidth = Math.max(40, Math.round((node.width() * scaleX) / previewScale));
    const nextHeight = Math.max(40, Math.round((node.height() * scaleY) / previewScale));
    const isCenterBased = layer.shapeKind === 'orb' || layer.shapeKind === 'ring';

    if (isCenterBased) {
      const centerX = node.x() / previewScale;
      const centerY = node.y() / previewScale;
      onLayerUpdate(layer.id, {
        x: Math.round(centerX - nextWidth / 2),
        y: Math.round(centerY - nextHeight / 2),
        width: nextWidth,
        height: nextHeight,
        rotation: Number(node.rotation().toFixed(2)),
      });
      return;
    }

    onLayerUpdate(layer.id, {
      x: Math.round(node.x() / previewScale),
      y: Math.round(node.y() / previewScale),
      width: nextWidth,
      height: nextHeight,
      rotation: Number(node.rotation().toFixed(2)),
    });
    return;
  }

  if (layer.type === 'mockup') {
    onLayerUpdate(layer.id, {
      x: Math.round(node.x() / previewScale),
      y: Math.round(node.y() / previewScale),
      width: Math.max(180, Math.round((node.width() * scaleX) / previewScale)),
      height: Math.max(300, Math.round((node.height() * scaleY) / previewScale)),
      rotation: Number(node.rotation().toFixed(2)),
    });
  }
};
