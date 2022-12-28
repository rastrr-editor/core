import { Layer } from '~/layer';
import { LayerList } from '~/layer-list';
import { createNewLayer, createTemporaryLayer } from '~/commands/helpers';

type DrawingMethod = 'active' | 'temporary' | 'new';

export default class LayerCommand {
  readonly name: string = 'unnamed';
  protected context: CanvasRenderingContext2D;
  protected layers: LayerList;
  protected layer: Layer;
  protected iterable: AsyncIterable<Rastrr.Point>;
  protected method: DrawingMethod;
  protected currentLayerIndex: number;

  constructor(
    layers: LayerList,
    iterable: AsyncIterable<Rastrr.Point>,
    method: DrawingMethod = 'active'
  ) {
    if (layers.activeLayer == null || layers.activeIndex == null) {
      throw new TypeError('Active layer is not set');
    }

    this.layers = layers;
    this.currentLayerIndex = layers.activeIndex;
    this.method = method;
    this.iterable = iterable;

    this.layer = layers.activeLayer;
    switch (method) {
      case 'temporary':
        this.layer = createTemporaryLayer(layers);
        this.currentLayerIndex = layers.activeIndex + 1;
        break;
      case 'new':
        this.layer = createNewLayer(layers);
        this.currentLayerIndex = layers.length - 1;
        break;
    }

    if (this.layer.canvas instanceof HTMLCanvasElement) {
      const context = this.layer.canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to get 2D context');
      }
      this.context = context;
    } else {
      throw new Error('Incorrect layer param');
    }
  }

  deleteTemporaryData(): void {
    if (this.method === 'temporary') {
      const layer = this.layers.remove(this.currentLayerIndex);

      if (this.layers.activeLayer == null || this.layers.activeIndex == null) {
        throw new TypeError('Active layer is not set');
      }

      this.layers.activeLayer.drawContents(layer);
      this.layers.activeLayer.emitChange();
    }
  }
}
