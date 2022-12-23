import { Layer } from '~/layer';

export default class LayerCommand {
  name = 'unnamed';
  protected context: CanvasRenderingContext2D;
  protected layer: Layer;

  constructor(layer: Layer) {
    this.layer = layer;

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
