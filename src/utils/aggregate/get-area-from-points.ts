export default function getAreaFromPoints(
  points: Iterable<Rastrr.Point>,
  startLimit?: Rastrr.Point,
  endLimit?: Rastrr.Point
): Rastrr.Area {
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;

  for (const point of points) {
    if (point.y > maxY) {
      maxY = point.y;
    }
    if (point.y < minY) {
      minY = point.y;
    }
    if (point.x > maxX) {
      maxX = point.x;
    }
    if (point.x < minX) {
      minX = point.x;
    }
  }
  // FIXME: it doesn't work as expected
  let start = startLimit
    ? { x: Math.max(minX, startLimit.x), y: Math.max(minY, startLimit.y) }
    : { x: minX, y: minY };
  let end = endLimit
    ? { x: Math.min(maxX, endLimit.x), y: Math.min(maxY, endLimit.y) }
    : { x: maxX, y: maxY };
  if (start.x > end.x || start.y > end.y) {
    start = end;
  }
  if (end.x < start.x || end.y < start.y) {
    end = start;
  }
  return { start, end };
}
