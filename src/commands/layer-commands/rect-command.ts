import { Command } from '~/commands';
import LayerCommand from './layer-command';
import { Color } from '~/color';
import { LayerList } from '~/layer-list';

type RectOptions = {
  color: Color;
  width: number;
  lineCap: 'butt' | 'round' | 'square';
};

export default class RectCommand extends LayerCommand implements Command {
  readonly options: RectOptions;
  readonly name = 'Прямоугольник';

  constructor(
    layers: LayerList,
    iterable: AsyncIterable<Rastrr.Point>,
    options?: Partial<RectOptions>
  ) {
    super(layers, iterable, 'new');

    this.options = {
      ...options,
      color: options?.color ?? new Color(0, 0, 0, 255),
      width: options?.width ?? 1,
      lineCap: options?.lineCap ?? 'round',
    };
  }

  async execute(): Promise<boolean> {
    let startPosition: Rastrr.Point | null = null;

    this.context.strokeStyle = this.options.color.toString('rgb');
    this.context.lineWidth = this.options.width;
    this.context.lineCap = this.options.lineCap;
    this.context.lineJoin = 'round';
    this.context.globalAlpha = this.options.color.a / 256;
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

    this.deleteTemporaryData();

    console.log('layers', this.layers);

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
