import { default as LayerCommand } from './layer-command';
import { createNewLayer } from '~/commands/helpers';
import { LayerList } from '~/layer-list';

export default abstract class ShapeCommand extends LayerCommand {
  protected layers: LayerList;
  protected insertIndex: number;

  constructor(layers: LayerList, iterable: AsyncIterable<Rastrr.Point>) {
    const { layer, index } = createNewLayer(layers, { tmp: true });
    super(layer, iterable);
    this.layers = layers;
    this.insertIndex = index;
  }
}
