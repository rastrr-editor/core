/* eslint-disable @typescript-eslint/no-empty-function */
import uniqid from 'uniqid';
import { LayerList } from '~/layer-list';
import type { Layer } from '~/layer';

const createLayer = (id = uniqid()): Layer => ({
  id: id,
  name: 'Empty',
  locked: false,
  type: 'canvas',
  width: 100,
  height: 100,
  opacity: 1,
  visible: true,
  offset: { x: 0, y: 0 },
  data: new Uint8ClampedArray(),
  // @ts-expect-error There is no canvas in node.js
  canvas: null,

  drawContents(): void {},
  setWidth(): void {},
  setHeight(): void {},
  setOpacity(): void {},
  setVisible(): void {},
  setOffset(): void {},
  setData(): void {},
  setEmitter(): void {},
  emitChange(): void {},
  commitContentChanges(): void {},
});

describe('LayerList', () => {
  const layers = new LayerList();

  const getLayerIds = () => Array.from(layers, ({ id }) => id);

  beforeEach(() => {
    layers.clear();
    layers
      .add(createLayer())
      .add(createLayer())
      .add(createLayer())
      .add(createLayer());
  });

  describe('insert', () => {
    test('should insert moving other layers', () => {
      const layerIds = getLayerIds();
      layers.insert(0, createLayer());
      expect(getLayerIds()).toEqual([layers.get(0)?.id, ...layerIds]);
    });

    test('should insert layer at the end of the list', () => {
      const layerIds = getLayerIds();
      layers.insert(4, createLayer());
      expect(getLayerIds()).toEqual([...layerIds, layers.get(4)?.id]);
    });

    test('should throw if insert index is out of bounds', () => {
      expect(() => layers.insert(-1, createLayer())).toThrow(RangeError);
      expect(() => layers.insert(5, createLayer())).toThrow(RangeError);
    });

    test('should update active index if insert is perfomed in position of active layer', () => {
      layers.setActive(3);
      layers.insert(3, createLayer());
      expect(layers.activeIndex).toEqual(4);
    });

    test('should update active index if insert is perfomed before the position of active layer', () => {
      layers.setActive(3);
      layers.insert(2, createLayer());
      expect(layers.activeIndex).toEqual(4);
    });

    test('should not update active index if insert is perfomed after the position of active layer', () => {
      layers.setActive(2);
      layers.insert(3, createLayer());
      expect(layers.activeIndex).toEqual(2);
    });
  });

  describe('remove', () => {
    test('should remove moving other layers', () => {
      const layerIds = getLayerIds();
      layers.remove(1);
      expect(layers.length).toEqual(3);
      expect(getLayerIds()).toEqual(
        layerIds.slice(0, 1).concat(layerIds.slice(2))
      );
    });

    test('should remove first layer', () => {
      layers.remove(0);
      expect(layers.length).toEqual(3);
    });

    test('should remove last layer', () => {
      layers.remove(3);
      expect(layers.length).toEqual(3);
    });

    test('should throw if remove index is out of bounds', () => {
      expect(() => layers.remove(4)).toThrow(RangeError);
    });

    test('should unset active index if active layer is removed', () => {
      layers.setActive(3);
      layers.remove(3);
      expect(layers.activeIndex).toBeUndefined();
    });

    test('should update active index if remove is perfomed before the position of active layer', () => {
      layers.setActive(3);
      layers.remove(2);
      expect(layers.activeIndex).toEqual(2);
    });

    test('should not update active index if remove is perfomed after the position of active layer', () => {
      layers.setActive(2);
      layers.remove(3);
      expect(layers.activeIndex).toEqual(2);
    });
  });

  describe('changePosition', () => {
    test('should change position moving other layers', () => {
      const layerIds = getLayerIds();
      layers.changePosition(0, 3);
      expect([layers.get(3)?.id, ...getLayerIds().slice(0, 3)]).toEqual(
        layerIds
      );
    });

    test('should throw if new index is out of bounds', () => {
      expect(() => layers.changePosition(-1, 1)).toThrow(RangeError);
      expect(() => layers.changePosition(0, 4)).toThrow(RangeError);
    });

    test('should update active index for moved layer', () => {
      layers.setActive(0);
      layers.changePosition(0, 3);
      expect(layers.activeIndex).toEqual(3);
    });

    test('should update active index which is after the moved layer', () => {
      layers.setActive(2);
      layers.changePosition(0, 3);
      expect(layers.activeIndex).toEqual(1);
    });

    test('should not update active index', () => {
      layers.setActive(0);
      layers.changePosition(2, 3);
      expect(layers.activeIndex).toEqual(0);
      layers.setActive(3);
      layers.changePosition(2, 1);
      expect(layers.activeIndex).toEqual(3);
    });

    test('should update active index correctly after multiple swaps', () => {
      layers.setActive(3);
      layers.changePosition(0, 3);
      expect(layers.activeIndex).toEqual(2);
      layers.changePosition(3, 0);
      expect(layers.activeIndex).toEqual(3);
      layers.changePosition(0, 2);
      expect(layers.activeIndex).toEqual(3);
    });
  });

  describe('iterators', () => {
    beforeEach(() => {
      layers.add(createLayer(), { tmp: true });
    });
    test('should return all layers including temporary', () => {
      const arr = Array.from(layers);
      expect(arr).toHaveLength(5);
      expect(arr.map(({ id }) => id)).toEqual(getLayerIds());
    });

    test('values() should return all layers except temporary', () => {
      const arr = Array.from(layers.values());
      expect(arr).toHaveLength(4);
      expect(arr.map(({ id }) => id)).toEqual(getLayerIds().slice(0, 4));
    });

    test('reverse() should return all layers except temporary', () => {
      const arr = Array.from(layers.reverse());
      expect(arr).toHaveLength(4);
      expect(arr.map(({ id }) => id)).toEqual(
        getLayerIds().slice(0, 4).reverse()
      );
    });
  });
});
