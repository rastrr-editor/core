import { CommandOptions, LayerCommand } from '~/commands';
import { LayerList } from '~/layer-list';
import {
  createTemporaryLayer,
  commitTemporaryData,
  applyOptionsToCanvasCtx,
  applyDefaultOptions,
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
    let prevPosition: Rastrr.Point | null = null;
    const { options, context, layer } = this;
    applyOptionsToCanvasCtx({ options, context, layer });
    this.context.globalCompositeOperation = 'copy';

    this.context.beginPath();
    for await (const point of this.iterable) {
      if (!prevPosition) {
        this.context.moveTo(point.x, point.y);
      }
      // Deduplicate repeating points
      if (prevPosition?.x !== point.x || prevPosition?.y !== point.y) {
        this.context.lineTo(point.x, point.y);
        this.context.stroke();
        prevPosition = point;
        this.layer.emitChange();
      }
    }

    commitTemporaryData(this.#layers, this.#insertIndex);

    return true;
  }
}
