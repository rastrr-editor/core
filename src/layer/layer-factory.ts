import { Color } from '~/color';
import { default as CanvasLayer } from './canvas-layer';
import { Layer } from './interface';
import { Color } from '~/*';

export default class LayerFactory {
  static empty(w: number, h: number): Layer {
    return new CanvasLayer(w, h);
  }

  static filled(w: number, h: number, color: Color): Layer {
    return new CanvasLayer(w, h, { color });
  }

  static fromFile(source: ImageBitmapSource): Promise<Layer> {
    return createImageBitmap(source).then((image) => {
      return new CanvasLayer(image.width, image.height, { image });
    });
  }
}
