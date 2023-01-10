import { Layer } from '~/layer';
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

export default abstract class LayerCommand implements Command {
  readonly name: string = 'unnamed';
  protected context: CanvasRenderingContext2D;
  protected layer: Layer;
  protected iterable: AsyncIterable<Rastrr.Point>;
  protected backup?: LayerBackupData;

  constructor(layer: Layer, iterable: AsyncIterable<Rastrr.Point>) {
    this.layer = layer;
    this.iterable = iterable;
    this.context = getLayerCanvasContext(layer);
  }

  abstract execute(): Promise<boolean>;

  abstract undo(): Promise<boolean>;
}
