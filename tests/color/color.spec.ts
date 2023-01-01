import { Color } from '~/color';

describe('color', () => {
  describe('from', () => {
    test('should create color from hex', () => {
      const color = Color.from('#ffffff', 'hex');
      expect(color.r).toEqual(255);
      expect(color.g).toEqual(255);
      expect(color.b).toEqual(255);
      expect(color.a).toEqual(255);
    });

    test('should create color from hex with opacity', () => {
      const color = Color.from('#ff009064', 'hexa');
      expect(color.r).toEqual(255);
      expect(color.g).toEqual(0);
      expect(color.b).toEqual(144);
      expect(color.a).toEqual(100);
    });

    test('should create color from rgb', () => {
      const color = Color.from('rgb(100, 255, 0)', 'rgb');
      expect(color.r).toEqual(100);
      expect(color.g).toEqual(255);
      expect(color.b).toEqual(0);
      expect(color.a).toEqual(255);
    });

    test('should create color from rgba', () => {
      const color = Color.from('rgba(100, 255, 0, 0.1)', 'rgba');
      expect(color.r).toEqual(100);
      expect(color.g).toEqual(255);
      expect(color.b).toEqual(0);
      expect(color.a).toEqual(26);
    });
  });
});
