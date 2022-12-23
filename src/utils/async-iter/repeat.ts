export default async function* repeat<T>(
  action: () => AsyncIterable<T>
): AsyncGenerator<T> {
  while (true) {
    const iterable = action();
    for await (const value of iterable) {
      yield value;
    }
  }
}
