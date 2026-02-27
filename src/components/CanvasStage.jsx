import { forwardRef, useEffect, useRef, useState } from 'react';
import { Ellipse, Group, Image as KonvaImage, Layer, Rect, Stage, Text, Transformer } from 'react-konva';

const resolveBlendMode = (value) => (value && value !== 'normal' ? value : 'source-over');

const ImageLayerNode = forwardRef(function ImageLayerNode({ layer, scale, onSelect, onDragEnd, onTransformEnd }, ref) {
  const [asset, setAsset] = useState(null);

  useEffect(() => {
    if (!layer.dataUrl) {
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

    image.src = layer.dataUrl;

    return () => {
      isMounted = false;
    };
  }, [layer.dataUrl]);

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
      opacity={layer.opacity ?? 1}
      globalCompositeOperation={resolveBlendMode(layer.blendMode)}
      rotation={layer.rotation || 0}
      draggable={!layer.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    />
  );
});

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

const MockupLayerNode = forwardRef(function MockupLayerNode(
  { layer, scale, onSelect, onDragEnd, onTransformEnd },
  ref,
) {
  const [screenAsset, setScreenAsset] = useState(null);
  const metrics = getMockupMetrics(layer, scale);

  useEffect(() => {
    if (!layer.screenDataUrl) {
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
    image.src = layer.screenDataUrl;

    return () => {
      mounted = false;
    };
  }, [layer.screenDataUrl]);

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
      opacity={layer.opacity ?? 1}
      globalCompositeOperation={resolveBlendMode(layer.blendMode)}
      draggable={!layer.locked}
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

export default function CanvasStage({
  screenshot,
  devicePreset,
  selectedLayerId,
  onSelectLayer,
  onLayerUpdate,
  onAddImageLayers,
  onCyclePrevScreenshot,
  onCycleNextScreenshot,
}) {
  const frameRef = useRef(null);
  const transformerRef = useRef(null);
  const nodeRefs = useRef({});
  const [canvasWrapWidth, setCanvasWrapWidth] = useState(620);
  const [isDragActive, setIsDragActive] = useState(false);
  const wheelDeltaRef = useRef(0);
  const wheelLockRef = useRef(false);
  const wheelUnlockTimerRef = useRef(null);

  useEffect(() => {
    const element = frameRef.current;
    if (!element) {
      return undefined;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      setCanvasWrapWidth(entry.contentRect.width);
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(
    () => () => {
      if (wheelUnlockTimerRef.current) {
        window.clearTimeout(wheelUnlockTimerRef.current);
      }
    },
    [],
  );

  const previewWidth = Math.min(Math.max(canvasWrapWidth - 20, 280), 480);
  const previewScale = previewWidth / devicePreset.width;
  const previewHeight = devicePreset.height * previewScale;
  const selectedLayer = screenshot.layers.find((layer) => layer.id === selectedLayerId);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) {
      return;
    }

    const selectedNode = selectedLayerId ? nodeRefs.current[selectedLayerId] : null;
    const canTransform = selectedNode && selectedLayer && !selectedLayer.locked;
    transformer.nodes(canTransform ? [selectedNode] : []);
    transformer.getLayer()?.batchDraw();
  }, [selectedLayerId, selectedLayer, screenshot.layers, previewScale]);

  const setNodeRef = (layerId, node) => {
    if (node) {
      nodeRefs.current[layerId] = node;
      return;
    }

    delete nodeRefs.current[layerId];
  };

  const commitDrag = (layerId, node) => {
    onLayerUpdate(layerId, {
      x: Math.round(node.x() / previewScale),
      y: Math.round(node.y() / previewScale),
    });
  };

  const commitTransform = (layer, node) => {
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

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragActive(false);

    const files = event.dataTransfer?.files;
    if (files && files.length) {
      await onAddImageLayers(files);
    }
  };

  const handleStagePointerDown = (event) => {
    const target = event.target;
    const clickedStage = target === target.getStage();
    const clickedBackground = target.name() === 'stage-background';

    if (clickedStage || clickedBackground) {
      onSelectLayer(null);
    }
  };

  const handleCanvasWheel = (event) => {
    const horizontalDelta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.shiftKey
          ? event.deltaY
          : 0;

    if (!horizontalDelta) {
      return;
    }

    event.preventDefault();
    wheelDeltaRef.current += horizontalDelta;

    if (wheelLockRef.current || Math.abs(wheelDeltaRef.current) < 45) {
      return;
    }

    if (wheelDeltaRef.current > 0) {
      onCycleNextScreenshot?.();
    } else {
      onCyclePrevScreenshot?.();
    }

    wheelDeltaRef.current = 0;
    wheelLockRef.current = true;

    if (wheelUnlockTimerRef.current) {
      window.clearTimeout(wheelUnlockTimerRef.current);
    }

    wheelUnlockTimerRef.current = window.setTimeout(() => {
      wheelLockRef.current = false;
    }, 180);
  };

  return (
    <div
      ref={frameRef}
      onWheel={handleCanvasWheel}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={handleDrop}
      className={`border border-line p-2 ${isDragActive ? 'bg-blue-50/70 dark:bg-blue-900/20' : 'bg-zinc-100/40 dark:bg-zinc-900/40'}`}
    >
      <div className="mx-auto" style={{ width: `${previewWidth}px` }}>
        <Stage
          width={previewWidth}
          height={previewHeight}
          onMouseDown={handleStagePointerDown}
          onTouchStart={handleStagePointerDown}
        >
          <Layer>
            <Rect
              name="stage-background"
              x={0}
              y={0}
              width={previewWidth}
              height={previewHeight}
              fill={screenshot.backgroundColor || '#ffffff'}
            />

            {screenshot.layers.map((layer) => {
              if (layer.visible === false) {
                return null;
              }

              const sharedProps = {
                onSelect: () => onSelectLayer(layer.id),
                onDragEnd: (event) => commitDrag(layer.id, event.target),
                onTransformEnd: (event) => commitTransform(layer, event.target),
              };

              if (layer.type === 'image') {
                return (
                  <ImageLayerNode
                    key={layer.id}
                    ref={(node) => setNodeRef(layer.id, node)}
                    layer={layer}
                    scale={previewScale}
                    {...sharedProps}
                  />
                );
              }

              if (layer.type === 'text') {
                return (
                  <Text
                    key={layer.id}
                    ref={(node) => setNodeRef(layer.id, node)}
                    x={layer.x * previewScale}
                    y={layer.y * previewScale}
                    width={layer.width * previewScale}
                    text={layer.text || ''}
                    fontSize={(layer.fontSize || 64) * previewScale}
                    lineHeight={layer.lineHeight || 1.1}
                    fill={layer.color || '#101010'}
                    opacity={layer.opacity ?? 1}
                    globalCompositeOperation={resolveBlendMode(layer.blendMode)}
                    align={layer.align || 'left'}
                    fontFamily={layer.fontFamily || 'IBM Plex Sans'}
                    rotation={layer.rotation || 0}
                    draggable={!layer.locked}
                    onClick={sharedProps.onSelect}
                    onTap={sharedProps.onSelect}
                    onDragEnd={sharedProps.onDragEnd}
                    onTransformEnd={sharedProps.onTransformEnd}
                  />
                );
              }

              if (layer.type === 'shape' && layer.shapeKind === 'orb') {
                return (
                  <Ellipse
                    key={layer.id}
                    ref={(node) => setNodeRef(layer.id, node)}
                    x={(layer.x + layer.width / 2) * previewScale}
                    y={(layer.y + layer.height / 2) * previewScale}
                    radiusX={(layer.width * previewScale) / 2}
                    radiusY={(layer.height * previewScale) / 2}
                    fillRadialGradientStartPoint={{ x: 0, y: 0 }}
                    fillRadialGradientStartRadius={0}
                    fillRadialGradientEndPoint={{ x: 0, y: 0 }}
                    fillRadialGradientEndRadius={(Math.max(layer.width, layer.height) * previewScale) / 2}
                    fillRadialGradientColorStops={[0, layer.color2 || '#d6e5ff', 1, layer.color || '#6fa8ff']}
                    opacity={layer.opacity ?? 0.35}
                    shadowColor={layer.color || '#6fa8ff'}
                    shadowBlur={(layer.blur || 28) * previewScale}
                    shadowOpacity={0.45}
                    globalCompositeOperation={resolveBlendMode(layer.blendMode)}
                    rotation={layer.rotation || 0}
                    draggable={!layer.locked}
                    onClick={sharedProps.onSelect}
                    onTap={sharedProps.onSelect}
                    onDragEnd={(event) => {
                      const node = event.target;
                      onLayerUpdate(layer.id, {
                        x: Math.round(node.x() / previewScale - layer.width / 2),
                        y: Math.round(node.y() / previewScale - layer.height / 2),
                      });
                    }}
                    onTransformEnd={sharedProps.onTransformEnd}
                  />
                );
              }

              if (layer.type === 'shape' && layer.shapeKind === 'ring') {
                return (
                  <Ellipse
                    key={layer.id}
                    ref={(node) => setNodeRef(layer.id, node)}
                    x={(layer.x + layer.width / 2) * previewScale}
                    y={(layer.y + layer.height / 2) * previewScale}
                    radiusX={(layer.width * previewScale) / 2}
                    radiusY={(layer.height * previewScale) / 2}
                    stroke={layer.color || '#145bff'}
                    strokeWidth={(layer.strokeWidth || 20) * previewScale}
                    opacity={layer.opacity ?? 0.6}
                    shadowColor={layer.color2 || layer.color || '#145bff'}
                    shadowBlur={(layer.blur || 10) * previewScale}
                    shadowOpacity={0.5}
                    globalCompositeOperation={resolveBlendMode(layer.blendMode)}
                    rotation={layer.rotation || 0}
                    draggable={!layer.locked}
                    onClick={sharedProps.onSelect}
                    onTap={sharedProps.onSelect}
                    onDragEnd={(event) => {
                      const node = event.target;
                      onLayerUpdate(layer.id, {
                        x: Math.round(node.x() / previewScale - layer.width / 2),
                        y: Math.round(node.y() / previewScale - layer.height / 2),
                      });
                    }}
                    onTransformEnd={sharedProps.onTransformEnd}
                  />
                );
              }

              if (layer.type === 'shape' && layer.shapeKind === 'pill') {
                return (
                  <Rect
                    key={layer.id}
                    ref={(node) => setNodeRef(layer.id, node)}
                    x={layer.x * previewScale}
                    y={layer.y * previewScale}
                    width={layer.width * previewScale}
                    height={layer.height * previewScale}
                    cornerRadius={(layer.cornerRadius || Math.min(layer.height, layer.width) / 2) * previewScale}
                    fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                    fillLinearGradientEndPoint={{ x: layer.width * previewScale, y: 0 }}
                    fillLinearGradientColorStops={[0, layer.color || '#111827', 1, layer.color2 || '#4b5563']}
                    opacity={layer.opacity ?? 0.2}
                    globalCompositeOperation={resolveBlendMode(layer.blendMode)}
                    rotation={layer.rotation || 0}
                    draggable={!layer.locked}
                    onClick={sharedProps.onSelect}
                    onTap={sharedProps.onSelect}
                    onDragEnd={sharedProps.onDragEnd}
                    onTransformEnd={sharedProps.onTransformEnd}
                  />
                );
              }

              if (layer.type === 'shape' && layer.shapeKind === 'glow') {
                return (
                  <Rect
                    key={layer.id}
                    ref={(node) => setNodeRef(layer.id, node)}
                    x={layer.x * previewScale}
                    y={layer.y * previewScale}
                    width={layer.width * previewScale}
                    height={layer.height * previewScale}
                    cornerRadius={(layer.cornerRadius || 24) * previewScale}
                    fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                    fillLinearGradientEndPoint={{ x: layer.width * previewScale, y: layer.height * previewScale }}
                    fillLinearGradientColorStops={[0, layer.color || '#ff65a3', 1, layer.color2 || '#ffd166']}
                    opacity={layer.opacity ?? 0.34}
                    shadowColor={layer.color || '#ff65a3'}
                    shadowBlur={(layer.blur || 34) * previewScale}
                    shadowOpacity={0.7}
                    globalCompositeOperation={resolveBlendMode(layer.blendMode)}
                    rotation={layer.rotation || 0}
                    draggable={!layer.locked}
                    onClick={sharedProps.onSelect}
                    onTap={sharedProps.onSelect}
                    onDragEnd={sharedProps.onDragEnd}
                    onTransformEnd={sharedProps.onTransformEnd}
                  />
                );
              }

              if (layer.type === 'mockup') {
                return (
                  <MockupLayerNode
                    key={layer.id}
                    ref={(node) => setNodeRef(layer.id, node)}
                    layer={layer}
                    scale={previewScale}
                    onSelect={sharedProps.onSelect}
                    onDragEnd={sharedProps.onDragEnd}
                    onTransformEnd={sharedProps.onTransformEnd}
                  />
                );
              }

              return null;
            })}

            <Transformer
              ref={transformerRef}
              rotateEnabled
              keepRatio={false}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 20 || newBox.height < 20) {
                  return oldBox;
                }

                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>

      <p className="mono mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Drag PNG/JPG files here or use upload button. Resize via transform handles. Horizontal scroll changes screenshot.
      </p>
    </div>
  );
}
