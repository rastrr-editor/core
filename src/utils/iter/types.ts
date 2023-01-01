export type IterableValue<T extends Iterable<unknown>[]> = T extends Iterable<
  infer V
>[]
  ? V
  : unknown;
