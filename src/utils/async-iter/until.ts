export default async function* until<T>(
  iterable: AsyncIterable<T>,
  predicate: (item: T) => boolean
): AsyncGenerator<T> {
  for await (const value of iterable) {
    if (predicate(value)) {
      yield value;
      break;
    }
    yield value;
  }
}
