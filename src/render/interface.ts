import { LayerList } from '~/layer-list';
import { Color } from '~/color';

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
  /**
   * Global offset of the working area
   */
  offset?: Rastrr.Point;
  /**
   * Size of the image
   */
  size?: Rastrr.Point;
  /**
   * Will render border if set
   */
  borderColor?: Color;
};

export interface RenderStrategy {
  render(options: RenderOptions): Promise<void>;
  toBlob(options: BlobOptions): Promise<Blob | null>;
}
