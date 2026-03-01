import { useEffect, useRef, useState } from 'react';
import { Layer, Line, Rect, Stage, Transformer } from 'react-konva';
import { renderLayerNode } from './canvas/renderLayerNode';
import { commitTransformForLayer } from './canvas/stageTransform';
import Button from './ui/Button';
import { buildBackgroundRectConfig } from '../utils/backgroundUtils';

export default function CanvasStage({
  screenshot,
  devicePreset,
  selectedLayerId,
  onSelectLayer,
  onLayerUpdate,
  onAddImageLayers,
  onCyclePrevScreenshot,
  onCycleNextScreenshot,
  readOnly = false,
  label = null,
  showSafeArea = false,
  showCenterGuides = false,
  showMarginGrid = false,
}) {
  const frameRef = useRef(null);
  const transformerRef = useRef(null);
  const nodeRefs = useRef({});
  const [canvasWrapWidth, setCanvasWrapWidth] = useState(620);
  const [viewportHeight, setViewportHeight] = useState(() => window.innerHeight || 900);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectionPulse, setSelectionPulse] = useState(null);
  const wheelDeltaRef = useRef(0);
  const wheelLockRef = useRef(false);
  const wheelUnlockTimerRef = useRef(null);
  const pulseAnimationRef = useRef(null);

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
      if (pulseAnimationRef.current) {
        window.cancelAnimationFrame(pulseAnimationRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight || 900);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const widthBasedPreview = Math.min(Math.max(canvasWrapWidth - 20, 240), 480);
  const maxCanvasHeight = Math.max(420, viewportHeight - 330);
  const heightBasedPreview = (maxCanvasHeight * devicePreset.width) / devicePreset.height;
  const previewWidth = Math.min(widthBasedPreview, heightBasedPreview);
  const previewScale = previewWidth / devicePreset.width;
  const previewHeight = devicePreset.height * previewScale;
  const safeMarginX = Math.round(devicePreset.width * 0.05 * previewScale);
  const safeMarginY = Math.round(devicePreset.height * 0.05 * previewScale);

  const safeLeft = safeMarginX;
  const safeTop = safeMarginY;
  const safeWidth = Math.round(previewWidth - safeMarginX * 2);
  const safeHeight = Math.round(previewHeight - safeMarginY * 2);
  const centerX = Math.round(previewWidth / 2);
  const centerY = Math.round(previewHeight / 2);
  const backgroundRectProps = buildBackgroundRectConfig({
    screenshot,
    width: previewWidth,
    height: previewHeight,
  });

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) {
      return;
    }

    const selectedNode = selectedLayerId ? nodeRefs.current[selectedLayerId] : null;
    transformer.nodes(selectedNode ? [selectedNode] : []);
    transformer.getLayer()?.batchDraw();
  }, [selectedLayerId, screenshot.layers, previewScale]);

  useEffect(() => {
    if (pulseAnimationRef.current) {
      window.cancelAnimationFrame(pulseAnimationRef.current);
      pulseAnimationRef.current = null;
    }

    if (!selectedLayerId || readOnly) {
      setSelectionPulse(null);
      return;
    }

    const selectedNode = nodeRefs.current[selectedLayerId];
    if (!selectedNode) {
      setSelectionPulse(null);
      return;
    }

    const box = selectedNode.getClientRect({
      skipShadow: false,
      skipStroke: false,
    });
    if (!box || box.width <= 0 || box.height <= 0) {
      setSelectionPulse(null);
      return;
    }

    const durationMs = 520;
    const startTime = performance.now();

    const animatePulse = (now) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const expand = 4 + progress * 18;
      const opacity = (1 - progress) * 0.95;

      setSelectionPulse({
        x: box.x - expand,
        y: box.y - expand,
        width: box.width + expand * 2,
        height: box.height + expand * 2,
        opacity,
      });

      if (progress < 1) {
        pulseAnimationRef.current = window.requestAnimationFrame(animatePulse);
        return;
      }

      pulseAnimationRef.current = null;
      setSelectionPulse(null);
    };

    pulseAnimationRef.current = window.requestAnimationFrame(animatePulse);

    return () => {
      if (pulseAnimationRef.current) {
        window.cancelAnimationFrame(pulseAnimationRef.current);
        pulseAnimationRef.current = null;
      }
    };
  }, [readOnly, selectedLayerId, previewScale]);

  const setNodeRef = (layerId, node) => {
    if (node) {
      nodeRefs.current[layerId] = node;
      return;
    }

    delete nodeRefs.current[layerId];
  };

  const commitDrag = (layerId, node) => {
    if (readOnly) {
      return;
    }

    onLayerUpdate(layerId, {
      x: Math.round(node.x() / previewScale),
      y: Math.round(node.y() / previewScale),
    });
  };

  const commitTransform = (layer, node) => {
    if (readOnly) {
      return;
    }

    commitTransformForLayer({
      layer,
      node,
      previewScale,
      onLayerUpdate,
    });
  };

  const handleDrop = async (event) => {
    if (readOnly) {
      return;
    }

    event.preventDefault();
    setIsDragActive(false);

    const files = event.dataTransfer?.files;
    if (files && files.length) {
      await onAddImageLayers(files);
    }
  };

  const handleStagePointerDown = (event) => {
    if (readOnly) {
      return;
    }

    const target = event.target;
    const clickedStage = target === target.getStage();
    const clickedBackground = target.name() === 'stage-background';

    if (clickedStage || clickedBackground) {
      onSelectLayer(null);
    }
  };

  const handleCanvasWheel = (event) => {
    if (readOnly) {
      return;
    }

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
        if (readOnly) {
          return;
        }
        event.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={handleDrop}
      className={`interactive-card relative rounded-xl p-3 ${isDragActive ? 'bg-blue-50/70 dark:bg-blue-900/20' : 'bg-zinc-50/90 dark:bg-zinc-900/40'}`}
    >
      {!readOnly && (onCyclePrevScreenshot || onCycleNextScreenshot) && (
        <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-lg bg-white/90 px-1 py-1 shadow-sm backdrop-blur dark:bg-zinc-900/80">
          <Button
            onClick={() => onCyclePrevScreenshot?.()}
            className="h-7 px-2 py-0 text-[11px]"
          >
            Prev
          </Button>
          <Button
            onClick={() => onCycleNextScreenshot?.()}
            className="h-7 px-2 py-0 text-[11px]"
          >
            Next
          </Button>
        </div>
      )}

      {label && (
        <div className="type-meta mb-3 uppercase">
          {label}
        </div>
      )}
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
              {...backgroundRectProps}
            />

            {screenshot.layers.map((layer) =>
              renderLayerNode({
                layer,
                previewScale,
                onLayerUpdate,
                onSelectLayer,
                setNodeRef,
                commitDrag,
                commitTransform,
                isInteractive: !readOnly,
              }),
            )}

            {selectionPulse && (
              <Rect
                x={selectionPulse.x}
                y={selectionPulse.y}
                width={selectionPulse.width}
                height={selectionPulse.height}
                stroke="#3b82f6"
                strokeWidth={2}
                cornerRadius={12}
                opacity={selectionPulse.opacity}
                listening={false}
              />
            )}

            {(showSafeArea || showCenterGuides || showMarginGrid) && (
              <>
                {showSafeArea && (
                  <Rect
                    x={safeLeft}
                    y={safeTop}
                    width={safeWidth}
                    height={safeHeight}
                    stroke="#22c55e"
                    strokeWidth={1}
                    dash={[6, 6]}
                    listening={false}
                  />
                )}

                {showCenterGuides && (
                  <>
                    <Line
                      points={[centerX, 0, centerX, previewHeight]}
                      stroke="#2563eb"
                      strokeWidth={1}
                      dash={[6, 4]}
                      listening={false}
                    />
                    <Line
                      points={[0, centerY, previewWidth, centerY]}
                      stroke="#2563eb"
                      strokeWidth={1}
                      dash={[6, 4]}
                      listening={false}
                    />
                  </>
                )}

                {showMarginGrid && (
                  <>
                    {[1, 2, 3].map((index) => {
                      const x = safeLeft + (safeWidth / 4) * index;
                      return (
                        <Line
                          key={`grid-v-${index}`}
                          points={[x, safeTop, x, safeTop + safeHeight]}
                          stroke="#64748b"
                          strokeWidth={1}
                          dash={[2, 5]}
                          listening={false}
                        />
                      );
                    })}
                    {[1, 2, 3, 4, 5, 6, 7].map((index) => {
                      const y = safeTop + (safeHeight / 8) * index;
                      return (
                        <Line
                          key={`grid-h-${index}`}
                          points={[safeLeft, y, safeLeft + safeWidth, y]}
                          stroke="#64748b"
                          strokeWidth={1}
                          dash={[2, 5]}
                          listening={false}
                        />
                      );
                    })}
                  </>
                )}
              </>
            )}

            {!readOnly && (
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
            )}
          </Layer>
        </Stage>
      </div>

      <p className="type-meta mt-3">
        {readOnly
          ? 'Comparison panel is read-only.'
          : 'Drag PNG/JPG files here or use upload button. Resize via transform handles. Horizontal scroll changes screenshot.'}
      </p>
    </div>
  );
}
