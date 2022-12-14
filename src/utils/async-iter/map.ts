export default async function* map<T, R>(
  iterable: AsyncIterable<T>,
  mapFn: (item: T) => R | Promise<R>
): AsyncGenerator<R> {
  for await (const value of iterable) {
    yield mapFn(value);
  }
}
