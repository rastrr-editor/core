import { LayerList } from '~/layer-list';
import {
  applyOptionsToCanvasCtx,
  applyDefaultOptions,
  getLayerCanvasContext,
  createNewLayer,
  normalizeAreaCoords,
} from '~/commands/helpers';
import { LayerFactory, type Layer } from '~/layer';
import { Color } from '~/color';
import ShapeCommand, { type ShapeCommandOptions } from '../shape-command';
import { Rectangle } from '~/geometry';

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
    if (this.createdLayer != null) {
      this.layers.add(this.createdLayer);
      this.layers.setActive(this.layers.length - 1);
      return true;
    }
    const { rect, layer } = await this.previewDraw();
    if (rect != null) {
      this.finalDraw(rect, layer);
      return true;
    }
    return false;
  }

  protected async previewDraw(): Promise<{
    rect: Rectangle | null;
    layer: Layer;
  }> {
    const { options } = this;
    const { layer, index } = createNewLayer(this.layers, { tmp: true });
    const context = getLayerCanvasContext(layer);

    // Ellipse center
    let center: Rastrr.Point | null = null;
    applyOptionsToCanvasCtx({
      // There we use same color as for brush cursor
      options: { ...options, color: Color.from('#c1c1c1', 'hex') },
      context,
      layer,
      operation: 'stroke',
    });
    context.globalCompositeOperation = 'copy';
    let radiusX = 0;
    let radiusY = 0;
    for await (const rawPoint of this.iterable) {
      const point = { x: Math.round(rawPoint.x), y: Math.round(rawPoint.y) };
      if (!center) {
        if (
          point.x < 0 ||
          point.x > layer.width ||
          point.y < 0 ||
          point.y > layer.height
        ) {
          break;
        }
        center = point;
      }
      if (center && (center?.x !== point.x || center?.y !== point.y)) {
        radiusX = Math.abs(point.x - center.x);
        // TODO: detect if shift is pressed and make height equal to width
        radiusY = Math.abs(point.y - center.y);
        context.beginPath();
        context.ellipse(
          center.x,
          center.y,
          radiusX,
          radiusY,
          0,
          0,
          2 * Math.PI
        );
        context.stroke();
        layer.emitChange();
      }
    }
    this.layers.remove(index);
    let rect: Rectangle | null = null;
    if (center != null && radiusX !== 0 && radiusY !== 0) {
      // Calculate the top-left corner of a whole shape area
      const corner = { x: center.x - radiusX, y: center.y - radiusY };
      // Doubling radiis to get full area width/height
      const area = normalizeAreaCoords(corner, {
        x: radiusX * 2,
        y: radiusY * 2,
      });
      rect = new Rectangle(area.start, area.end.x, area.end.y);
    }
    return { rect, layer };
  }

  protected finalDraw(rect: Rectangle, layer: Layer): void {
    this.createdLayer = LayerFactory.setType(layer.type).empty(
      rect.width,
      rect.height,
      {
        opacity: layer.opacity,
      }
    );
    this.createdLayer.setOffset(rect.corner);
    this.createdLayer.name = this.getLayerName();
    this.createdLayer.locked = true;
    this.layers.add(this.createdLayer);
    this.layers.setActive(this.layers.length - 1);

    // Draw ellipse on a new layer
    const context = getLayerCanvasContext(this.createdLayer);
    const { options } = this;
    applyOptionsToCanvasCtx({
      options,
      context,
      layer,
      operation: options.operation,
    });
    context.beginPath();

    // Needed to divide by 2 to get center and radiis of the ellipse
    context.ellipse(
      rect.width / 2,
      rect.height / 2,
      rect.width / 2,
      rect.height / 2,
      0,
      0,
      2 * Math.PI
    );
    const method = this.options.operation === 'fill' ? 'fill' : 'stroke';
    context[method]();
    this.createdLayer.commitContentChanges();
    this.createdLayer.emitChange();
  }
}
