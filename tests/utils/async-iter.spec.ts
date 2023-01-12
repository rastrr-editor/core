import sleep from '~/utils/sleep';
import {
  filter,
  map,
  seq,
  take,
  every,
  any,
  repeat,
  until,
  RewindableAsyncIterableIterator,
} from '~/utils/async-iter';

async function* asyncGenerator(): AsyncGenerator<number> {
  for (let i = 0; i < 10; i += 1) {
    yield i;
  }
}

describe('async-iter', () => {
  describe('filter', () => {
    test('should filter async iterator', async () => {
      const array: number[] = [];
      for await (const item of filter(asyncGenerator(), (i) => i % 2 === 0)) {
        array.push(item);
      }
      expect(array).toEqual([0, 2, 4, 6, 8]);
    });
  });

  describe('map', () => {
    test('should map async iterator', async () => {
      const array: string[] = [];
      for await (const item of map(asyncGenerator(), (i) =>
        (i * 2).toString()
      )) {
        array.push(item);
      }
      expect(array).toEqual([
        '0',
        '2',
        '4',
        '6',
        '8',
        '10',
        '12',
        '14',
        '16',
        '18',
      ]);
    });

    test('should resolve promise from predicate', async () => {
      const array: number[] = [];
      const iterable = map(asyncGenerator(), (i) => Promise.resolve(i * 2));
      for await (const item of filter(iterable, (i) => i < 8)) {
        array.push(item);
      }
      expect(array).toEqual([0, 2, 4, 6]);
    });
  });

  describe('seq', () => {
    test('should seq async iterator', async () => {
      const iterable = seq(
        filter(asyncGenerator(), (i) => i < 3),
        filter(asyncGenerator(), (i) => i > 6)
      );
      const array: number[] = [];
      for await (const item of iterable) {
        array.push(item);
      }
      expect(array).toEqual([0, 1, 2, 7, 8, 9]);
    });
  });

  describe('take', () => {
    test('should take from async iterator', async () => {
      const array: number[] = [];
      for await (const item of take(asyncGenerator(), 3)) {
        array.push(item);
      }
      expect(array).toEqual([0, 1, 2]);
    });

    test('should take from async iterator only available values', async () => {
      const array: number[] = [];
      for await (const item of take(
        filter(asyncGenerator(), (x) => x < 3),
        5
      )) {
        array.push(item);
      }
      expect(array).toEqual([0, 1, 2]);
    });
  });

  describe('every', () => {
    test('every should end underlying iterator', async () => {
      const array: number[] = [];
      const iterable = asyncGenerator();
      for await (const item of every(iterable, (i) => i < 3)) {
        array.push(item);
      }
      const rest: number[] = [];
      for await (const i of iterable) {
        rest.push(i);
      }
      expect(array).toEqual([0, 1, 2]);
      expect(rest).toEqual([]);
    });
  });

  describe('until', () => {
    test('until should end underlying iterator', async () => {
      const array: number[] = [];
      const iterable = asyncGenerator();
      for await (const item of until(iterable, (i) => i >= 2)) {
        array.push(item);
      }
      const rest: number[] = [];
      for await (const i of iterable) {
        rest.push(i);
      }
      expect(array).toEqual([0, 1, 2]);
      expect(rest).toEqual([]);
    });
  });

  describe('any', () => {
    // Total time: 101
    async function* asyncTask1() {
      await sleep(1);
      yield 1;
      await sleep(100);
      yield 2;
    }

    // Total time: 111
    async function* asyncTask2() {
      await sleep(10);
      yield 3;
      await sleep(1);
      yield 4;
      await sleep(100);
      yield 5; // this will be ignored
    }

    test('any should return first value of each pair', async () => {
      const array: number[] = [];
      for await (const item of any(asyncTask1(), asyncTask2())) {
        array.push(item);
      }
      expect(array).toEqual([1, 4]);
    });
  });

  describe('repeat', () => {
    async function* asyncTask() {
      for (let i = 0; i < 3; i += 1) {
        yield i;
      }
    }
    test('should repeat given iterator', async () => {
      const array: number[] = [];
      for await (const item of take(
        repeat(() => asyncTask()),
        7
      )) {
        array.push(item);
      }
      expect(array).toEqual([0, 1, 2, 0, 1, 2, 0]);
    });
  });

  describe('rewindable async iterable iterator', () => {
    test('should rewind iterable', async () => {
      const iterable = new RewindableAsyncIterableIterator(
        every(asyncGenerator(), (x) => x < 2)
      );
      const initialIterableArray: number[] = [];
      const noRewindArray: number[] = [];
      const rewindArray: number[] = [];
      for await (const item of iterable) {
        initialIterableArray.push(item);
      }
      expect(initialIterableArray).toEqual([0, 1]);
      for await (const item of iterable) {
        noRewindArray.push(item);
      }
      expect(noRewindArray).toEqual([]);
      iterable.rewind();
      for await (const item of iterable) {
        rewindArray.push(item);
      }
      expect(rewindArray).toEqual([0, 1]);
    });
  });
});
