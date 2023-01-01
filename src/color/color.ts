import { toColorRange } from '~/layer/helpers';
import { normalizeHEX } from './helpers';
import type { ColorRange, ColorSerialized } from './interface';

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

  static from(value: string, from: ColorSerialized): Color {
    switch (from) {
      case 'rgba':
      case 'rgb': {
        const matches = value.match(
          /rgba?\(((\d+),\s?(\d+),\s?(\d+)(,?\s?(\d\.?\d*))?)\)/
        );
        if (!matches) {
          throw new Error(`Invalid input: ${value}`);
        }
        return new Color(
          toColorRange(parseInt(matches[2], 10)),
          toColorRange(parseInt(matches[3], 10)),
          toColorRange(parseInt(matches[4], 10)),
          toColorRange((matches[6] ? parseFloat(matches[6]) : 1) * 255)
        );
      }
      case 'hex':
      case 'hexa': {
        const hex = normalizeHEX(value);
        return new Color(
          toColorRange(parseInt(hex.substring(1, 3), 16)),
          toColorRange(parseInt(hex.substring(3, 5), 16)),
          toColorRange(parseInt(hex.substring(5, 7), 16)),
          toColorRange(parseInt(hex.substring(7, 9) || 'ff', 16))
        );
      }
    }
  }

  toString(to: ColorSerialized): string {
    switch (to) {
      case 'rgba':
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a / 255})`;
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
