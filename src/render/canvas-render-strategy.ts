import type { RenderStrategy } from './interface';
import { LayerList } from '~/layer-list';
import { debug } from '~/utils';

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

  render(viewportOffset: Rastrr.Point = { x: 0, y: 0 }): Promise<void> {
    return new Promise((resolve) => {
      debug('request animation frame for render');
      requestAnimationFrame(() => {
        // FIXME: multiple render calls might be grouped in one animation frame
        // we should perform only one render
        this.#clean();
        for (const layer of this.#layers) {
          if (layer.visible) {
            this.#context.drawImage(
              layer.canvas,
              layer.offset.x + viewportOffset.x,
              layer.offset.y + viewportOffset.y
            );
          }
        }
        debug('render done');
        resolve();
      });
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
