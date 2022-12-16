import type { RenderStrategy } from '~/viewport';
import { LayerList } from '~/layer-list';

export default class CanvasRenderStrategy implements RenderStrategy {
  readonly #layers: LayerList;
  readonly #context: CanvasRenderingContext2D;

  constructor(container: HTMLCanvasElement, layers: LayerList) {
    const ctx = container.getContext('2d');
    if (ctx === null) {
      throw new Error('Failed to get 2D context');
    }

    this.#layers = layers;
    this.#context = ctx;
  }

  render(): Promise<void> {
    return new Promise((resolve) => {
      this.#clean();
      for (const layer of this.#layers) {
        this.#context.drawImage(layer.canvas, layer.offset.x, layer.offset.y);
      }
      resolve();
    });
  }

  #clean(): void {
    this.#context.clearRect(
      0,
      0,
      this.#context.canvas.width,
      this.#context.canvas.height
    );
  }
}
