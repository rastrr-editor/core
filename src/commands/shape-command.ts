import { default as LayerCommand } from './layer-command';
import { applyDefaultOptions, createNewLayer } from '~/commands/helpers';
import { LayerList } from '~/layer-list';
import { CommandOptions } from './interface';

export interface ShapeCommandOptions extends CommandOptions {
  getLayerName?: (baseName: string) => string;
}

// TODO: shape command shouldn't extend layer command
export default abstract class ShapeCommand extends LayerCommand {
  readonly options: ShapeCommandOptions;
  protected layers: LayerList;
  protected insertIndex: number;

  constructor(
    layers: LayerList,
    iterable: AsyncIterable<Rastrr.Point>,
    options?: Partial<ShapeCommandOptions>
  ) {
    const { layer, index } = createNewLayer(layers, { tmp: true });
    super(layer, iterable);
    this.layers = layers;
    this.insertIndex = index;
    this.options = applyDefaultOptions(options);
  }

  getLayerName() {
    return this.options.getLayerName?.(this.name) ?? this.name;
  }
}
