type EveryOptions = { includeLast?: boolean };

export default async function* every<T>(
  iterable: AsyncIterable<T>,
  predicate: (item: T) => boolean,
  { includeLast = false }: EveryOptions = {}
): AsyncGenerator<T> {
  for await (const value of iterable) {
    if (!predicate(value)) {
      if (includeLast) {
        yield value;
      }
      break;
    }
    yield value;
  }
}
