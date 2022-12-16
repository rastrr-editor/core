import { LayerList } from '~/layer-list';
import type {
  RenderStrategy,
  RenderStrategyType,
  RenderStrategyConstructor,
} from './interface';
import CanvasRenderStrategy from './render-strategy/canvas-render-strategy';

export default class Viewport {
  readonly layers = new LayerList();
  readonly strategy: RenderStrategy;
  readonly container: HTMLCanvasElement;
  // TODO after implements history
  // history: History;

  constructor(container: HTMLCanvasElement, strategy: RenderStrategyType) {
    this.container = container;

    const Renderer = this.#getClassRenderer(strategy);
    this.strategy = new Renderer(container, this.layers);
  }

  get width(): number {
    return this.container.width;
  }

  get height(): number {
    return this.container.height;
  }

  setWidth(value: number): void {
    this.container.width = value;
    this.render();
  }

  setHeight(value: number): void {
    this.container.height = value;
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
}
