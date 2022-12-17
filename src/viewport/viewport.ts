import { LayerList } from '~/layer-list';
import type {
  RenderStrategy,
  RenderStrategyType,
  RenderStrategyConstructor,
} from '~/render';
import { CanvasRenderStrategy } from '~/render';

export default class Viewport {
  readonly layers = new LayerList();
  readonly strategy: RenderStrategy;
  readonly container: HTMLElement;
  #canvas: HTMLCanvasElement;
  // TODO after implements history
  // history: History;

  constructor(container: HTMLElement, strategy: RenderStrategyType) {
    this.container = container;
    this.#canvas = this.#createCanvasInContainer(container);

    const Renderer = this.#getClassRenderer(strategy);
    this.strategy = new Renderer(this.#canvas, this.layers);
  }

  get width(): number {
    return this.#canvas.width;
  }

  get height(): number {
    return this.#canvas.height;
  }

  setWidth(value: number): void {
    this.#canvas.width = value;
    this.render();
  }

  setHeight(value: number): void {
    this.#canvas.height = value;
    this.render();
  }

  render(): Promise<void> {
    return this.strategy.render();
  }

  #getClassRenderer(strategy: RenderStrategyType): RenderStrategyConstructor {
    switch (strategy) {
      case 'canvas':
        return class extends CanvasRenderStrategy {};
      default:
        throw new Error('Unknown render strategy.');
    }
  }

  #createCanvasInContainer(container: HTMLElement): HTMLCanvasElement {
    const canvasElement = document.createElement('canvas');
    canvasElement.width = container.clientWidth;
    canvasElement.height = container.clientHeight;

    container.append(canvasElement);

    return canvasElement;
  }
}
