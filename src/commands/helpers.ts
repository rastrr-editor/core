import { LayerList } from '~/layer-list';
import { Layer, LayerFactory } from '~/layer';

export function createTemporaryLayer(layers: LayerList): Layer {
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

  return tmpLayer;
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
