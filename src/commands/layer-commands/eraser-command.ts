import { CommandOptions, LayerCommand } from '~/commands';
import { LayerList } from '~/layer-list';
import {
  applyOptionsToCanvasCtx,
  applyDefaultOptions,
  drawLine,
} from '~/commands/helpers';

export default class EraserCommand extends LayerCommand {
  readonly options: CommandOptions;
  readonly name = 'Ластик';

  constructor(
    layers: LayerList,
    iterable: AsyncIterable<Rastrr.Point>,
    options?: Partial<CommandOptions>
  ) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    super(layers.activeLayer!, iterable);
    this.options = applyDefaultOptions(options);
  }

  async execute(): Promise<boolean> {
    const { options, context, layer, iterable } = this;
    applyOptionsToCanvasCtx({ options, context, layer });
    this.context.globalCompositeOperation = 'destination-out';

    await drawLine(context, layer, iterable);

    return true;
  }
}
