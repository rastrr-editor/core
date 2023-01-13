import { LayerList } from '~/layer-list';
import {
  applyOptionsToCanvasCtx,
  applyDefaultOptions,
  getLayerCanvasContext,
} from '~/commands/helpers';
import { LayerFactory } from '~/layer';
import { Color } from '~/color';
import ShapeCommand, { type ShapeCommandOptions } from '../shape-command';

interface EllipseOptions extends ShapeCommandOptions {
  operation?: 'fill' | 'stroke';
}

export default class RectCommand extends ShapeCommand {
  readonly options: EllipseOptions;
  readonly name = 'Эллипс';

  constructor(
    layers: LayerList,
    iterable: AsyncIterable<Rastrr.Point>,
    options?: Partial<EllipseOptions>
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

    let radiusX = 0;
    let radiusY = 0;

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
        radiusX = Math.abs(point.x - startPosition.x);
        // TODO: detect if shift is pressed and make height equal to width
        radiusY = Math.abs(point.y - startPosition.y);

        this.context.beginPath();
        this.context.ellipse(
          startPosition.x,
          startPosition.y,
          radiusX,
          radiusY,
          0,
          0,
          2 * Math.PI
        );
        this.context.stroke();

        this.layer.emitChange();
      }
    }

    if (startPosition != null && radiusX !== 0 && radiusY !== 0) {
      // startPosition is a center of ellipse, so needed to calc start position of a whole shape
      startPosition = {
        x: startPosition.x - radiusX,
        y: startPosition.y - radiusY,
      };
      const size = { x: radiusX * 2, y: radiusY * 2 };
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

    context.beginPath();

    // size is a width/height of a whole layer
    // Needed to divide by 2 to get center and radiis of the ellipse
    context.ellipse(
      size.x / 2,
      size.y / 2,
      size.x / 2,
      size.y / 2,
      0,
      0,
      2 * Math.PI
    );

    const method = this.options.operation === 'fill' ? 'fill' : 'stroke';
    context[method]();

    newLayer.commitContentChanges();
    newLayer.emitChange();
  }
}
