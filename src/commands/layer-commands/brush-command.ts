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
    const { options, context, layer, iterable } = this;
    applyOptionsToCanvasCtx({ options, context, layer });
    this.context.globalCompositeOperation = 'copy';
    // TODO: calculate start/end from iterable
    const start = { x: 0, y: 0 };
    const end = { x: layer.width, y: layer.height };

    await drawLine(context, layer, iterable);

    const beforeCommit = (tmpLayer: Layer, activeLayer: Layer) => {
      if (this.backup == null) {
        this.backup = {
          layerId: activeLayer.id,
          imageData: extractImageDataForArea(
            getLayerCanvasContext(activeLayer),
            start,
            end
          ),
          area: { start, end },
        };
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
