import { useEffect, useRef, useState } from 'react';
import { Layer, Line, Rect, Stage, Transformer } from 'react-konva';
import { renderLayerNode } from './canvas/renderLayerNode';
import { commitTransformForLayer } from './canvas/stageTransform';

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
  const safeMarginX = Math.round(devicePreset.width * 0.05 * previewScale);
  const safeMarginY = Math.round(devicePreset.height * 0.05 * previewScale);

  const safeLeft = safeMarginX;
  const safeTop = safeMarginY;
  const safeWidth = Math.round(previewWidth - safeMarginX * 2);
  const safeHeight = Math.round(previewHeight - safeMarginY * 2);
  const centerX = Math.round(previewWidth / 2);
  const centerY = Math.round(previewHeight / 2);

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
      className={`relative border border-line p-2 ${isDragActive ? 'bg-blue-50/70 dark:bg-blue-900/20' : 'bg-zinc-100/40 dark:bg-zinc-900/40'}`}
    >
      {!readOnly && (onCyclePrevScreenshot || onCycleNextScreenshot) && (
        <div className="absolute right-2 top-2 z-20 flex items-center gap-1 rounded border border-line bg-white/85 px-1 py-1 shadow-sm backdrop-blur dark:bg-zinc-900/80">
          <button
            type="button"
            onClick={() => onCyclePrevScreenshot?.()}
            className="mono border border-line px-1.5 py-0.5 text-[11px] uppercase hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => onCycleNextScreenshot?.()}
            className="mono border border-line px-1.5 py-0.5 text-[11px] uppercase hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Next
          </button>
        </div>
      )}

      {label && (
        <div className="mono mb-2 text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
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
              fill={screenshot.backgroundColor || '#ffffff'}
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
                          stroke="#f59e0b"
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
                          stroke="#f59e0b"
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

      <p className="mono mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        {readOnly
          ? 'Comparison panel is read-only.'
          : 'Drag PNG/JPG files here or use upload button. Resize via transform handles. Horizontal scroll changes screenshot.'}
      </p>
    </div>
  );
}
