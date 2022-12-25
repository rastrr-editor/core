export default function toAsyncIter<T>(
  iterable: Iterable<T>
): AsyncIterableIterator<T> {
  const it = iterable[Symbol.iterator]();
  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    next() {
      return Promise.resolve(it.next());
    },
  };
}
