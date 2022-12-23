import { Command } from './interface';
import { Layer } from '~/layer';

export default class PencilCommand implements Command {
  name = 'unnamed';
  #context: CanvasRenderingContext2D;
  #layer: Layer;

  readonly #iterator: AsyncIterableIterator<Rastrr.Point>;

  constructor(layer: Layer, iterator: AsyncIterableIterator<Rastrr.Point>) {
    this.#layer = layer;
    this.#iterator = iterator;

    if (layer.canvas instanceof HTMLCanvasElement) {
      const context = layer.canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to get 2D context');
      }
      this.#context = context;
    } else {
      throw new Error('Incorrect layer param');
    }
  }

  async execute(): Promise<boolean> {
    let isStart = true;
    let currentPosition: Rastrr.Point;

    for await (const point of this.#iterator) {
      currentPosition = point;

      if (isStart) {
        this.#context.beginPath();
        this.#context.moveTo(currentPosition.x, currentPosition.y);
        isStart = false;
      } else {
        this.#context.lineTo(currentPosition.x, currentPosition.y);
        this.#context.stroke();
      }

      this.#layer.emitChange();
    }

    return true;
  }
}
