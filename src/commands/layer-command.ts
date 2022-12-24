import { Layer } from '~/layer';

export default class LayerCommand {
  name = 'unnamed';
  protected context: CanvasRenderingContext2D;
  protected layer: Layer;
  protected iterable: AsyncIterable<Rastrr.Point>;

  constructor(layer: Layer, iterable: AsyncIterable<Rastrr.Point>) {
    this.layer = layer;
    this.iterable = iterable;

    if (layer.canvas instanceof HTMLCanvasElement) {
      const context = layer.canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to get 2D context');
      }
      this.context = context;
    } else {
      throw new Error('Incorrect layer param');
    }
  }
}
