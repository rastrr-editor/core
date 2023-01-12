import { CommandOptions, LayerCommand } from '~/commands';
import type { LayerList } from '~/layer-list';
import {
  commitTemporaryData,
  applyOptionsToCanvasCtx,
  applyDefaultOptions,
  drawLine,
  getLayerCanvasContext,
  createTemporaryLayer,
} from '~/commands/helpers';

export default class BrushCommand extends LayerCommand {
  readonly options: CommandOptions;
  readonly name = 'Кисть';
  #layers: LayerList;

  constructor(
    layers: LayerList,
    iterable: AsyncIterable<Rastrr.Point>,
    options?: Partial<CommandOptions>
  ) {
    if (layers.activeLayer == null) {
      throw new TypeError('Active layer is not set');
    }
    super(layers.activeLayer, iterable);
    this.#layers = layers;
    this.options = applyDefaultOptions(options);
  }

  async execute(): Promise<boolean> {
    this.iterable.rewind();
    const { options, iterable } = this;
    const result = createTemporaryLayer(this.#layers, this.layer);
    if (result == null) {
      return false;
    }
    const { layer, index } = result;
    // Prepare canvas context
    const context = getLayerCanvasContext(layer);
    applyOptionsToCanvasCtx({ options, context, layer });
    context.globalCompositeOperation = 'copy';
    // Draw
    await drawLine(context, layer, iterable);
    // Commit
    const beforeCommit = () => {
      // Modify area size with respect of line width
      this.createBackup(Math.ceil((this.options.width ?? 1) / 1.5));
    };
    return (
      commitTemporaryData(this.#layers, index, this.layer, {
        beforeCommit,
      }) && this.layerIsModified
    );
  }

  async undo(): Promise<boolean> {
    if (this.backup == null || !this.#layers.has(this.layer)) {
      return false;
    }
    this.layer.drawImageData(this.backup.imageData, this.backup.area.start);
    return true;
  }
}
