import { Color, ColorRange } from '~/color';
import { LayerOptions, Layer, LayerEmitter } from '~/layer/interface';

export default class CanvasLayer implements Layer {
  readonly #canvas: HTMLCanvasElement;
  readonly #context: CanvasRenderingContext2D;
  #emitter?: LayerEmitter;
  #opacity: ColorRange = 0;
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
      throw new Error('Error create 2D context');
    }

    this.#context = ctx;

    if (opts.image instanceof ImageBitmap) {
      this.#context.drawImage(opts.image, 0, 0, width, height);
    } else {
      this.#fill(opts.color ?? new Color(255, 255, 255, 255));
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

  get opacity(): ColorRange {
    return this.#opacity;
  }

  get visible(): boolean {
    return this.#visible;
  }

  get offset(): Point {
    return this.#offset;
  }

  #fill(color: Color): void {
    this.#context.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${
      color.a / 256
    })`;
    this.#context.fillRect(0, 0, this.width, this.height);
  }

  // TODO delete after implements commands
  rectangle(x: number, y: number, w: number, h: number, color: Color): void {
    this.#context.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${
      color.a / 256
    })`;
    this.#context.fillRect(x, y, w, h);
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

  setOpacity(value: ColorRange): void {
    const imageData = this.#context.getImageData(
      0,
      0,
      this.#canvas.width,
      this.#canvas.height
    );
    for (let i = 3; i < imageData.data.length; i += 4) {
      imageData.data[i] = value;
    }
    this.#context.putImageData(imageData, 0, 0);

    this.#opacity = value;

    this.#emitter?.emit('change', this);
  }

  setVisible(value: boolean): void {
    this.#visible = value;
    this.#emitter?.emit('change', this);
  }

  setOffset(value: Point): void {
    this.#offset = value;
    this.#emitter?.emit('change', this);
  }
}
