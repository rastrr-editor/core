import uniqid from 'uniqid';
import { Color, ColorRange } from '~/color';
import type {
  LayerOptions,
  Layer,
  LayerEmitter,
  LayerDrawContentsOptions,
} from '~/layer/interface';
import { toColorRange, setColor } from './helpers';

export default class CanvasLayer implements Layer {
  readonly id: string;
  readonly #canvas: HTMLCanvasElement;
  readonly #context: CanvasRenderingContext2D;
  readonly type = 'canvas';
  #options: LayerOptions;
  #emitter?: LayerEmitter;
  #alpha: ColorRange = 255;
  #alphaData!: Uint8Array;
  #visible = true;
  #offset = { x: 0, y: 0 };
  name = 'Unnamed';
  locked = false;

  constructor(width = 0, height = 0, opts: LayerOptions = {}) {
    if (width === 0 || height === 0) {
      throw new Error('Incorrect constructor parameters.');
    }
    this.id = opts.id ?? uniqid();
    this.#canvas = document.createElement('canvas');
    this.#canvas.width = width;
    this.#canvas.height = height;
    this.#alpha = toColorRange((opts.opacity ?? 1) * 255);

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
    this.commitContentChanges();
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
    this.commitContentChanges();
  }

  drawContents(layer: Layer, options: LayerDrawContentsOptions = {}): void {
    const {
      srcOffset = { x: 0, y: 0 },
      srcSize,
      destOffset = { x: 0, y: 0 },
      destSize,
      globalCompositeOperation = 'source-over',
    } = options;
    this.#context.globalCompositeOperation = globalCompositeOperation;
    this.#context.drawImage(
      layer.canvas,
      srcOffset.x,
      srcOffset.y,
      srcSize?.x ?? layer.width,
      srcSize?.y ?? layer.height,
      destOffset.x,
      destOffset.y,
      destSize?.x ?? layer.width,
      destSize?.y ?? layer.height
    );
    this.commitContentChanges();
  }

  setData(data: Uint8ClampedArray): void {
    this.#context.putImageData(
      new ImageData(data, this.width, this.height),
      0,
      0
    );
    this.commitContentChanges();
    this.#emitter?.emit('change', this);
  }

  setEmitter(emitter: LayerEmitter): void {
    this.#emitter = emitter;
  }

  setOpacity(value: number): void {
    const { opacity: prev } = this;
    this.#alpha = toColorRange(value * 255);
    const { opacity: next } = this;
    this.#emitter?.emit('opacityChange', this, { prev, next });
    const imageData = this.#context.getImageData(0, 0, this.width, this.height);
    for (let i = 3; i < imageData.data.length; i += 4) {
      // FIXME: if pixel becomes fully transparent it loses the color bytes
      imageData.data[i] = toColorRange(
        this.#alphaData[Math.floor(i / 4)] * next
      );
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
    this.commitContentChanges();
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
    this.commitContentChanges();
    this.#emitter?.emit('change', this);
  }

  /**
   * This method should be called by external modules when they change the layer
   */
  emitChange(): void {
    this.#emitter?.emit('change', this);
  }

  /**
   * This method must be called when final changes are made to the layer.
   * I.e.: external command has finished, layer was filled with color, layer was resized, etc.
   */
  commitContentChanges() {
    // FIXME: this method is synchronous and on large canvas sizes it will block the main thread.
    // Proposed solution: use green threads and add boolean prop "ready" to layer.
    // Changes to layer will be allowed only if it's "ready"
    const { data } = this;
    this.#alphaData = new Uint8Array(Math.floor(data.length / 4));
    for (let i = 3; i < data.length; i += 4) {
      this.#alphaData[Math.floor(i / 4)] = data[i];
    }
  }
}
