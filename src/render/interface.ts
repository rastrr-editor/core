import { LayerList } from '~/layer-list';

export type RenderStrategyType = 'canvas';

export interface RenderStrategyConstructor {
  new (container: HTMLCanvasElement, layers: LayerList): RenderStrategy;
}

export type BlobOptions = {
  imageSize: Rastrr.Point;
  mimeType?: string;
  quality?: number;
};

export type RenderOptions = {
  offset?: Rastrr.Point;
  size?: Rastrr.Point;
};

export interface RenderStrategy {
  render(options: RenderOptions): Promise<void>;
  toBlob(options: BlobOptions): Promise<Blob | null>;
}
