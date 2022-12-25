import { Color } from '~/color';
import { default as CanvasLayer } from './canvas-layer';
import type { Layer, LayerType, LayerConstructor } from './interface';

const DEFAULT_BACKGROUND = new Color(255, 255, 255, 255);

export default class LayerFactory {
  protected static Class: LayerConstructor = CanvasLayer;

  static setType(type: LayerType): typeof LayerFactory {
    let impl: LayerConstructor;
    switch (type) {
      case 'canvas':
        impl = CanvasLayer;
        break;
      default:
        throw new Error('Unknown layer type');
    }
    return class extends this {
      protected static Class = impl;
    };
  }

  static empty(w: number, h: number): Layer {
    return new this.Class(w, h);
  }

  static filled(
    w: number,
    h: number,
    color: Color = DEFAULT_BACKGROUND
  ): Layer {
    return new this.Class(w, h, { color });
  }

  static fromFile(source: ImageBitmapSource): Promise<Layer> {
    return createImageBitmap(source).then((image) => {
      return new this.Class(image.width, image.height, { image });
    });
  }
}
