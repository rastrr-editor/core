import { Color } from '~/color';
import { default as CanvasLayer } from './canvas-layer';
import type {
  Layer,
  LayerType,
  LayerConstructor,
  LayerOptions,
} from './interface';

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

  static empty(w: number, h: number, opts?: LayerOptions): Layer {
    return new this.Class(w, h, opts);
  }

  static cloneEmpty(layer: Layer): Layer {
    return this.setType(layer.type).empty(layer.width, layer.height, {
      opacity: layer.opacity,
    });
  }

  static filled(
    w: number,
    h: number,
    color: Color = DEFAULT_BACKGROUND,
    opts: LayerOptions = {}
  ): Layer {
    return new this.Class(w, h, { ...opts, color });
  }

  static fromFile(source: ImageBitmapSource): Promise<Layer> {
    return createImageBitmap(source).then((image) => {
      return new this.Class(image.width, image.height, { image });
    });
  }
}
