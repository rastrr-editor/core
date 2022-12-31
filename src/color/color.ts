import { toColorRange } from '~/layer/helpers';
import type { ColorRange } from './interface';

export default class Color {
  constructor(
    public r: ColorRange,
    public g: ColorRange,
    public b: ColorRange,
    public a: ColorRange = 255
  ) {}

  setOpacity(value: number): this {
    this.a = toColorRange(value * 255);
    return this;
  }

  clone(): Color {
    return new Color(this.r, this.g, this.b, this.a);
  }

  toString(to: 'hex' | 'hexa' | 'rgba' | 'rgb'): string {
    switch (to) {
      case 'rgba':
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a / 256})`;
      case 'rgb':
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
      case 'hex':
        return this.#toHex();
      case 'hexa':
        return `${this.#toHex()}${(this.a | (1 << 8)).toString(16).slice(1)}`;
    }
  }

  #toHex(): string {
    return `#
      ${(this.r | (1 << 8)).toString(16).slice(1)}
      ${(this.g | (1 << 8)).toString(16).slice(1)}
      ${(this.b | (1 << 8)).toString(16).slice(1)}
    `.replace(/\s/g, '');
  }
}
