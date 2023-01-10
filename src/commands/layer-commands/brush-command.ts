import { CommandOptions, LayerCommand } from '~/commands';
import { LayerList } from '~/layer-list';
import {
  createTemporaryLayer,
  commitTemporaryData,
  applyOptionsToCanvasCtx,
  applyDefaultOptions,
  drawLine,
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

    await drawLine(context, layer, iterable);
    commitTemporaryData(this.#layers, this.#insertIndex);

    return true;
  }
}
