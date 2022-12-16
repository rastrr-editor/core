import { LayerList } from '~/layer-list';
import { RenderStrategy } from './interface';

export default class Viewport {
  layers = new LayerList();
  readonly strategy: RenderStrategy;
  readonly container: HTMLElement;
  width?: number;
  height?: number;
  // TODO after implements history
  // history: History;

  constructor(container: HTMLElement, strategy: RenderStrategy) {
    this.container = container;
    this.strategy = strategy;
  }

  render(): Promise<void> {
    return this.strategy.render();
  }
}
