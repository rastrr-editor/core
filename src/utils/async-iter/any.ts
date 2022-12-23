import { AsyncIterableValue } from './types';

export default function any<T extends AsyncIterable<unknown>[]>(
  ...iterables: T
): AsyncIterableIterator<AsyncIterableValue<T>> {
  const iterators = new Array<AsyncIterator<AsyncIterableValue<T>>>(
    iterables.length
  );
  iterables.forEach((iterable, i) => {
    iterators[i] = iterable[Symbol.asyncIterator]() as AsyncIterator<
      AsyncIterableValue<T>
    >;
  });
  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    next() {
      return Promise.race(iterators.map((it) => it.next()));
    },
    return() {
      return Promise.race(
        iterators.map((it) =>
          typeof it.return === 'function'
            ? it.return()
            : { value: undefined as AsyncIterableValue<T>, done: true }
        )
      );
    },
  };
}
