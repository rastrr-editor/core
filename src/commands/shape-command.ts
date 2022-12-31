import { default as LayerCommand } from './layer-command';
import { createNewLayer } from '~/commands/helpers';
import { LayerList } from '~/layer-list';

export default abstract class ShapeCommand extends LayerCommand {
  constructor(layers: LayerList, iterable: AsyncIterable<Rastrr.Point>) {
    const newLayer = createNewLayer(layers);
    super(newLayer, iterable);
  }
}
