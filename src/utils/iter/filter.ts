export default function* filter<T>(
  iterable: Iterable<T>,
  predicate: (item: T) => boolean
): Generator<T> {
  for (const value of iterable) {
    if (predicate(value)) {
      yield value;
    }
  }
}
