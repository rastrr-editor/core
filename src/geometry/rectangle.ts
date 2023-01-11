function isArea(area: unknown): area is Rastrr.Area {
  return (area as Rastrr.Area).start != null;
}

export default class Rectangle {
  public corner: Rastrr.Point;

  public width: number;

  public height: number;

  constructor(area: Rastrr.Area);
  constructor(corner: Rastrr.Point, width: number, height: number);
  constructor(
    cornerOrArea: Rastrr.Area | Rastrr.Point,
    width?: number,
    height?: number
  ) {
    if (isArea(cornerOrArea)) {
      this.corner = cornerOrArea.start;
      this.width = cornerOrArea.end.x - cornerOrArea.start.x;
      this.height = cornerOrArea.end.y - cornerOrArea.start.y;
    } else if (width != null && height != null) {
      this.corner = cornerOrArea;
      this.width = width;
      this.height = height;
    } else {
      throw new TypeError('Wrong Rectangle arguments');
    }
  }

  toArea(): Rastrr.Area {
    return {
      start: this.corner,
      end: { x: this.corner.x + this.width, y: this.corner.y + this.height },
    };
  }

  intersects(rect: Rectangle): boolean {
    const srcArea = this.toArea();
    const destArea = rect.toArea();

    return (
      srcArea.start.x < destArea.end.x &&
      srcArea.start.y < destArea.end.y &&
      srcArea.end.x > destArea.start.x &&
      srcArea.end.y > destArea.start.y
    );
  }

  intersection(rect: Rectangle): Rectangle | null {
    if (!this.intersects(rect)) {
      return null;
    }
    const srcArea = this.toArea();
    const destArea = rect.toArea();
    const start =
      srcArea.start.x < destArea.start.x && srcArea.start.y < destArea.start.y
        ? destArea.start
        : srcArea.start;
    const end =
      srcArea.end.x < destArea.end.x && srcArea.end.y < destArea.end.y
        ? srcArea.end
        : destArea.end;
    return new Rectangle({ start, end });
  }
}
