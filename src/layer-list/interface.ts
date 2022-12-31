import type TypedEmitter from 'typed-emitter';
import type { Layer, LayerEmitter } from '~/layer';

type LayerListEvents = {
  add: (layer: Layer) => void;
  remove: (layer: Layer) => void;
  move: (layer: Layer, params: { from: number; to: number }) => void;
  activeChange: (index: number, layer: Layer) => void;
  clear: () => void;
};

export type LayerListEmitter = TypedEmitter<LayerListEvents> & LayerEmitter;
