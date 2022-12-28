import { Command } from '~/commands';
import LayerCommand from './layer-command';
import { Color } from '~/color';
import { LayerList } from '~/layer-list';

type BrushOptions = {
  color: Color;
  width: number;
  lineCap: 'butt' | 'round' | 'square';
};

export default class BrushCommand extends LayerCommand implements Command {
  readonly options: BrushOptions;
  readonly name = 'Кисть';

  constructor(
    layers: LayerList,
    iterable: AsyncIterable<Rastrr.Point>,
    options?: Partial<BrushOptions>
  ) {
    super(layers, iterable, 'temporary');

    this.options = {
      ...options,
      color: options?.color ?? new Color(0, 0, 0, 255),
      width: options?.width ?? 1,
      lineCap: options?.lineCap ?? 'round',
    };
  }

  async execute(): Promise<boolean> {
    let prevPosition: Rastrr.Point | null = null;

    this.context.strokeStyle = this.options.color.toString('rgb');
    this.context.lineWidth = this.options.width;
    this.context.lineCap = this.options.lineCap;
    this.context.lineJoin = 'round';
    this.context.globalAlpha = this.options.color.a / 256;
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

    this.deleteTemporaryData();

    return true;
  }
}
