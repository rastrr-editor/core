import { Color, ColorRange } from '~/color';
import type { LayerOptions, Layer, LayerEmitter } from '~/layer/interface';
import { toColorRange, setColor } from './helpers';

export default class CanvasLayer implements Layer {
  readonly #canvas: HTMLCanvasElement;
  readonly #context: CanvasRenderingContext2D;
  #options: LayerOptions;
  #emitter?: LayerEmitter;
  #alpha: ColorRange = 255;
  #visible = true;
  #offset = { x: 0, y: 0 };
  name = 'Unnamed';
  locked = false;

  constructor(width = 0, height = 0, opts: LayerOptions = {}) {
    if (width === 0 || height === 0) {
      throw new Error('Incorrect constructor parameters.');
    }

    this.#canvas = document.createElement('canvas');
    this.#canvas.width = width;
    this.#canvas.height = height;

    const ctx = this.#canvas.getContext('2d');
    if (ctx === null) {
      throw new Error('Failed to get 2D context');
    }

    this.#context = ctx;
    this.#options = opts;

    if (opts.image instanceof ImageBitmap) {
      this.#context.drawImage(opts.image, 0, 0, width, height);
    } else if (opts.color) {
      this.#fill(opts.color);
    }
  }

  get canvas(): HTMLCanvasElement {
    return this.#canvas;
  }

  get data(): Uint8ClampedArray {
    return this.#context.getImageData(0, 0, this.width, this.height).data;
  }

  get width(): number {
    return this.#canvas.width;
  }

  get height(): number {
    return this.#canvas.height;
  }

  get opacity(): number {
    return this.#alpha / 255;
  }

  get visible(): boolean {
    return this.#visible;
  }

  get offset(): Rastrr.Point {
    return this.#offset;
  }

  #fill(color: Color): void {
    this.#context.fillStyle = color.toString('rgba');
    this.#context.fillRect(0, 0, this.width, this.height);
  }

  setData(data: Uint8ClampedArray): void {
    this.#context.putImageData(
      new ImageData(data, this.width, this.height),
      0,
      0
    );

    this.#emitter?.emit('change', this);
  }

  setEmitter(emitter: LayerEmitter): void {
    this.#emitter = emitter;
  }

  setOpacity(value: number): void {
    this.#alpha = toColorRange(value * 255);

    const imageData = this.#context.getImageData(0, 0, this.width, this.height);
    for (let i = 3; i < imageData.data.length; i += 4) {
      // TODO calculate opacity preserving initial alpha
      imageData.data[i] = this.#alpha;
    }
    this.#context.putImageData(imageData, 0, 0);

    this.#emitter?.emit('change', this);
  }

  setVisible(value: boolean): void {
    this.#visible = value;
    this.#emitter?.emit('change', this);
  }

  setOffset(value: Rastrr.Point): void {
    this.#offset = value;
    this.#emitter?.emit('change', this);
  }

  setWidth(value: number): void {
    const imageData = this.#context.getImageData(0, 0, value, this.height);

    if (value > this.width) {
      let col = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (col >= value) {
          col = 0;
        }
        if (col >= this.width && this.#options.color) {
          setColor(imageData.data, i, this.#options.color);
        }
        col++;
      }
    }

    this.#canvas.width = value;
    this.#context.putImageData(imageData, 0, 0);

    this.#emitter?.emit('change', this);
  }

  setHeight(value: number): void {
    const imageData = this.#context.getImageData(0, 0, this.width, value);

    if (value > this.height && this.#options.color) {
      for (
        let i = this.width * this.height * 4;
        i < imageData.data.length;
        i += 4
      ) {
        setColor(imageData.data, i, this.#options.color);
      }
    }

    this.#canvas.height = value;
    this.#context.putImageData(imageData, 0, 0);

    this.#emitter?.emit('change', this);
  }

  emitChange(): void {
    this.#emitter?.emit('change', this);
  }
}
