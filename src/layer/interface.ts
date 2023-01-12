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
  globalCompositeOperation?: GlobalCompositeOperation;
};

export interface LayerData {
  name: string;
  locked: boolean;
  readonly id: string;
  readonly width: number;
  readonly height: number;
  readonly opacity: number;
  readonly visible: boolean;
  readonly offset: Rastrr.Point;
  readonly data: Uint8ClampedArray;
}

export interface Layer extends LayerData {
  readonly type: LayerType;
  // NOTE: canvas might not be used for WebGL implementation
  // consider to remove this property in future
  readonly canvas: CanvasImageSource;

  drawContents(layer: Layer, options?: LayerDrawContentsOptions): void;
  drawImageData(imageData: ImageData, offset?: Rastrr.Point): void;
  setWidth(value: number): void;
  setHeight(value: number): void;
  setOpacity(value: number): void;
  setVisible(value: boolean): void;
  setOffset(value: Rastrr.Point): void;
  setData(data: Uint8ClampedArray): void;
  setEmitter(emitter: LayerEmitter): void;
  removeEmitter(): void;
  emitChange(): void;
  commitContentChanges(): void;
}
