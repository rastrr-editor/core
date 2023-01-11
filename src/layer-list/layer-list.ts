import { Layer } from '~/layer';
import { LayerListAddOptions, LayerListEmitter } from './interface';
import EventEmitter from 'eventemitter3';
import filter from '~/utils/iter/filter';
import { createDebug } from '~/utils/debug';

const debug = createDebug('layer-list');

export default class LayerList {
  #layers: Layer[] = [];
  readonly #emitter: LayerListEmitter;
  #active?: Layer;
  #layerIds = new Set<string>();
  #tmpLayers = new WeakSet<Layer>();

  constructor() {
    this.#emitter = new EventEmitter() as LayerListEmitter;
    this.#emitter.on('add', (layer) => {
      debug('layer added, name: %s, id: %s', layer.name, layer.id);
    });
    this.#emitter.on('change', (layer) => {
      debug('layer changed, name: %s, id: %s', layer.name, layer.id);
    });
    this.#emitter.on('move', (layer, { from, to }) => {
      debug(
        'layer moved, name: %s, id: %s, from: %d, to: %d',
        layer.name,
        layer.id,
        from,
        to
      );
    });
    this.#emitter.on('remove', (layer) => {
      debug('layer removed, name: %s, id: %s', layer.name, layer.id);
    });
    this.#emitter.on('clear', () => {
      debug('layers cleared');
    });
  }

  get length() {
    return this.#layers.length;
  }

  get emitter(): LayerListEmitter {
    return this.#emitter;
  }

  get activeIndex(): number | undefined {
    const index = this.#layers.findIndex(
      (layer) => layer.id === this.#active?.id
    );
    return index >= 0 ? index : undefined;
  }

  get activeLayer(): Layer | undefined {
    return this.#active;
  }

  setActive(index: number): void {
    if (this.#layers[index] === undefined) {
      throw new Error('Layer is not defined');
    }
    this.#active = this.#layers[index];
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

  get(id: string): Layer | undefined;
  get(index: number): Layer | undefined;
  get(indexOrId: number | string): Layer | undefined {
    if (typeof indexOrId === 'string') {
      return this.#layers.find(({ id }) => id === indexOrId);
    }
    return this.#layers[indexOrId];
  }

  indexOf(layer: Layer): number {
    return this.#layers.indexOf(layer);
  }

  has(layer: Layer): boolean {
    return this.indexOf(layer) !== -1;
  }

  remove(index: number): Layer {
    if (index < 0 || index >= this.length) {
      throw new RangeError(`Index (${index}) out of bounds`);
    }
    const [layer] = this.#layers.splice(index, 1);
    if (layer.id === this.#active?.id) {
      this.#active = undefined;
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
