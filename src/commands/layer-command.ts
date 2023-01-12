import { Rectangle } from '~/geometry';
import { Layer } from '~/layer';
import { getAreaFromPoints } from '~/utils/aggregate';
import { RewindableAsyncIterableIterator, map } from '~/utils/async-iter';
import { createDebug } from '~/utils/debug';
import { extractImageDataForArea, getLayerCanvasContext } from './helpers';
import { Command } from './interface';

export const debug = createDebug('commands');

// TODO: Consider creating debug helpers for different entities
export const debugRectangle = (
  prefix: string,
  rect: Rectangle,
  ...args: unknown[]
): void => {
  debug(
    `${prefix}corner: (%d, %d), size: %d x %d`,
    ...args,
    rect.corner.x,
    rect.corner.y,
    rect.width,
    rect.height
  );
};

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

  // TODO: refactor
  protected copyContext(
    context: CanvasRenderingContext2D
  ): CanvasRenderingContext2D | null {
    const rect = new Rectangle(
      { x: 0, y: 0 },
      this.layer.width,
      this.layer.height
    );
    const area = rect.toArea();
    const imageData = extractImageDataForArea(context, area.start, area.end);
    if (imageData) {
      const canvas = document.createElement('canvas');
      canvas.width = this.layer.width;
      canvas.height = this.layer.height;
      const copyContext = canvas.getContext('2d');
      copyContext?.putImageData(imageData, 0, 0);
      return copyContext;
    }
    return null;
  }

  /**
   * Get intersection with the layer affected by the command.
   * It can be called only after iterable has ended.
   * @param areaModifier
   * @returns
   */
  protected getIntersection(areaModifier = 0): Rectangle | null {
    // Interaction area is relative to the layer coordinate system
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
      { x: 0, y: 0 },
      this.layer.width,
      this.layer.height
    );
    debugRectangle(
      'layer area, name: %s, id: %s, ',
      layerRect,
      this.layer.name,
      this.layer.id
    );
    debugRectangle('modified area, ', areaRect);
    return areaRect.intersection(layerRect);
  }

  protected createBackup(areaModifier = 0): void {
    // Prevent backup override
    if (this.backup != null) {
      return;
    }
    const intersection = this.getIntersection(areaModifier);
    if (intersection != null) {
      const area = intersection.toArea();
      const imageData = extractImageDataForArea(
        getLayerCanvasContext(this.layer),
        area.start,
        area.end
      );
      if (imageData != null) {
        debugRectangle(
          'backup layer, name: %s, id: %s, ',
          intersection,
          this.layer.name,
          this.layer.id
        );
        this.backup = {
          imageData,
          area,
        };
      }
    }
  }
}
