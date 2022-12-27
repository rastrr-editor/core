import { Command } from '~/commands';
import LayerCommand from './layer-command';
import { LayerFactory } from '~/layer';
import { Color } from '~/color';
import { LayerList } from '~/layer-list';

type RectOptions = {
  color: Color;
  width: number;
  lineCap: 'butt' | 'round' | 'square';
};

export default class RectCommand extends LayerCommand implements Command {
  readonly options: RectOptions;
  readonly name = 'Прямоугольник';
  #layers: LayerList;
  #insertIndex: number;

  constructor(
    layers: LayerList,
    iterable: AsyncIterable<Rastrr.Point>,
    options?: Partial<RectOptions>
  ) {
    if (layers.activeLayer == null || layers.activeIndex == null) {
      throw new TypeError('Active layer is not set');
    }
    const { activeLayer: layer, activeIndex } = layers;
    const tmpLayer = LayerFactory.setType(layer.type).empty(
      layer.width,
      layer.height
    );
    const insertIndex = activeIndex + 1;
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
    let startPosition: Rastrr.Point | null = null;

    this.context.strokeStyle = this.options.color.toString('rgb');
    this.context.lineWidth = this.options.width;
    this.context.lineCap = this.options.lineCap;
    this.context.lineJoin = 'round';
    this.context.globalAlpha = this.options.color.a / 256;
    this.context.globalCompositeOperation = 'copy';
    for await (const point of this.iterable) {
      if (!startPosition) {
        startPosition = point;
      }

      if (
        startPosition &&
        (startPosition?.x !== point.x || startPosition?.y !== point.y)
      ) {
        this.#clean();
        this.context.strokeRect(
          startPosition.x,
          startPosition.y,
          point.x - startPosition.x,
          point.y - startPosition.y
        );
        this.layer.emitChange();
      }
    }

    // Remove temporary layer
    const layer = this.#layers.remove(this.#insertIndex);
    // If active layer hasn't changed - draw contents from temporary layer
    if (
      this.#layers.activeLayer != null &&
      this.#layers.activeIndex === this.#insertIndex - 1
    ) {
      this.#layers.activeLayer.drawContents(layer);
      this.#layers.activeLayer.emitChange();
    }
    return true;
  }

  #clean(): void {
    this.context.clearRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height
    );
  }
}
