import { Color } from '~/color';
import { default as CanvasLayer } from './canvas-layer';
import { Layer, LayerType, LayerConstructor } from './interface';

export default class LayerFactory {
  protected static class: LayerConstructor = CanvasLayer;

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
      protected static class = impl;
    };
  }

  static empty(w: number, h: number): Layer {
    return new this.class(w, h);
  }

  static filled(w: number, h: number, color: Color): Layer {
    return new this.class(w, h, { color });
  }

  static fromFile(source: ImageBitmapSource): Promise<Layer> {
    return createImageBitmap(source).then((image) => {
      return new this.class(image.width, image.height, { image });
    });
  }
}
