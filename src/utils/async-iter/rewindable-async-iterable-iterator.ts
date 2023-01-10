export default class RewindableAsyncIterableIterator<T>
  implements AsyncIterableIterator<T>
{
  #iterator: AsyncIterator<T>;
  #buffer: T[] = [];
  #hasEnded = false;
  #index = 0;

  constructor(iterable: AsyncIterable<T>) {
    this.#iterator = iterable[Symbol.asyncIterator]();
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  rewind() {
    this.#index = 0;
  }

  getBuffer(): T[] {
    return [...this.#buffer];
  }

  async next(): Promise<IteratorResult<T>> {
    // Resolve elements from buffer
    if (this.#hasEnded) {
      if (this.#index >= this.#buffer.length) {
        return Promise.resolve({ value: undefined, done: true });
      }
      return Promise.resolve({
        value: this.#buffer[this.#index++],
        done: false,
      });
    }
    // Resolve elements from underlying iterator
    const result = await this.#iterator.next();
    if (!result.done) {
      this.#buffer.push(result.value);
      this.#index++;
    } else {
      this.#hasEnded = true;
    }
    return Promise.resolve(result);
  }

  async return(): Promise<IteratorResult<T>> {
    return (
      this.#iterator.return?.() ??
      Promise.resolve({ value: undefined, done: true })
    );
  }
}
