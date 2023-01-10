import { CommandOptions, LayerCommand } from '~/commands';
import { Layer, LayerFactory } from '~/layer';
import type { LayerList } from '~/layer-list';
import {
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

  constructor(
    layers: LayerList,
    iterable: AsyncIterable<Rastrr.Point>,
    options?: Partial<CommandOptions>
  ) {
    // TODO: refactor
    if (layers.activeLayer == null) {
      throw new TypeError('Active layer is not set');
    }
    super(layers.activeLayer, iterable);
    this.#layers = layers;
    this.options = applyDefaultOptions(options);
  }

  async execute(): Promise<boolean> {
    this.iterable.rewind();
    const { options, layer, iterable } = this;
    // FIXME: Move to createTemporaryLayer
    const index = this.#layers.indexOf(layer);
    if (index === -1) {
      return false;
    }
    const tmpLayer = LayerFactory.setType(layer.type).empty(
      layer.width,
      layer.height,
      { opacity: layer.opacity }
    );
    const insertIndex = index + 1;
    this.#layers.insert(insertIndex, tmpLayer, { tmp: true });
    const context = getLayerCanvasContext(tmpLayer);

    applyOptionsToCanvasCtx({ options, context, layer: tmpLayer });
    context.globalCompositeOperation = 'copy';

    await drawLine(context, tmpLayer, iterable);

    // TODO: refactor
    const beforeCommit = (_: Layer, activeLayer: Layer) => {
      if (this.backup == null) {
        const area = getAreaFromPoints(
          iterable.getBuffer(),
          { x: 0, y: 0 },
          { x: activeLayer.width, y: activeLayer.height }
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
            x: Math.min(area.end.x + modifier, activeLayer.width),
            y: Math.min(area.end.y + modifier, activeLayer.height),
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
    // TODO: refactor
    return commitTemporaryData(this.#layers, insertIndex, {
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
