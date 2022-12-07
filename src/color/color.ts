import type { ColorRange } from './interface';

export default class Color {
  constructor(
    public r: ColorRange,
    public g: ColorRange,
    public b: ColorRange,
    public a: ColorRange = 255
  ) {}
}
