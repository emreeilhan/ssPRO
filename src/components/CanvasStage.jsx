import { forwardRef, useEffect, useRef, useState } from 'react';
import { Ellipse, Image as KonvaImage, Layer, Rect, Stage, Text, Transformer } from 'react-konva';

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
      rotation={layer.rotation || 0}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    />
  );
});

export default function CanvasStage({
  screenshot,
  devicePreset,
  selectedLayerId,
  onSelectLayer,
  onLayerUpdate,
  onAddImageLayers,
}) {
  const frameRef = useRef(null);
  const transformerRef = useRef(null);
  const nodeRefs = useRef({});
  const [canvasWrapWidth, setCanvasWrapWidth] = useState(620);
  const [isDragActive, setIsDragActive] = useState(false);

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

  const previewWidth = Math.min(Math.max(canvasWrapWidth - 20, 280), 480);
  const previewScale = previewWidth / devicePreset.width;
  const previewHeight = devicePreset.height * previewScale;

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) {
      return;
    }

    const selectedNode = selectedLayerId ? nodeRefs.current[selectedLayerId] : null;
    transformer.nodes(selectedNode ? [selectedNode] : []);
    transformer.getLayer()?.batchDraw();
  }, [selectedLayerId, screenshot.layers, previewScale]);

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

  return (
    <div
      ref={frameRef}
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
                    align={layer.align || 'left'}
                    fontFamily={layer.fontFamily || 'IBM Plex Sans'}
                    rotation={layer.rotation || 0}
                    draggable
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
                    rotation={layer.rotation || 0}
                    draggable
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
                    rotation={layer.rotation || 0}
                    draggable
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
                    rotation={layer.rotation || 0}
                    draggable
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
                    rotation={layer.rotation || 0}
                    draggable
                    onClick={sharedProps.onSelect}
                    onTap={sharedProps.onSelect}
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
        Drag PNG/JPG files here or use upload button. Resize via transform handles.
      </p>
    </div>
  );
}
