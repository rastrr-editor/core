import { createDebug } from '~/utils';
import { LayerList } from '~/layer-list';
import type {
  RenderStrategy,
  RenderStrategyType,
  RenderStrategyConstructor,
} from '~/render';
import { CanvasRenderStrategy, type RenderOptions } from '~/render';
import { History } from '~/history';
import { Color } from '~/color';

const debug = createDebug('viewport');

type ViewportOptions = {
  /**
   * Render strategy type
   */
  strategy: RenderStrategyType;
  /**
   * Image size
   */
  imageSize?: Rastrr.Point;
  /**
   * Minimal offset between layer and HTML canvas
   */
  minOffset?: Rastrr.Point;
  /**
   * Delta to correct HTML Canvas width and height
   */
  htmlSizeDelta?: Rastrr.Point;
  /**
   * Useful for transparent background
   */
  workingAreaBorderColor?: Color | null;
};

export enum RenderMode {
  IMMEDIATE = 0,
  BATCH = 1,
}

export default class Viewport {
  readonly container: HTMLElement;
  readonly layers = new LayerList();
  readonly strategy: RenderStrategy;
  readonly history: History;
  readonly options: Required<ViewportOptions>;
  #canvas: HTMLCanvasElement;
  #renderQueueSize = 0;
  #renderMode: RenderMode = RenderMode.IMMEDIATE;
  #meta: unknown;

  constructor(container: HTMLElement, options: ViewportOptions) {
    this.container = container;
    this.options = {
      ...options,
      imageSize: options.imageSize ?? { x: 0, y: 0 },
      minOffset: options.minOffset ?? { x: 0, y: 0 },
      htmlSizeDelta: options.htmlSizeDelta ?? { x: 0, y: 0 },
      workingAreaBorderColor: options.workingAreaBorderColor ?? null,
    };
    this.#canvas = this.#createCanvas();

    const Renderer = Viewport.#getClassRenderer(this.options.strategy);
    this.strategy = new Renderer(this.#canvas, this.layers);
    this.history = new History();
    this.watch();
  }

  get offset(): Rastrr.Point {
    return {
      x: Math.max(
        this.options.minOffset.x,
        Math.round(this.width / 2) - Math.round(this.options.imageSize.x / 2)
      ),
      y: Math.max(
        this.options.minOffset.y,
        Math.round(this.height / 2) - Math.round(this.options.imageSize.y / 2)
      ),
    };
  }

  get width(): number {
    return this.#canvas.width;
  }

  get height(): number {
    return this.#canvas.height;
  }

  get meta(): unknown {
    return this.#meta;
  }

  setMeta(value: unknown) {
    this.#meta = value;
  }

  setWidth(value: number): Promise<void> {
    this.#canvas.width = value;
    return this.render();
  }

  setHeight(value: number): Promise<void> {
    this.#canvas.height = value;
    return this.render();
  }

  setRenderMode(mode: RenderMode): void {
    this.#renderMode = mode;
  }

  render(): Promise<void> {
    if (this.#renderMode === RenderMode.IMMEDIATE) {
      debug('call strategy render');
      const options: RenderOptions = {
        offset: this.offset,
        size: this.options.imageSize,
      };
      if (this.options.workingAreaBorderColor != null) {
        options.borderColor = this.options.workingAreaBorderColor;
      }
      return this.strategy.render(options);
    }
    return this.batchRender();
  }

  protected batchRender(): Promise<void> {
    this.#renderQueueSize++;
    debug('delay render, queue size: %d', this.#renderQueueSize);
    return new Promise(() => {
      // NOTE: all commands are implemented via promises which use microtasks.
      // Delaying render via queueMicroTask guarantees that render will be performed
      // after all commands have finished. It is especially useful for history traversal.
      queueMicrotask(() => {
        // Call render only in last microtask
        if (--this.#renderQueueSize <= 0) {
          this.#renderQueueSize = 0;
          return this.render();
        }
      });
    });
  }

  static #getClassRenderer(
    strategy: RenderStrategyType
  ): RenderStrategyConstructor {
    switch (strategy) {
      case 'canvas':
        return CanvasRenderStrategy;
      default:
        throw new Error('Unknown render strategy.');
    }
  }

  #createCanvas(): HTMLCanvasElement {
    const { imageSize, minOffset, htmlSizeDelta } = this.options;
    const canvasElement = document.createElement('canvas');
    // Get width from container or canvas size
    canvasElement.width =
      Math.max(imageSize.x, this.container.clientWidth + htmlSizeDelta.x) +
      // if container width is less than canvas width - add min offset
      (this.container.clientWidth - imageSize.x <= minOffset.x * 2
        ? minOffset.x * 2
        : 0);
    // Get height from container or canvas size
    canvasElement.height =
      Math.max(imageSize.y, this.container.clientHeight + htmlSizeDelta.y) +
      // if container height is less than canvas height - add min offset
      (this.container.clientHeight - imageSize.y <= minOffset.y * 2
        ? minOffset.y * 2
        : 0);

    this.container.append(canvasElement);

    return canvasElement;
  }

  destroy() {
    this.#canvas.remove();
    this.layers.clear();
  }

  toBlob(mimeType = 'image/png', quality?: number): Promise<Blob | null> {
    return this.strategy.toBlob({
      imageSize: this.options.imageSize,
      mimeType,
      quality,
    });
  }

  watch() {
    // add, move, remove events should be delayed
    // because there might be multiple events of this type
    // in stack frame so it's better to bulk them
    this.layers.emitter.on('add', () => {
      this.batchRender();
    });
    this.layers.emitter.on('change', () => {
      this.render();
    });
    this.layers.emitter.on('move', () => {
      this.batchRender();
    });
    this.layers.emitter.on('remove', () => {
      this.batchRender();
    });
    this.layers.emitter.on('clear', () => {
      this.render();
    });
  }
}
