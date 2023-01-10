import { CommandOptions, LayerCommand } from '~/commands';
import type { Layer } from '~/layer';
import type { LayerList } from '~/layer-list';
import {
  createTemporaryLayer,
  commitTemporaryData,
  applyOptionsToCanvasCtx,
  applyDefaultOptions,
  drawLine,
  extractImageDataForArea,
  getLayerCanvasContext,
} from '~/commands/helpers';
import { getAreaFromPoints } from '~/utils/aggregate';

export default class BrushCommand extends LayerCommand {
  readonly options: CommandOptions;
  readonly name = 'Кисть';
  #layers: LayerList;
  #insertIndex: number;

  constructor(
    layers: LayerList,
    iterable: AsyncIterable<Rastrr.Point>,
    options?: Partial<CommandOptions>
  ) {
    const { layer, index } = createTemporaryLayer(layers);
    super(layer, iterable);
    this.#insertIndex = index;
    this.#layers = layers;
    this.options = applyDefaultOptions(options);
  }

  async execute(): Promise<boolean> {
    this.iterable.rewind();
    const { options, context, layer, iterable } = this;
    applyOptionsToCanvasCtx({ options, context, layer });
    this.context.globalCompositeOperation = 'copy';

    await drawLine(context, layer, iterable);

    // TODO: refactor
    const beforeCommit = (tmpLayer: Layer, activeLayer: Layer) => {
      if (this.backup == null) {
        const area = getAreaFromPoints(
          iterable.getBuffer(),
          { x: 0, y: 0 },
          { x: this.layer.width, y: this.layer.height }
        );
        const modifier = Math.ceil((this.options.width ?? 1) / 1.5);
        // FIXME: check if area intersects with layer area
        if (area.start.x !== area.end.x && area.start.y !== area.end.y) {
          // FIXME: if area intersects scope it within layer area
          area.start = {
            x: Math.max(area.start.x - modifier, 0),
            y: Math.max(area.start.y - modifier, 0),
          };
          area.end = {
            x: Math.min(area.end.x + modifier, this.layer.width),
            y: Math.min(area.end.y + modifier, this.layer.height),
          };
        }
        // Backup only the modified area of the canvas
        const imageData = extractImageDataForArea(
          getLayerCanvasContext(activeLayer),
          area.start,
          area.end
        );
        if (imageData != null) {
          this.backup = {
            layerId: activeLayer.id,
            imageData,
            area,
          };
        }
      }
    };
    return commitTemporaryData(this.#layers, this.#insertIndex, {
      beforeCommit,
    });
  }

  async undo(): Promise<boolean> {
    if (this.backup == null) {
      return false;
    }
    const layer = this.#layers.get(this.backup.layerId);
    if (layer == null) {
      return false;
    }
    layer.drawImageData(this.backup.imageData, this.backup.area.start);
    return true;
  }
}
