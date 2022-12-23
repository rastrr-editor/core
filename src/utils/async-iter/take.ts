export default async function* take<T>(
  iterable: AsyncIterable<T>,
  limit: number
): AsyncGenerator<T> {
  let i = 1;
  for await (const value of iterable) {
    yield value;
    i += 1;
    if (i > limit) {
      break;
    }
  }
}
