import { LayerList } from '~/layer-list';
import type {
  RenderStrategy,
  RenderStrategyType,
  RenderStrategyConstructor,
} from '~/render';
import { CanvasRenderStrategy } from '~/render';

type ViewportOptions = {
  /**
   * Render strategy type
   */
  strategy: RenderStrategyType;
  /**
   * Canvas (not HTML) size, i.e. user specified image size
   */
  canvasSize?: Rastrr.Point;
  /**
   * Minimal offset between layer and HTML canvas
   */
  minOffset?: Rastrr.Point;
  /**
   * Delta to correct HTML Canvas width and height
   */
  htmlSizeDelta?: Rastrr.Point;
};

export default class Viewport {
  readonly container: HTMLElement;
  readonly layers = new LayerList();
  readonly strategy: RenderStrategy;
  readonly options: Required<ViewportOptions>;
  #canvas: HTMLCanvasElement;
  // TODO after implements history
  // history: History;

  constructor(container: HTMLElement, options: ViewportOptions) {
    this.container = container;
    this.options = {
      ...options,
      canvasSize: options.canvasSize ?? { x: 0, y: 0 },
      minOffset: options.minOffset ?? { x: 0, y: 0 },
      htmlSizeDelta: options.htmlSizeDelta ?? { x: 0, y: 0 },
    };
    this.#canvas = this.#createCanvas();

    const Renderer = Viewport.#getClassRenderer(this.options.strategy);
    this.strategy = new Renderer(this.#canvas, this.layers);
    this.watch();
  }

  get offset(): Rastrr.Point {
    return {
      x: Math.max(
        this.options.minOffset.x,
        Math.round(this.width / 2) - Math.round(this.options.canvasSize.x / 2)
      ),
      y: Math.max(
        this.options.minOffset.y,
        Math.round(this.height / 2) - Math.round(this.options.canvasSize.y / 2)
      ),
    };
  }

  get width(): number {
    return this.#canvas.width;
  }

  get height(): number {
    return this.#canvas.height;
  }

  setWidth(value: number): Promise<void> {
    this.#canvas.width = value;
    return this.render();
  }

  setHeight(value: number): Promise<void> {
    this.#canvas.height = value;
    return this.render();
  }

  render(): Promise<void> {
    return this.strategy.render(this.offset);
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
    const { canvasSize, minOffset, htmlSizeDelta } = this.options;
    const canvasElement = document.createElement('canvas');
    // Get width from container or canvas size
    canvasElement.width =
      Math.max(canvasSize.x, this.container.clientWidth + htmlSizeDelta.x) +
      // if container width is less than canvas width - add min offset
      (this.container.clientWidth - canvasSize.x <= minOffset.x * 2
        ? minOffset.x * 2
        : 0);
    // Get height from container or canvas size
    canvasElement.height =
      Math.max(canvasSize.y, this.container.clientHeight + htmlSizeDelta.y) +
      // if container height is less than canvas height - add min offset
      (this.container.clientHeight - canvasSize.y <= minOffset.y * 2
        ? minOffset.y * 2
        : 0);

    this.container.append(canvasElement);

    return canvasElement;
  }

  destroy() {
    this.#canvas.remove();
    this.layers.clear();
  }

  watch() {
    this.layers.emitter.on('add', () => {
      this.render();
    });
    this.layers.emitter.on('change', () => {
      this.render();
    });
    this.layers.emitter.on('move', () => {
      this.render();
    });
    this.layers.emitter.on('remove', () => {
      this.render();
    });
    this.layers.emitter.on('clear', () => {
      this.render();
    });
  }
}
