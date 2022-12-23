export default async function* every<T>(
  iterable: AsyncIterable<T>,
  predicate: (item: T) => boolean
): AsyncGenerator<T> {
  for await (const value of iterable) {
    if (!predicate(value)) {
      break;
    }
    yield value;
  }
}
