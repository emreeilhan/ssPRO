import { useRef } from 'react';
import { Layer, Rect, Stage } from 'react-konva';
import { renderLayerNode } from './canvas/renderLayerNode';

export default function ScreenshotThumbnail({ screenshot, devicePreset, width = 54 }) {
  const nodeRefs = useRef({});

  const previewScale = width / devicePreset.width;
  const height = Math.round(devicePreset.height * previewScale);

  const setNodeRef = (layerId, node) => {
    if (node) {
      nodeRefs.current[layerId] = node;
      return;
    }

    delete nodeRefs.current[layerId];
  };

  return (
    <div className="overflow-hidden rounded border border-line">
      <Stage width={width} height={height}>
        <Layer>
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill={screenshot.backgroundColor || '#ffffff'}
          />

          {screenshot.layers.map((layer) =>
            renderLayerNode({
              layer,
              previewScale,
              onLayerUpdate: () => {},
              onSelectLayer: () => {},
              setNodeRef,
              commitDrag: () => {},
              commitTransform: () => {},
              isInteractive: false,
            }),
          )}
        </Layer>
      </Stage>
    </div>
  );
}
