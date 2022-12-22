import type TypedEmitter from 'typed-emitter';
import type { LayerEmitter } from '~/layer';

// TODO refactoring after implement Render
type LayerListEvents = {
  add: () => void;
  remove: () => void;
  move: () => void;
};

export type LayerListEmitter = TypedEmitter<LayerListEvents> & LayerEmitter;
