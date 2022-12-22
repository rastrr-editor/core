import type TypedEmitter from 'typed-emitter';

type ViewportEvents = {
  mousedown: (point: Rastrr.Point) => void;
  mousemove: (point: Rastrr.Point) => void;
  mouseup: (point: Rastrr.Point) => void;
};

export type ViewportEmitter = TypedEmitter<ViewportEvents>;
