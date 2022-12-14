import TypedEmitter from 'typed-emitter';

// TODO refactoring after implement Render
type LayerListEvents = {
  add: () => void;
  remove: () => void;
  move: () => void;
};

export type LayerListEmitter = TypedEmitter<LayerListEvents>;
