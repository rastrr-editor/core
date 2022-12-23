import { AsyncIterableValue } from './types';

export default function seq<T extends AsyncIterable<unknown>[]>(
  ...iterables: T
): AsyncIterableIterator<AsyncIterableValue<T>> {
  const initializedIterators: AsyncIterator<unknown>[] = [];
  let i = 0;
  let it: AsyncIterator<unknown> =
    iterables.length > 0
      ? iterables[i][Symbol.asyncIterator]()
      : { next: () => Promise.resolve({ value: undefined, done: true }) };
  initializedIterators.push(it);
  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    next() {
      const promise = it.next() as Promise<
        IteratorResult<AsyncIterableValue<T>>
      >;
      return promise.then(({ value, done }) => {
        if (done) {
          i += 1;
          if (i >= iterables.length) {
            return { value: undefined, done: true };
          }
          it = iterables[i][Symbol.asyncIterator]();
          initializedIterators.push(it);
          return this.next();
        }
        return { value, done: false };
      });
    },
    return() {
      // Call return for all initialized iterators
      return Promise.race(
        initializedIterators.map((it) =>
          typeof it.return === 'function'
            ? (it.return() as Promise<IteratorResult<AsyncIterableValue<T>>>)
            : { value: undefined as AsyncIterableValue<T>, done: true }
        )
      );
    },
  };
}
