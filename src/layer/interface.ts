import TypedEmitter from 'typed-emitter';
import { Color } from '~/color';
import type { Point } from '~/types';

type LayerEvents = {
  change: (layer: Layer) => void;
};

export type LayerEmitter = TypedEmitter<LayerEvents>;

export type LayerType = 'canvas';

export type LayerConstructor = new (
  w: number,
  h: number,
  opts?: LayerOptions
) => Layer;

export type LayerOptions = {
  color?: Color;
  image?: ImageBitmap;
};

export interface Layer {
  name: string;
  locked: boolean;
  readonly width: number;
  readonly height: number;
  readonly opacity: number;
  readonly visible: boolean;
  readonly offset: Point;
  readonly data: Uint8ClampedArray;
  readonly canvas: CanvasImageSource;

  setWidth(value: number): void;
  setHeight(value: number): void;
  setOpacity(value: number): void;
  setVisible(value: boolean): void;
  setOffset(value: Point): void;
  setData(data: Uint8ClampedArray): void;
  setEmitter(emitter: LayerEmitter): void;
}
