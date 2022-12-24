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
    iterable: AsyncIterable<Rastrr.Point>,
    options?: BrushOptions
  ) {
    super(layer, iterable);
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
    let prevPosition: Rastrr.Point = { x: 0, y: 0 };

    this.context.strokeStyle = this.options.color.toString('rgb');
    this.context.lineWidth = this.options.width;
    this.context.lineCap = this.options.lineCap;
    this.context.lineJoin = 'round';
    this.context.globalAlpha = this.options.color.a / 256;

    for await (const point of this.iterable) {
      currentPosition = point;

      if (isStart) {
        prevPosition = { ...currentPosition };
        isStart = false;
      } else {
        this.context.beginPath();
        this.context.moveTo(prevPosition.x, prevPosition.y);
        this.context.lineTo(currentPosition.x, currentPosition.y);
        this.context.stroke();
        prevPosition = { ...currentPosition };
      }

      this.layer.emitChange();
    }

    return true;
  }
}
