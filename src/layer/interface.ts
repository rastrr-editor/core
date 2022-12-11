import TypedEmitter from 'typed-emitter';
import { Color } from '~/color';

type LayerEvents = {
  change: (layer: Layer) => void;
};

export type LayerEmitter = TypedEmitter<LayerEvents>;

export type LayerOptions = {
  color?: Color;
  image?: ImageBitmap;
};

export interface Layer {
  name: string;
  locked: boolean;
  get width(): number;
  get height(): number;
  get opacity(): ColorRange;
  get visible(): boolean;
  get offset(): Point;
  setOpacity(value: ColorRange): void;
  setVisible(value: boolean): void;
  setOffset(value: Point): void;
  setData(data: Uint8ClampedArray): void;
  setEmitter(emitter: LayerEmitter): void;
}
