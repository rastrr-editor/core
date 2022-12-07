import { Color, ColorRange } from '../color';
import { LayerOptions } from './interface';

// TODO refactoring by scheme
export default class Layer {
  readonly #canvas: HTMLCanvasElement;
  readonly #ctx2d: CanvasRenderingContext2D;

  constructor(width = 0, height = 0, opts: LayerOptions = {}) {
    if (width === 0 || height === 0) {
      throw new Error('Incorrect constructor parameters.');
    }

    this.#canvas = document.createElement('canvas');
    this.#canvas.width = width;
    this.#canvas.height = height;

    const ctx = this.#canvas.getContext('2d');
    if (ctx === null) {
      throw new Error('Error create 2D context');
    }

    this.#ctx2d = ctx;

    if (opts.color instanceof Color) {
      this.fill(opts.color);
    }

    if (opts.image instanceof ImageBitmap) {
      this.#ctx2d.drawImage(opts.image, 0, 0, width, height);
    }
  }

  get canvas(): HTMLCanvasElement {
    return this.#canvas;
  }

  get width(): number {
    return this.#canvas.width;
  }

  get height(): number {
    return this.#canvas.height;
  }

  fill(color: Color): void {
    this.rectangle(0, 0, this.width, this.height, color);
  }

  rectangle(x: number, y: number, w: number, h: number, color: Color): void {
    this.#ctx2d.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${
      color.a / 256
    })`;
    this.#ctx2d.fillRect(x, y, w, h);
  }

  setAlpha(value: ColorRange): void {
    const imageData = this.#ctx2d.getImageData(
      0,
      0,
      this.#canvas.width,
      this.#canvas.height
    );
    for (let i = 3; i < imageData.data.length; i += 4) {
      imageData.data[i] = value;
    }
    this.#ctx2d.putImageData(imageData, 0, 0);
  }

  static fromFile(source: ImageBitmapSource): Promise<Layer> {
    return createImageBitmap(source).then((image) => {
      return new Layer(image.width, image.height, { image });
    });
  }
}
