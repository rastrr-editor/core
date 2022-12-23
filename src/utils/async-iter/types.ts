export type AsyncIterableValue<T extends AsyncIterable<unknown>[]> =
  T extends AsyncIterable<infer V>[] ? V : unknown;
