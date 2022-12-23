import { Command } from './interface';
import LayerCommand from './layer-command';
import { Layer } from '~/layer';

export default class PencilCommand extends LayerCommand implements Command {
  readonly #iterator: AsyncIterableIterator<Rastrr.Point>;

  constructor(layer: Layer, iterator: AsyncIterableIterator<Rastrr.Point>) {
    super(layer);
    this.#iterator = iterator;
  }

  async execute(): Promise<boolean> {
    let isStart = true;
    let currentPosition: Rastrr.Point;

    for await (const point of this.#iterator) {
      currentPosition = point;

      if (isStart) {
        this.context.beginPath();
        this.context.moveTo(currentPosition.x, currentPosition.y);
        isStart = false;
      } else {
        this.context.lineTo(currentPosition.x, currentPosition.y);
        this.context.stroke();
      }

      this.layer.emitChange();
    }

    return true;
  }
}
