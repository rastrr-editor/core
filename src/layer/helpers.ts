import { Color, ColorRange } from '~/color';

export const toColorRange = (value: number): ColorRange => {
  const val = Math.round(value);
  return val < 0 ? 0 : val > 255 ? 255 : (val as ColorRange);
};

export const setColor = (
  data: Uint8ClampedArray,
  pos: number,
  color: Color
) => {
  data[pos] = color.r;
  data[pos + 1] = color.g;
  data[pos + 2] = color.b;
  data[pos + 3] = color.a;
};
