import { Layer } from '~/layer';
import { LayerListEmitter } from './interface';

// TODO refactoring emit events after Render
export default class LayerList {
  #layers: Layer[] = [];
  #emitter?: LayerListEmitter;
  #active?: number;

  get activeIndex(): number | undefined {
    return this.#active;
  }

  get activeLayer(): Layer | undefined {
    return this.#active !== undefined ? this.#layers[this.#active] : undefined;
  }

  setEmitter(emitter: LayerListEmitter): this {
    this.#emitter = emitter;
    return this;
  }

  setActive(index: number): void {
    if (this.#layers[index] === undefined) {
      throw new Error('Layer is not defined');
    }
    this.#active = index;
  }

  add(layer: Layer): this {
    this.#layers.push(layer);
    this.#emitter?.emit('add');
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
    this.#emitter?.emit('remove');

    return layer;
  }

  clear(): void {
    this.#layers = [];
    this.#emitter?.emit('remove');
  }

  insert(index: number, layer: Layer): void {
    this.#layers.splice(index, 0, layer);
    this.#emitter?.emit('add');
  }

  changePosition(index: number, newIndex: number): void {
    const layer = this.remove(index);
    this.insert(newIndex, layer);
    this.#emitter?.emit('move');
  }

  [Symbol.iterator](): IterableIterator<Layer> {
    return this.#layers[Symbol.iterator]();
  }
}
