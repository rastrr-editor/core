import { Rectangle } from '~/geometry';
import { Layer } from '~/layer';
import { getAreaFromPoints } from '~/utils/aggregate';
import { RewindableAsyncIterableIterator, map } from '~/utils/async-iter';
import { createDebug } from '~/utils/debug';
import { extractImageDataForArea, getLayerCanvasContext } from './helpers';
import { Command } from './interface';

export const debug = createDebug('commands');

export type LayerBackupData = {
  imageData: ImageData;
  area: {
    start: Rastrr.Point;
    end: Rastrr.Point;
  };
};

// TODO: implement write lock for the layer to prevent race conditions
export default abstract class LayerCommand implements Command {
  readonly name: string = 'unnamed';
  // TODO: delete
  protected context: CanvasRenderingContext2D;

  /**
   * Working layer, usually the active layer
   */
  protected layer: Layer;

  /**
   * Iterable of the drawing trajectory
   */
  protected iterable: RewindableAsyncIterableIterator<Rastrr.Point>;

  /**
   * Backup data of the modified area in the layer
   */
  protected backup?: LayerBackupData;

  constructor(layer: Layer, iterable: AsyncIterable<Rastrr.Point>) {
    this.layer = layer;
    this.iterable = new RewindableAsyncIterableIterator(
      // Map points to layer coordinates
      map(iterable, (point) => ({
        x: point.x - layer.offset.x,
        y: point.y - layer.offset.y,
      }))
    );
    this.context = getLayerCanvasContext(layer);
  }

  abstract execute(): Promise<boolean>;

  abstract undo(): Promise<boolean>;

  protected createBackup(areaModifier = 0): void {
    // Prevent backup override
    if (this.backup != null) {
      return;
    }
    const interactionArea = getAreaFromPoints(this.iterable.getBuffer());
    const resizedArea: Rastrr.Area = {
      start: {
        x: interactionArea.start.x - areaModifier,
        y: interactionArea.start.y - areaModifier,
      },
      end: {
        x: interactionArea.end.x + areaModifier,
        y: interactionArea.end.y + areaModifier,
      },
    };
    const areaRect = new Rectangle(resizedArea);
    const layerRect = new Rectangle(
      this.layer.offset,
      this.layer.width,
      this.layer.height
    );
    const intersection = areaRect.intersection(layerRect);
    if (intersection != null) {
      const area = intersection.toArea();
      const imageData = extractImageDataForArea(
        getLayerCanvasContext(this.layer),
        area.start,
        area.end
      );
      if (imageData != null) {
        debug(
          'backup layer, name: %s, id: %s, area corner: (%d, %d), area size: %d x %d',
          this.layer.name,
          this.layer.id,
          intersection.corner.x,
          intersection.corner.y,
          intersection.width,
          intersection.height
        );
        this.backup = {
          imageData,
          area,
        };
      }
    }
  }
}
