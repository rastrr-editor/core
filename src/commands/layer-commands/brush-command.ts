import type { Command } from '~/commands';
import { CommandOptions, LayerCommand } from '~/commands';
import { Color } from '~/color';
import { LayerList } from '~/layer-list';
import {
  createTemporaryLayer,
  commitTemporaryData,
  applyOptions,
} from '~/commands/helpers';

interface BrushOptions extends CommandOptions {
  color: Color;
  width: number;
  lineCap: 'butt' | 'round' | 'square';
}

export default class BrushCommand extends LayerCommand implements Command {
  readonly options: BrushOptions;
  readonly name = 'Кисть';
  #layers: LayerList;
  #insertIndex: number;

  constructor(
    layers: LayerList,
    iterable: AsyncIterable<Rastrr.Point>,
    options?: Partial<BrushOptions>
  ) {
    const { layer, index } = createTemporaryLayer(layers);

    super(layer, iterable);
    this.#insertIndex = index;
    this.#layers = layers;

    this.options = {
      ...options,
      color: options?.color ?? new Color(0, 0, 0, 255),
      width: options?.width ?? 1,
      lineCap: options?.lineCap ?? 'round',
    };
  }

  async execute(): Promise<boolean> {
    let prevPosition: Rastrr.Point | null = null;

    applyOptions(this.context, this.options);
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
