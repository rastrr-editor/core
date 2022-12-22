import { LayerList } from '~/layer-list';
import type {
  RenderStrategy,
  RenderStrategyType,
  RenderStrategyConstructor,
} from '~/render';
import { CanvasRenderStrategy } from '~/render';
import { ViewportEmitter } from './interface';
import EventEmitter from 'events';

export default class Viewport {
  readonly layers = new LayerList();
  readonly strategy: RenderStrategy;
  readonly container: HTMLElement;
  readonly #canvas: HTMLCanvasElement;
  readonly emitter: ViewportEmitter;
  // TODO after implements history
  // history: History;

  constructor(container: HTMLElement, strategy: RenderStrategyType) {
    this.container = container;
    this.#canvas = Viewport.#createCanvasInContainer(container);

    const Renderer = Viewport.#getClassRenderer(strategy);
    this.strategy = new Renderer(this.#canvas, this.layers);

    this.emitter = new EventEmitter() as ViewportEmitter;
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

  setWidth(value: number): Promise<void> {
    this.#canvas.width = value;
    return this.strategy.render();
  }

  setHeight(value: number): Promise<void> {
    this.#canvas.height = value;
    return this.strategy.render();
  }

  render(): Promise<void> {
    return this.strategy.render();
  }

  static #getClassRenderer(
    strategy: RenderStrategyType
  ): RenderStrategyConstructor {
    switch (strategy) {
      case 'canvas':
        return class extends CanvasRenderStrategy {};
      default:
        throw new Error('Unknown render strategy.');
    }
  }

  static #createCanvasInContainer(container: HTMLElement): HTMLCanvasElement {
    const canvasElement = document.createElement('canvas');
    canvasElement.width = container.clientWidth;
    canvasElement.height = container.clientHeight;

    container.append(canvasElement);

    return canvasElement;
  }
}
