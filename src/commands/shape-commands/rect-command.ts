import type { Command, CommandOptions } from '~/commands';
import { ShapeCommand } from '~/commands';
import { Color } from '~/color';
import { LayerList } from '~/layer-list';
import { applyOptions } from '~/commands/helpers';

interface RectOptions extends CommandOptions {
  color: Color;
  width: number;
  lineCap: 'butt' | 'round' | 'square';
}

export default class RectCommand extends ShapeCommand implements Command {
  readonly options: RectOptions;
  readonly name = 'Прямоугольник';

  constructor(
    layers: LayerList,
    iterable: AsyncIterable<Rastrr.Point>,
    options?: Partial<RectOptions>
  ) {
    super(layers, iterable);

    this.options = {
      ...options,
      color: options?.color ?? new Color(0, 0, 0, 255),
      width: options?.width ?? 1,
      lineCap: options?.lineCap ?? 'round',
    };
  }

  async execute(): Promise<boolean> {
    let startPosition: Rastrr.Point | null = null;

    applyOptions(this.context, this.options);
    this.context.globalCompositeOperation = 'copy';

    for await (const point of this.iterable) {
      if (!startPosition) {
        startPosition = point;
      }

      if (
        startPosition &&
        (startPosition?.x !== point.x || startPosition?.y !== point.y)
      ) {
        this.#clean();
        this.context.strokeRect(
          startPosition.x,
          startPosition.y,
          point.x - startPosition.x,
          point.y - startPosition.y
        );
        this.layer.emitChange();
      }
    }

    return true;
  }

  #clean(): void {
    this.context.clearRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height
    );
  }
}
