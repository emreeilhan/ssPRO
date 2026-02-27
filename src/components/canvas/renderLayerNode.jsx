import { Ellipse, Rect, Text } from 'react-konva';
import { ImageLayerNode, MockupLayerNode } from './layerNodes';

const centerBasedShapeUpdate = ({ event, layer, previewScale, onLayerUpdate }) => {
  const node = event.target;
  onLayerUpdate(layer.id, {
    x: Math.round(node.x() / previewScale - layer.width / 2),
    y: Math.round(node.y() / previewScale - layer.height / 2),
  });
};

export const renderLayerNode = ({
  layer,
  previewScale,
  onLayerUpdate,
  onSelectLayer,
  setNodeRef,
  commitDrag,
  commitTransform,
  isInteractive = true,
}) => {
  if (layer.visible === false) {
    return null;
  }

  const sharedProps = {
    onSelect: () => {
      if (isInteractive) {
        onSelectLayer(layer.id);
      }
    },
    onDragEnd: (event) => {
      if (isInteractive) {
        commitDrag(layer.id, event.target);
      }
    },
    onTransformEnd: (event) => {
      if (isInteractive) {
        commitTransform(layer, event.target);
      }
    },
  };

  if (layer.type === 'image') {
    return (
      <ImageLayerNode
        key={layer.id}
        ref={(node) => setNodeRef(layer.id, node)}
        layer={layer}
        scale={previewScale}
        isInteractive={isInteractive}
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
        draggable={isInteractive}
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
        draggable={isInteractive}
        onClick={sharedProps.onSelect}
        onTap={sharedProps.onSelect}
        onDragEnd={(event) => centerBasedShapeUpdate({ event, layer, previewScale, onLayerUpdate })}
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
        draggable={isInteractive}
        onClick={sharedProps.onSelect}
        onTap={sharedProps.onSelect}
        onDragEnd={(event) => centerBasedShapeUpdate({ event, layer, previewScale, onLayerUpdate })}
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
        draggable={isInteractive}
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
        draggable={isInteractive}
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
        isInteractive={isInteractive}
        onSelect={sharedProps.onSelect}
        onDragEnd={sharedProps.onDragEnd}
        onTransformEnd={sharedProps.onTransformEnd}
      />
    );
  }

  return null;
};
