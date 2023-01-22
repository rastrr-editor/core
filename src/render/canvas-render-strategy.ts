import type { BlobOptions, RenderOptions, RenderStrategy } from './interface';
import { LayerList } from '~/layer-list';
import { debug } from '~/utils';
import { Color } from '~/color';

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

  render(options: RenderOptions): Promise<void> {
    return new Promise((resolve) => {
      debug('request animation frame for render');
      requestAnimationFrame(() => {
        // FIXME: multiple render calls might be grouped in one animation frame
        // we should perform only one render
        this.#clean();
        this.#renderImage(this.#context, options);
        if (options.borderColor) {
          this.#renderBorder(options.borderColor, options);
        }
        debug('render done');
        resolve();
      });
    });
  }

  toBlob(options: BlobOptions): Promise<Blob | null> {
    // We need to create new canvas because it must have the size of the resulting image
    const canvas = document.createElement('canvas');
    canvas.width = options.imageSize.x;
    canvas.height = options.imageSize.y;
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      throw new Error('Failed to get 2D context');
    }
    this.#renderImage(ctx, { size: options.imageSize });
    return new Promise((resolve) => {
      canvas.toBlob(resolve, options.mimeType, options.quality);
    });
  }

  #renderImage(context: CanvasRenderingContext2D, options: RenderOptions) {
    const { offset = { x: 0, y: 0 }, size = { x: 0, y: 0 } } = options;
    for (const layer of this.#layers) {
      if (layer.visible) {
        const sx = layer.offset.x < 0 ? Math.abs(layer.offset.x) : 0;
        const sy = layer.offset.y < 0 ? Math.abs(layer.offset.y) : 0;
        const sWidth =
          layer.offset.x + layer.width > size.x
            ? layer.width - Math.abs(size.x - (layer.offset.x + layer.width))
            : layer.width;
        const sHeight =
          layer.offset.y + layer.height > size.y
            ? layer.height - Math.abs(size.y - (layer.offset.y + layer.height))
            : layer.height;
        const dx = (layer.offset.x < 0 ? 0 : layer.offset.x) + offset.x;
        const dy = (layer.offset.y < 0 ? 0 : layer.offset.y) + offset.y;
        context.drawImage(
          layer.canvas,
          sx,
          sy,
          sWidth,
          sHeight,
          dx,
          dy,
          sWidth,
          sHeight
        );
      }
    }
  }

  #renderBorder(color: Color, options: RenderOptions) {
    const { offset = { x: 0, y: 0 }, size = { x: 0, y: 0 } } = options;
    this.#context.save();
    this.#context.strokeStyle = color.toString('rgb');
    this.#context.lineWidth = 1;
    this.#context.beginPath();
    this.#context.rect(
      Math.max(offset.x - 1, 0),
      Math.max(offset.y - 1, 0),
      Math.min(size.x + 1, this.#context.canvas.width),
      Math.min(size.y + 1, this.#context.canvas.height)
    );
    this.#context.stroke();
    this.#context.restore();
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
