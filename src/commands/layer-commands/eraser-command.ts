import { CommandOptions, LayerCommand } from '~/commands';
import { LayerList } from '~/layer-list';
import {
  applyOptionsToCanvasCtx,
  applyDefaultOptions,
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
    let prevPosition: Rastrr.Point | null = null;
    const { options, context, layer } = this;
    applyOptionsToCanvasCtx({ options, context, layer });
    this.context.globalCompositeOperation = 'destination-out';

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

    return true;
  }
}
