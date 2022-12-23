import { Command } from './interface';
import LayerCommand from './layer-command';
import { Layer } from '~/layer';
import { Color } from '~/color';

type BrushOptions = {
  color: Color;
  width: number;
  lineCap: 'butt' | 'round' | 'square';
};

export default class BrushCommand extends LayerCommand implements Command {
  readonly options: BrushOptions;

  constructor(
    layer: Layer,
    iterator: AsyncIterable<Rastrr.Point>,
    options?: BrushOptions
  ) {
    super(layer, iterator);
    this.options = {
      ...options,
      color: options?.color ?? new Color(0, 0, 0, 255),
      width: options?.width ?? 1,
      lineCap: options?.lineCap ?? 'round',
    };
  }

  async execute(): Promise<boolean> {
    let isStart = true;
    let currentPosition: Rastrr.Point = { x: 0, y: 0 };

    this.context.strokeStyle = this.options.color.toCssStyle();
    this.context.lineWidth = this.options.width;
    this.context.lineCap = this.options.lineCap;
    this.context.lineJoin = 'round';

    this.context.beginPath();

    for await (const point of this.iterator) {
      currentPosition = point;

      if (isStart) {
        this.context.moveTo(currentPosition.x, currentPosition.y);
        isStart = false;
      } else {
        this.context.lineTo(currentPosition.x, currentPosition.y);
        this.context.stroke();
      }

      this.layer.emitChange();
    }

    this.context.closePath();

    return true;
  }
}
