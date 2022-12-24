import { Layer } from '~/layer';
import { LayerListEmitter } from './interface';
import EventEmitter from 'eventemitter3';

export default class LayerList {
  #layers: Layer[] = [];
  readonly #emitter: LayerListEmitter;
  #active?: number;

  constructor() {
    this.#emitter = new EventEmitter() as LayerListEmitter;
  }

  get emitter(): LayerListEmitter {
    return this.#emitter;
  }

  get activeIndex(): number | undefined {
    return this.#active;
  }

  get activeLayer(): Layer | undefined {
    return this.#layers[this.#active ?? -1];
  }

  setActive(index: number): void {
    if (this.#layers[index] === undefined) {
      throw new Error('Layer is not defined');
    }
    this.#active = index;
  }

  add(layer: Layer): this {
    layer.setEmitter(this.#emitter);
    this.#layers.push(layer);
    this.#emitter?.emit('add', layer);
    return this;
  }

  get(index: number): Layer | undefined {
    return this.#layers[index];
  }

  remove(index: number): Layer {
    const layer = this.#layers[index];
    if (layer === undefined) {
      throw new Error('Layer is not defined');
    }

    this.#layers.splice(index, 1);
    this.#emitter?.emit('remove', layer);

    return layer;
  }

  clear(): void {
    this.#layers = [];
    this.#emitter?.emit('clear');
  }

  insert(index: number, layer: Layer): void {
    layer.setEmitter(this.#emitter);
    this.#layers.splice(index, 0, layer);
    this.#emitter?.emit('add', layer);
  }

  changePosition(index: number, newIndex: number): void {
    const layer = this.remove(index);
    this.insert(newIndex, layer);
    this.#emitter?.emit('move', layer, { from: index, to: newIndex });
  }

  [Symbol.iterator](): IterableIterator<Layer> {
    return this.#layers[Symbol.iterator]();
  }
}
