import { forwardRef, useEffect, useState } from 'react';
import { Group, Image as KonvaImage, Rect } from 'react-konva';
import { getImageSource, getMockupScreenSource } from '../../utils/imageSources';

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

function getMockupMetrics(layer, scale) {
  const width = layer.width * scale;
  const height = layer.height * scale;
  const bezel = (layer.bezel || 20) * scale;
  const cornerRadius = (layer.cornerRadius || 84) * scale;
  const style = layer.mockupStyle || 'realistic';
  const topInset = style === 'realistic' ? bezel * 1.7 : bezel * 1.4;
  const sideInset = bezel;
  const bottomInset = bezel * 1.2;

  return {
    style,
    width,
    height,
    bezel,
    cornerRadius,
    screenX: sideInset,
    screenY: topInset,
    screenWidth: Math.max(40, width - sideInset * 2),
    screenHeight: Math.max(60, height - topInset - bottomInset),
    screenCornerRadius: Math.max(12, cornerRadius - bezel * 0.8),
  };
}

export const ImageLayerNode = forwardRef(function ImageLayerNode(
  { layer, scale, onSelect, onDragEnd, onTransformEnd },
  ref,
) {
  const [asset, setAsset] = useState(null);

  useEffect(() => {
    const source = getImageSource(layer);
    if (!source) {
      setAsset(null);
      return;
    }

    let isMounted = true;
    const image = new window.Image();

    image.onload = () => {
      if (isMounted) {
        setAsset(image);
      }
    };

    image.src = source;

    return () => {
      isMounted = false;
    };
  }, [layer.imageSrc, layer.dataUrl]);

  if (!asset) {
    return null;
  }

  return (
    <KonvaImage
      ref={ref}
      image={asset}
      x={layer.x * scale}
      y={layer.y * scale}
      width={layer.width * scale}
      height={layer.height * scale}
      rotation={layer.rotation || 0}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    />
  );
});

export const MockupLayerNode = forwardRef(function MockupLayerNode(
  { layer, scale, onSelect, onDragEnd, onTransformEnd },
  ref,
) {
  const [screenAsset, setScreenAsset] = useState(null);
  const metrics = getMockupMetrics(layer, scale);

  useEffect(() => {
    const source = getMockupScreenSource(layer);
    if (!source) {
      setScreenAsset(null);
      return;
    }

    let mounted = true;
    const image = new window.Image();
    image.onload = () => {
      if (mounted) {
        setScreenAsset(image);
      }
    };
    image.src = source;

    return () => {
      mounted = false;
    };
  }, [layer.screenImageSrc, layer.screenDataUrl]);

  const { width, height, bezel, cornerRadius, style } = metrics;

  const notchWidth = style === 'flat' ? 0 : width * 0.26;
  const notchHeight = style === 'realistic' ? bezel * 0.7 : bezel * 0.52;
  const notchX = (width - notchWidth) / 2;
  const notchY = bezel * 0.38;

  let screenImageProps = null;
  if (screenAsset) {
    const fitRatio = Math.max(
      metrics.screenWidth / screenAsset.width,
      metrics.screenHeight / screenAsset.height,
    );
    const drawWidth = screenAsset.width * fitRatio;
    const drawHeight = screenAsset.height * fitRatio;

    screenImageProps = {
      image: screenAsset,
      x: (metrics.screenWidth - drawWidth) / 2,
      y: (metrics.screenHeight - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    };
  }

  return (
    <Group
      ref={ref}
      x={layer.x * scale}
      y={layer.y * scale}
      width={width}
      height={height}
      draggable
      rotation={layer.rotation || 0}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    >
      <Rect x={0} y={0} width={width} height={height} fill="rgba(0,0,0,0.001)" />

      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        cornerRadius={cornerRadius}
        fill={layer.frameColor || '#0f172a'}
        shadowColor="#0f172a"
        shadowBlur={(layer.shadowBlur || 0) * scale}
        shadowOpacity={layer.shadowOpacity || 0}
        shadowOffsetY={style === 'flat' ? 0 : 12 * scale}
      />

      {style !== 'flat' && (
        <Rect
          x={bezel * 0.35}
          y={bezel * 0.35}
          width={width - bezel * 0.7}
          height={height - bezel * 0.7}
          cornerRadius={Math.max(10, cornerRadius - bezel * 0.45)}
          stroke={layer.accentColor || '#334155'}
          strokeWidth={style === 'realistic' ? 1.6 * scale : 1.2 * scale}
          opacity={style === 'realistic' ? 0.65 : 0.5}
        />
      )}

      <Group
        x={metrics.screenX}
        y={metrics.screenY}
        clipFunc={(ctx) =>
          drawRoundedRectPath(
            ctx,
            0,
            0,
            metrics.screenWidth,
            metrics.screenHeight,
            metrics.screenCornerRadius,
          )
        }
      >
        <Rect
          x={0}
          y={0}
          width={metrics.screenWidth}
          height={metrics.screenHeight}
          cornerRadius={metrics.screenCornerRadius}
          fill={layer.screenBg || '#0b0b0b'}
        />

        {screenImageProps && <KonvaImage {...screenImageProps} />}
      </Group>

      {style !== 'flat' && (
        <Rect
          x={notchX}
          y={notchY}
          width={notchWidth}
          height={notchHeight}
          cornerRadius={notchHeight / 2}
          fill={style === 'rounded' ? '#94a3b8' : '#020617'}
          opacity={0.95}
        />
      )}
    </Group>
  );
});
