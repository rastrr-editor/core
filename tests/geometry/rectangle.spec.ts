/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Rectangle } from '~/geometry';

describe('rectangle', () => {
  describe('intersection', () => {
    test('should return null if there is no intersection', () => {
      const intersection1 = new Rectangle({ x: 0, y: 0 }, 2, 2).intersection(
        new Rectangle({ x: 2, y: 2 }, 2, 2)
      );
      expect(intersection1).toBeNull();

      const intersection2 = new Rectangle({ x: 0, y: 0 }, 2, 2).intersection(
        new Rectangle({ x: 0, y: 2 }, 2, 2)
      );
      expect(intersection2).toBeNull();

      const intersection3 = new Rectangle({ x: 2, y: 2 }, 2, 2).intersection(
        new Rectangle({ x: 0, y: 0 }, 2, 2)
      );
      expect(intersection3).toBeNull();

      const intersection4 = new Rectangle({ x: 0, y: 2 }, 2, 2).intersection(
        new Rectangle({ x: 0, y: 0 }, 2, 2)
      );
      expect(intersection4).toBeNull();

      const intersection5 = new Rectangle({ x: 0, y: 0 }, 2, 2).intersection(
        new Rectangle({ x: 2, y: 0 }, 2, 2)
      );
      expect(intersection5).toBeNull();

      const intersection6 = new Rectangle({ x: 2, y: 0 }, 2, 2).intersection(
        new Rectangle({ x: 0, y: 0 }, 2, 2)
      );
      expect(intersection6).toBeNull();
    });

    test('should return new rectangle if there is a intersection', () => {
      const intersection1 = new Rectangle({ x: 0, y: 0 }, 2, 2).intersection(
        new Rectangle({ x: 1, y: 1 }, 2, 2)
      );
      expect(intersection1).toBeInstanceOf(Rectangle);
      const area1 = intersection1!.toArea();
      expect(area1.start).toEqual({ x: 1, y: 1 });
      expect(area1.end).toEqual({ x: 2, y: 2 });

      const intersection2 = new Rectangle({ x: 0, y: 0 }, 4, 4).intersection(
        new Rectangle({ x: 1, y: 1 }, 2, 2)
      );
      expect(intersection2).toBeInstanceOf(Rectangle);
      const area2 = intersection2!.toArea();
      expect(area2.start).toEqual({ x: 1, y: 1 });
      expect(area2.end).toEqual({ x: 3, y: 3 });

      const intersection3 = new Rectangle({ x: 1, y: 1 }, 2, 2).intersection(
        new Rectangle({ x: 0, y: 0 }, 4, 4)
      );
      expect(intersection3).toBeInstanceOf(Rectangle);
      const area3 = intersection3!.toArea();
      expect(area3.start).toEqual({ x: 1, y: 1 });
      expect(area3.end).toEqual({ x: 3, y: 3 });

      const intersection4 = new Rectangle({ x: 1, y: 1 }, 2, 2).intersection(
        new Rectangle({ x: 0, y: 0 }, 2, 2)
      );
      expect(intersection4).toBeInstanceOf(Rectangle);
      const area4 = intersection4!.toArea();
      expect(area4.start).toEqual({ x: 1, y: 1 });
      expect(area4.end).toEqual({ x: 2, y: 2 });
    });

    test('should return correct intersection for both ways', () => {
      const rect1 = new Rectangle({
        start: { x: -31, y: 11 },
        end: { x: 537, y: 33 },
      });
      const rect2 = new Rectangle({
        start: { x: 0, y: 0 },
        end: { x: 500, y: 500 },
      });

      const intersection1 = rect1.intersection(rect2);
      expect(intersection1).toBeInstanceOf(Rectangle);
      const area1 = intersection1!.toArea();
      expect(area1.start).toEqual({ x: 0, y: 11 });
      expect(area1.end).toEqual({ x: 500, y: 33 });

      const intersection2 = rect2.intersection(rect1);
      expect(intersection2).toBeInstanceOf(Rectangle);
      const area2 = intersection2!.toArea();
      expect(area2.start).toEqual({ x: 0, y: 11 });
      expect(area2.end).toEqual({ x: 500, y: 33 });
    });
  });
});
