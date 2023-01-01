import TypedEmitter from 'typed-emitter';
import { Color } from '~/color';

type LayerEvents = {
  change: (layer: Layer) => void;
  opacityChange: (layer: Layer, params: { prev: number; next: number }) => void;
};

export type LayerEmitter = TypedEmitter<LayerEvents>;

export type LayerType = 'canvas';

export type LayerConstructor = new (
  w: number,
  h: number,
  opts?: LayerOptions
) => Layer;

export type LayerOptions = {
  id?: string;
  color?: Color;
  image?: ImageBitmap;
  opacity?: number;
};

export type LayerDrawContentsOptions = {
  srcOffset?: Rastrr.Point;
  srcSize?: Rastrr.Point;
  destOffset?: Rastrr.Point;
  destSize?: Rastrr.Point;
};

export interface Layer {
  name: string;
  locked: boolean;
  readonly id: string;
  readonly type: LayerType;
  readonly width: number;
  readonly height: number;
  readonly opacity: number;
  readonly visible: boolean;
  readonly offset: Rastrr.Point;
  readonly data: Uint8ClampedArray;
  readonly canvas: CanvasImageSource;

  drawContents(layer: Layer, options?: LayerDrawContentsOptions): void;
  setWidth(value: number): void;
  setHeight(value: number): void;
  setOpacity(value: number): void;
  setVisible(value: boolean): void;
  setOffset(value: Rastrr.Point): void;
  setData(data: Uint8ClampedArray): void;
  setEmitter(emitter: LayerEmitter): void;
  emitChange(): void;
  commitContentChanges(): void;
}
