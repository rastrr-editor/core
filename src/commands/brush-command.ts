import { Command } from './interface';
import LayerCommand from './layer-command';
import { LayerFactory } from '~/layer';
import { Color } from '~/color';
import { LayerList } from '..';

type BrushOptions = {
  color: Color;
  width: number;
  lineCap: 'butt' | 'round' | 'square';
};

export default class BrushCommand extends LayerCommand implements Command {
  readonly options: BrushOptions;
  readonly name = 'Кисть';
  #layers: LayerList;
  #insertIndex: number;

  constructor(
    layers: LayerList,
    iterable: AsyncIterable<Rastrr.Point>,
    options?: Partial<BrushOptions>
  ) {
    if (layers.activeLayer == null || layers.activeIndex == null) {
      throw new TypeError('Active layer is not set');
    }
    const { activeLayer: layer, activeIndex: insertIndex } = layers;
    const tmpLayer = LayerFactory.setType(layer.type).empty(
      layer.width,
      layer.height
    );

    // TODO: layer should be marked as temporary
    layers.insert(insertIndex, tmpLayer);

    super(tmpLayer, iterable);
    this.#insertIndex = insertIndex;
    this.#layers = layers;
    this.options = {
      ...options,
      color: options?.color ?? new Color(0, 0, 0, 255),
      width: options?.width ?? 1,
      lineCap: options?.lineCap ?? 'round',
    };
  }

  async execute(): Promise<boolean> {
    let prevPosition: Rastrr.Point | null = null;

    this.context.strokeStyle = this.options.color.toString('rgb');
    this.context.lineWidth = this.options.width;
    this.context.lineCap = this.options.lineCap;
    this.context.lineJoin = 'round';
    this.context.globalAlpha = this.options.color.a / 256;
    this.context.globalCompositeOperation = 'copy';
    this.context.beginPath();
    for await (const point of this.iterable) {
      if (!prevPosition) {
        this.context.moveTo(point.x, point.y);
      }
      // Deduplicate repeating points
      if (prevPosition?.x !== point.x || prevPosition?.y !== point.y) {
        this.context.lineTo(point.x, point.y);
        this.context.stroke();
        prevPosition = point;
        this.layer.emitChange();
      }
    }
    // Remove temporary layer
    const layer = this.#layers.remove(this.#insertIndex);
    // If active layer hasn't changed - draw contents from temporary layer
    if (
      this.#layers.activeLayer != null &&
      this.#layers.activeIndex === this.#insertIndex
    ) {
      this.#layers.activeLayer.drawContents(layer);
      this.#layers.activeLayer.emitChange();
    }
    return true;
  }
}
