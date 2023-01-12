import { CommandOptions, LayerCommand } from '~/commands';
import { debugRectangle } from '../layer-command';
import { LayerList } from '~/layer-list';
import {
  applyOptionsToCanvasCtx,
  applyDefaultOptions,
  drawLine,
  getLayerCanvasContext,
  extractImageDataForArea,
} from '~/commands/helpers';

export default class EraserCommand extends LayerCommand {
  readonly options: CommandOptions;
  readonly name = 'Ластик';

  constructor(
    layers: LayerList,
    iterable: AsyncIterable<Rastrr.Point>,
    options?: Partial<CommandOptions>
  ) {
    if (layers.activeLayer == null) {
      throw new TypeError('Active layer is not set');
    }
    super(layers.activeLayer, iterable);
    this.options = applyDefaultOptions(options);
  }

  async execute(): Promise<boolean> {
    this.iterable.rewind();
    const { options, layer, iterable } = this;
    const context = getLayerCanvasContext(layer);
    // Make backup of the current context
    let backupContext: CanvasRenderingContext2D | null = null;
    if (this.backup == null) {
      backupContext = this.copyContext(context);
    }
    // Prepare canvas context
    applyOptionsToCanvasCtx({ options, context, layer });
    context.globalCompositeOperation = 'destination-out';

    // Draw
    await drawLine(context, layer, iterable);
    // TODO: refactor
    // Backup affected area
    if (backupContext != null) {
      const intersection = this.getIntersection(
        Math.ceil((this.options.width ?? 1) / 1.5)
      );
      if (intersection != null) {
        const area = intersection.toArea();
        debugRectangle(
          'backup layer, name: %s, id: %s, ',
          intersection,
          this.layer.name,
          this.layer.id
        );
        const imageData = extractImageDataForArea(
          backupContext,
          area.start,
          area.end
        );
        if (imageData != null) {
          this.backup = {
            imageData,
            area,
          };
        }
      }
    }
    return this.layerIsModified;
  }

  async undo() {
    if (this.backup == null) {
      return false;
    }
    this.layer.drawImageData(this.backup.imageData, this.backup.area.start);
    return true;
  }
}
