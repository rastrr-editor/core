import type { CommandOptions } from '~/commands';
import { ShapeCommand } from '~/commands';
import { LayerList } from '~/layer-list';
import {
  applyOptionsToCanvasCtx,
  applyDefaultOptions,
} from '~/commands/helpers';

interface RectOptions extends CommandOptions {
  operation?: 'fill' | 'stroke';
}

export default class RectCommand extends ShapeCommand {
  readonly options: RectOptions;
  readonly name = 'Прямоугольник';

  constructor(
    layers: LayerList,
    iterable: AsyncIterable<Rastrr.Point>,
    options?: Partial<RectOptions>
  ) {
    super(layers, iterable);
    this.options = applyDefaultOptions(options);
  }

  async execute(): Promise<boolean> {
    let startPosition: Rastrr.Point | null = null;
    const { options, context, layer } = this;
    applyOptionsToCanvasCtx({
      options,
      context,
      layer,
      operation: this.options.operation,
    });
    this.context.globalCompositeOperation = 'copy';

    for await (const point of this.iterable) {
      if (!startPosition) {
        startPosition = point;
      }

      if (
        startPosition &&
        (startPosition?.x !== point.x || startPosition?.y !== point.y)
      ) {
        const width = point.x - startPosition.x;
        // TODO: detect shift pressed and make height equal to width
        const height = point.y - startPosition.y;
        this.context[
          this.options.operation === 'fill' ? 'fillRect' : 'strokeRect'
        ](startPosition.x, startPosition.y, width, height);
        this.layer.emitChange();
      }
    }

    return true;
  }
}
