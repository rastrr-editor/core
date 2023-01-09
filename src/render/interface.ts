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

export interface RenderStrategy {
  render(viewportOffset: Rastrr.Point): Promise<void>;
  toBlob(options: BlobOptions): Promise<Blob | null>;
}
