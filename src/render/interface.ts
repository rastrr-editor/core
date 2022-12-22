import { LayerList } from '~/layer-list';

export type RenderStrategyType = 'canvas';

export interface RenderStrategyConstructor {
  new (container: HTMLCanvasElement, layers: LayerList): RenderStrategy;
}

export interface RenderStrategy {
  render(): Promise<void>;
}
