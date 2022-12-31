import { LayerList } from '~/layer-list';
import { Layer, LayerFactory } from '~/layer';
import { CommandOptions } from './interface';
import { Color } from '~/color';

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
    layer.height,
    { opacity: layer.opacity }
  );
  const insertIndex = activeIndex + 1;
  // TODO: layer should be marked as temporary
  layers.insert(insertIndex, tmpLayer);

  return { layer: tmpLayer, index: insertIndex };
}

export function createNewLayer(layers: LayerList): Layer {
  if (layers.length === 0) {
    throw new TypeError('No layers in the list');
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const layer = layers.get(0)!;
  const newLayer = LayerFactory.setType(layer.type).empty(
    layer.width,
    layer.height
  );

  layers.add(newLayer);
  layers.setActive(layers.length - 1);

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

export function applyOptionsToCanvasCtx({
  context,
  options,
  layer,
  operation = 'stroke',
}: {
  context: CanvasRenderingContext2D;
  options: CommandOptions;
  layer?: Layer;
  operation?: 'fill' | 'stroke';
}): void {
  if (options.color) {
    if (operation === 'stroke') {
      context.strokeStyle = options.color.toString('rgb');
    } else {
      context.fillStyle = options.color.toString('rgb');
    }
    // TODO: preserve alpha of the path without applied layer opacity
    context.globalAlpha = (options.color.a / 255) * (layer?.opacity ?? 1);
  }
  if (options.width) {
    context.lineWidth = options.width;
  }
  if (options.lineCap) {
    context.lineCap = options.lineCap;
    context.lineJoin = 'round';
  }
}

export function applyDefaultOptions(options?: CommandOptions): CommandOptions {
  return {
    ...options,
    color: options?.color ?? new Color(0, 0, 0, 255),
    width: options?.width ?? 1,
    lineCap: options?.lineCap ?? 'round',
  };
}
