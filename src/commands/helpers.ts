import { LayerList } from '~/layer-list';
import { Layer, LayerFactory } from '~/layer';
import { CommandOptions } from './interface';

export function createTemporaryLayer(layers: LayerList): {
  layer: Layer;
  index: number;
} {
  if (layers.activeLayer == null || layers.activeIndex == null) {
    throw new TypeError('Active layer is not set');
  }
  const { activeLayer: layer, activeIndex } = layers;
  const tmpLayer = LayerFactory.setType(layer.type).empty(
    layer.width,
    layer.height
  );
  const insertIndex = activeIndex + 1;
  // TODO: layer should be marked as temporary
  layers.insert(insertIndex, tmpLayer);

  return { layer: tmpLayer, index: insertIndex };
}

export function createNewLayer(layers: LayerList): Layer {
  if (layers.activeLayer == null || layers.activeIndex == null) {
    throw new TypeError('Active layer is not set');
  }
  const layer = layers.activeLayer;
  const newLayer = LayerFactory.setType(layer.type).empty(
    layer.width,
    layer.height
  );

  layers.add(newLayer);

  return newLayer;
}

export function commitTemporaryData(
  layers: LayerList,
  temporaryIndex: number
): void {
  const layer = layers.remove(temporaryIndex);

  if (layers.activeLayer != null && layers.activeIndex === temporaryIndex - 1) {
    layers.activeLayer.drawContents(layer);
    layers.activeLayer.emitChange();
  }
}

export function applyOptions(
  context: CanvasRenderingContext2D,
  options: CommandOptions
): void {
  if (options.color) {
    context.strokeStyle = options.color.toString('rgb');
    context.globalAlpha = options.color.a / 256;
  }
  if (options.width) {
    context.lineWidth = options.width;
  }
  if (options.lineCap) {
    context.lineCap = options.lineCap;
    context.lineJoin = 'round';
  }
}
