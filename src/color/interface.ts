type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;

type NumberRange<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;

export type ColorRange = NumberRange<0, 256>;

export interface Color {
  r: ColorRange;
  g: ColorRange;
  b: ColorRange;
  a: ColorRange;
}
