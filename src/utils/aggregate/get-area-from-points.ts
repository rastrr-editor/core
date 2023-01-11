export default function getAreaFromPoints(
  points: Iterable<Rastrr.Point>
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
  return { start: { x: minX, y: minY }, end: { x: maxX, y: maxY } };
}
