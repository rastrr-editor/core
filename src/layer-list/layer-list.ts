import { Layer } from '~/layer';
import { LayerListAddOptions, LayerListEmitter } from './interface';
import EventEmitter from 'eventemitter3';
import filter from '~/utils/iter/filter';

export default class LayerList {
  #layers: Layer[] = [];
  readonly #emitter: LayerListEmitter;
  #active?: number;
  #layerIds = new Set<string>();
  #tmpLayers = new WeakSet<Layer>();

  constructor() {
    this.#emitter = new EventEmitter() as LayerListEmitter;
  }

  get length() {
    return this.#layers.length;
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.#emitter.emit('activeChange', index, this.activeLayer!);
  }

  add(layer: Layer, options?: LayerListAddOptions): this {
    this.assertLayerIsUnique(layer);
    this.#layerIds.add(layer.id);
    layer.setEmitter(this.#emitter);
    this.#layers.push(layer);
    if (options?.tmp) {
      this.#tmpLayers.add(layer);
    }
    this.#emitter?.emit('add', layer);
    return this;
  }

  get(index: number): Layer | undefined {
    return this.#layers[index];
  }

  remove(index: number): Layer {
    if (index < 0 || index >= this.length) {
      throw new RangeError(`Index (${index}) out of bounds`);
    }
    const [layer] = this.#layers.splice(index, 1);
    if (index === this.#active) {
      this.#active = undefined;
    } else if (this.#active !== undefined && index < this.#active) {
      this.#active -= 1;
    }
    this.#tmpLayers.delete(layer);
    this.#emitter?.emit('remove', layer);

    return layer;
  }

  clear(): void {
    this.#layers = [];
    this.#active = undefined;
    this.#tmpLayers = new WeakSet<Layer>();
    this.#emitter?.emit('clear');
  }

  insert(index: number, layer: Layer, options?: LayerListAddOptions): void {
    this.assertLayerIsUnique(layer);
    this.#layerIds.add(layer.id);
    layer.setEmitter(this.#emitter);
    if (index < 0 || index > this.length) {
      throw new RangeError(`Index (${index}) out of bounds`);
    }
    this.#layers.splice(index, 0, layer);
    if (options?.tmp) {
      this.#tmpLayers.add(layer);
    }
    if (this.#active !== undefined && index <= this.#active) {
      this.#active += 1;
    }
    this.#emitter?.emit('add', layer);
  }

  changePosition(index: number, newIndex: number): void {
    if (newIndex >= this.length) {
      throw new RangeError(`New index (${newIndex}) out of bounds`);
    }
    if (index < 0) {
      throw new RangeError('Index must be greater than zero');
    }
    const [layer] = this.#layers.splice(index, 1);
    if (layer === undefined) {
      throw new Error(`Layer is not defined at index ${index}`);
    }

    if (index === this.#active) {
      this.#active = newIndex;
    } else if (this.#active !== undefined) {
      if (index > this.#active && newIndex <= this.#active) {
        this.#active += 1;
      }
      if (index < this.#active && newIndex >= this.#active) {
        this.#active -= 1;
      }
    }

    this.#layers.splice(newIndex, 0, layer);
    this.#emitter?.emit('move', layer, { from: index, to: newIndex });
  }

  [Symbol.iterator](): IterableIterator<Layer> {
    return this.#layers[Symbol.iterator]();
  }

  /**
   * @param withTmp With temporary layers included
   * @returns Layers
   */
  values(withTmp = false): IterableIterator<Layer> {
    return filter(
      this.#layers[Symbol.iterator](),
      (layer) => !this.#tmpLayers.has(layer) || withTmp
    );
  }

  /**
   * @param withTmp With temporary layers included
   * @returns Layers in reversed order
   */
  *reverse(withTmp = false): Generator<Layer> {
    let i = this.#layers.length - 1;
    while (i >= 0) {
      const layer = this.#layers[i];
      if (!this.#tmpLayers.has(layer) || withTmp) {
        yield layer;
      }
      i -= 1;
    }
  }

  protected assertLayerIsUnique(layer: Layer) {
    if (this.#layerIds.has(layer.id)) {
      throw new TypeError(`Duplicate layer, id: ${layer.id}`);
    }
  }
}
