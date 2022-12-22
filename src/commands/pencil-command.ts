import { Command } from './interface';
import { Viewport } from '~/viewport';
import { Layer } from '~/layer';

export default class PencilCommand implements Command {
  name = 'unnamed';
  #viewport: Viewport;
  #draw!: boolean;
  #currentPosition!: Rastrr.Point;
  #context?: CanvasRenderingContext2D;
  #activeLayer?: Layer;
  #resolver?: (value: boolean) => void;

  constructor(viewport: Viewport) {
    this.#viewport = viewport;
    this.#reset();
  }

  execute(): Promise<boolean> {
    const activeLayer = this.#viewport.layers.activeLayer;
    const canvas = activeLayer?.canvas;

    if (canvas && canvas instanceof HTMLCanvasElement) {
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to get 2D context');
      }

      this.#context = context;
      this.#activeLayer = activeLayer;

      this.#viewport.emitter.on('mousedown', (p) => this.#mouseDown(p));
      this.#viewport.emitter.on('mousemove', (p) => this.#mouseMove(p));
      this.#viewport.emitter.on('mouseup', (p) => this.#mouseUp(p));

      return new Promise((resolve) => (this.#resolver = resolve));
    }

    return Promise.reject();
  }

  #mouseDown(point: Rastrr.Point): void {
    if (this.#context && this.#activeLayer) {
      this.#setCurrentPosition(point);
      this.#draw = true;

      this.#context.beginPath();
      this.#context.moveTo(this.#currentPosition.x, this.#currentPosition.y);

      this.#viewport.layers.emitter.emit('change', this.#activeLayer);
    }
  }

  #mouseMove(point: Rastrr.Point): void {
    if (this.#draw && this.#context && this.#activeLayer) {
      this.#setCurrentPosition(point);

      this.#context.lineTo(this.#currentPosition.x, this.#currentPosition.y);
      this.#context.stroke();

      this.#viewport.layers.emitter.emit('change', this.#activeLayer);
    }
  }

  #mouseUp(point: Rastrr.Point): void {
    if (this.#draw && this.#context && this.#activeLayer) {
      this.#setCurrentPosition(point);

      this.#context.lineTo(this.#currentPosition.x, this.#currentPosition.y);
      this.#context.stroke();
      this.#context.closePath();

      if (this.#resolver !== undefined) {
        this.#resolver(true);
      }
      this.#reset();

      this.#viewport.layers.emitter.emit('change', this.#activeLayer);
    }
  }

  #reset(): void {
    this.#draw = false;
    this.#currentPosition = { x: 0, y: 0 };
    this.#context = undefined;
    this.#activeLayer = undefined;
    this.#resolver = undefined;
  }

  #setCurrentPosition(point: Rastrr.Point): void {
    this.#currentPosition = {
      x: point.x - this.#activeLayer!.offset.x,
      y: point.y - this.#activeLayer!.offset.y,
    };
  }
}
