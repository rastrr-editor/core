import { Color, ColorRange } from '~/*';
import TypedEmitter from 'typed-emitter';

type LayerEvents = {
  change: () => void;
};

export type LayerEmitter = TypedEmitter<LayerEvents>;

export type LayerOptions = {
  color?: Color;
  image?: ImageBitmap;
};

export interface Layer {
  name: string;
  visible: boolean;
  locked: boolean;
  offset: Point;
  get width(): number;
  get height(): number;
  get opacity(): ColorRange;
  setOpacity(value: ColorRange): void;
  setData(data: Uint8ClampedArray): void;
  setEmitter(emitter: LayerEmitter): void;
}
