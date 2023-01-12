import { LayerList } from '~/layer-list';
import {
  applyOptionsToCanvasCtx,
  applyDefaultOptions,
  getLayerCanvasContext,
  normalizeAreaCoords,
  createNewLayer,
} from '~/commands/helpers';
import { LayerFactory, type Layer } from '~/layer';
import { Color } from '~/color';
import ShapeCommand, { type ShapeCommandOptions } from '../shape-command';
import { Rectangle } from '~/geometry';

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

    // Rectangle top-left corner
    let corner: Rastrr.Point | null = null;
    applyOptionsToCanvasCtx({
      // There we use same color as for brush cursor
      options: { ...options, color: Color.from('#c1c1c1', 'hex') },
      context,
      layer,
      operation: 'stroke',
    });
    context.globalCompositeOperation = 'copy';
    let width = 0;
    let height = 0;
    for await (const rawPoint of this.iterable) {
      const point = { x: Math.round(rawPoint.x), y: Math.round(rawPoint.y) };
      if (!corner) {
        if (
          point.x < 0 ||
          point.x > layer.width ||
          point.y < 0 ||
          point.y > layer.height
        ) {
          break;
        }
        corner = point;
      }
      if (corner && (corner?.x !== point.x || corner?.y !== point.y)) {
        width = point.x - corner.x;
        // TODO: detect if shift is pressed and make height equal to width
        height = point.y - corner.y;
        context.strokeRect(corner.x, corner.y, width, height);
        layer.emitChange();
      }
    }
    this.layers.remove(index);
    let rect: Rectangle | null = null;
    if (corner != null && width !== 0 && height !== 0) {
      const area = normalizeAreaCoords(corner, { x: width, y: height });
      rect = new Rectangle(area.start, area.end.x, area.end.y);
    }
    return { rect, layer };
  }

  protected finalDraw(rect: Rectangle, layer: Layer) {
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

    // Draw rect on new layer
    const context = getLayerCanvasContext(this.createdLayer);
    const { options } = this;
    applyOptionsToCanvasCtx({
      options,
      context,
      layer,
      operation: options.operation,
    });
    const method =
      this.options.operation === 'fill' ? 'fillRect' : 'strokeRect';
    context[method](0, 0, rect.width, rect.height);
    this.createdLayer.commitContentChanges();
    this.createdLayer.emitChange();
  }
}
