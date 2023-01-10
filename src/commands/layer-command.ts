import { Layer } from '~/layer';
import { RewindableAsyncIterableIterator } from '~/utils/async-iter';
import { getLayerCanvasContext } from './helpers';
import { Command } from './interface';

export type LayerBackupData = {
  layerId: string;
  imageData: ImageData;
  area: {
    start: Rastrr.Point;
    end: Rastrr.Point;
  };
};

// TODO: implement write lock for the layer to prevent race conditions
export default abstract class LayerCommand implements Command {
  readonly name: string = 'unnamed';
  protected context: CanvasRenderingContext2D;
  protected layer: Layer;
  protected iterable: RewindableAsyncIterableIterator<Rastrr.Point>;
  protected backup?: LayerBackupData;

  constructor(layer: Layer, iterable: AsyncIterable<Rastrr.Point>) {
    this.layer = layer;
    this.iterable = new RewindableAsyncIterableIterator(iterable);
    this.context = getLayerCanvasContext(layer);
  }

  abstract execute(): Promise<boolean>;

  abstract undo(): Promise<boolean>;
}
