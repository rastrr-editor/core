import { LayerList } from '~/layer-list';
import {
  applyOptionsToCanvasCtx,
  applyDefaultOptions,
  getLayerCanvasContext,
} from '~/commands/helpers';
import { LayerFactory } from '~/layer';
import { Color } from '~/color';
import ShapeCommand, { type ShapeCommandOptions } from '../shape-command';

interface RectOptions extends ShapeCommandOptions {
  operation?: 'fill' | 'stroke';
}

export default class RectCommand extends ShapeCommand {
  readonly options: RectOptions;
  readonly name = 'Прямоугольник';

  constructor(
    layers: LayerList,
    iterable: AsyncIterable<Rastrr.Point>,
    options?: Partial<RectOptions>
  ) {
    super(layers, iterable, options);
    this.options = applyDefaultOptions(options);
  }

  async execute(): Promise<boolean> {
    let startPosition: Rastrr.Point | null = null;
    const { options, context, layer } = this;
    applyOptionsToCanvasCtx({
      // There we use same color as for brush cursor
      options: { ...options, color: Color.from('#c1c1c1', 'hex') },
      context,
      layer,
      operation: 'stroke',
    });
    this.context.globalCompositeOperation = 'copy';
    let width = 0;
    let height = 0;
    for await (const rawPoint of this.iterable) {
      const point = { x: Math.round(rawPoint.x), y: Math.round(rawPoint.y) };
      if (!startPosition) {
        if (
          point.x < 0 ||
          point.x > this.layer.canvas.width ||
          point.y < 0 ||
          point.y > this.layer.canvas.height
        ) {
          break;
        }
        startPosition = point;
      }
      if (
        startPosition &&
        (startPosition?.x !== point.x || startPosition?.y !== point.y)
      ) {
        width = point.x - startPosition.x;
        // TODO: detect if shift is pressed and make height equal to width
        height = point.y - startPosition.y;
        this.context.strokeRect(
          startPosition.x,
          startPosition.y,
          width,
          height
        );
        this.layer.emitChange();
      }
    }

    if (startPosition != null && width !== 0 && height !== 0) {
      // Normalize width and height
      if (height < 0) {
        height = Math.abs(height);
        startPosition.y -= height;
      }
      if (width < 0) {
        width = Math.abs(width);
        startPosition.x -= width;
      }
      const size = { x: width, y: height };
      this.finalDraw(startPosition, size);
    } else {
      this.layers.remove(this.insertIndex);
    }
    return true;
  }

  protected finalDraw(startPosition: Rastrr.Point, size: Rastrr.Point) {
    const layer = this.layers.remove(this.insertIndex);
    // Create new layer
    const newLayer = LayerFactory.setType(layer.type).empty(size.x, size.y, {
      opacity: layer.opacity,
    });
    newLayer.setOffset(startPosition);
    newLayer.name = this.getLayerName();
    newLayer.locked = true;
    this.layers.add(newLayer);
    this.layers.setActive(this.layers.length - 1);

    // Draw rect on new layer
    const context = getLayerCanvasContext(newLayer);
    const { options } = this;
    applyOptionsToCanvasCtx({
      options,
      context,
      layer,
      operation: options.operation,
    });
    const method =
      this.options.operation === 'fill' ? 'fillRect' : 'strokeRect';
    context[method](0, 0, size.x, size.y);
    newLayer.commitContentChanges();
    newLayer.emitChange();
  }
}
