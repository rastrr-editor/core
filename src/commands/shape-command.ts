import { applyDefaultOptions } from '~/commands/helpers';
import { LayerList } from '~/layer-list';
import { Command, CommandOptions } from './interface';
import { Layer } from '~/layer';

export interface ShapeCommandOptions extends CommandOptions {
  getLayerName?: (baseName: string) => string;
}

export default abstract class ShapeCommand implements Command {
  readonly name: string = 'Фигура';
  readonly options: ShapeCommandOptions;
  protected iterable: AsyncIterable<Rastrr.Point>;
  protected layers: LayerList;
  /**
   * All shapes must create new layer
   */
  protected createdLayer: Layer | null = null;

  constructor(
    layers: LayerList,
    iterable: AsyncIterable<Rastrr.Point>,
    options?: Partial<ShapeCommandOptions>
  ) {
    this.iterable = iterable;
    this.layers = layers;
    this.options = applyDefaultOptions(options);
  }

  abstract execute(): Promise<boolean>;

  async undo(): Promise<boolean> {
    if (this.createdLayer != null) {
      const index = this.layers.indexOf(this.createdLayer);
      if (index !== -1) {
        this.layers.remove(index);
        return true;
      }
    }
    return false;
  }

  getLayerName() {
    return this.options.getLayerName?.(this.name) ?? this.name;
  }
}
