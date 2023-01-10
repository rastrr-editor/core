import { LayerList } from '~/layer-list';
import { type Layer, LayerFactory } from '~/layer';
import { type CommandOptions } from './interface';
import { Color } from '~/color';

export function createTemporaryLayer(layers: LayerList): {
  layer: Layer;
  index: number;
} {
  if (layers.activeLayer == null || layers.activeIndex == null) {
    throw new TypeError('Active layer is not set');
  }
  const { activeLayer: layer, activeIndex } = layers;
  const tmpLayer = LayerFactory.setType(layer.type).empty(
    layer.width,
    layer.height,
    { opacity: layer.opacity }
  );
  const insertIndex = activeIndex + 1;
  layers.insert(insertIndex, tmpLayer, { tmp: true });

  return { layer: tmpLayer, index: insertIndex };
}

export function createNewLayer(
  layers: LayerList,
  options?: { tmp: boolean }
): {
  layer: Layer;
  index: number;
} {
  if (layers.length === 0) {
    throw new TypeError('No layers in the list');
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const layer = layers.get(0)!;
  const newLayer = LayerFactory.setType(layer.type).empty(
    layer.width,
    layer.height
  );
  layers.add(newLayer, { tmp: options?.tmp });
  layers.setActive(layers.length - 1);

  return { layer: newLayer, index: layers.length - 1 };
}

export function commitTemporaryData(
  layers: LayerList,
  temporaryIndex: number,
  callbacks?: {
    beforeCommit?: (tmpLayer: Layer, activeLayer: Layer) => void;
    afterCommit?: (tmpLayer: Layer, activeLayer: Layer) => void;
  }
): boolean {
  const layer = layers.remove(temporaryIndex);

  if (layers.activeLayer != null && layers.activeIndex === temporaryIndex - 1) {
    callbacks?.beforeCommit?.(layer, layers.activeLayer);
    layers.activeLayer.drawContents(layer);
    callbacks?.afterCommit?.(layer, layers.activeLayer);
    return true;
  }
  return false;
}

export function commitTemporaryDataToNewLayer(
  layers: LayerList,
  temporaryIndex: number,
  options: { size?: Rastrr.Point; offset?: Rastrr.Point } = {}
): void {
  const layer = layers.remove(temporaryIndex);
  const { size, offset: srcOffset } = options;
  const newLayer = LayerFactory.setType(layer.type).empty(
    size?.x ?? layer.width,
    size?.y ?? layer.height,
    { opacity: layer.opacity }
  );
  if (srcOffset) {
    newLayer.setOffset(srcOffset);
  }
  layers.add(newLayer);
  layers.setActive(layers.length - 1);
  if (layers.activeLayer != null) {
    layers.activeLayer.drawContents(layer, { srcOffset, srcSize: size });
  }
}

export function applyOptionsToCanvasCtx({
  context,
  options,
  layer,
  operation = 'stroke',
}: {
  context: CanvasRenderingContext2D;
  options: CommandOptions;
  layer?: Layer;
  operation?: 'fill' | 'stroke';
}): void {
  if (options.color) {
    if (operation === 'stroke') {
      context.strokeStyle = options.color.toString('rgb');
    } else {
      context.fillStyle = options.color.toString('rgb');
    }
    // TODO: preserve alpha of the path without applied layer opacity
    context.globalAlpha = (options.color.a / 255) * (layer?.opacity ?? 1);
  }
  if (options.width) {
    context.lineWidth = options.width;
  }
  if (options.lineCap) {
    context.lineCap = options.lineCap;
    context.lineJoin = 'round';
  }
}

export function applyDefaultOptions(options?: CommandOptions): CommandOptions {
  return {
    ...options,
    color: options?.color ?? new Color(0, 0, 0, 255),
    width: options?.width ?? 1,
    lineCap: options?.lineCap ?? 'round',
  };
}

export function getLayerCanvasContext(layer: Layer): CanvasRenderingContext2D {
  if (layer.canvas instanceof HTMLCanvasElement) {
    const context = layer.canvas.getContext('2d');
    if (context) {
      return context;
    }
    throw new Error('Failed to get 2D context');
  }
  throw new Error('Incorrect layer canvas param');
}

export async function drawLine(
  context: CanvasRenderingContext2D,
  layer: Layer,
  iterable: AsyncIterable<Rastrr.Point>
): Promise<void> {
  let prevPosition: Rastrr.Point | null = null;

  context.beginPath();

  for await (const point of iterable) {
    if (!prevPosition) {
      context.moveTo(point.x, point.y);
    }
    // Deduplicate repeating points
    if (prevPosition?.x !== point.x || prevPosition?.y !== point.y) {
      context.lineTo(point.x, point.y);
      context.stroke();
      prevPosition = point;
      layer.emitChange();
    }
  }
}

export function extractImageDataForArea(
  context: CanvasRenderingContext2D,
  start: Rastrr.Point,
  end: Rastrr.Point
): ImageData {
  return context.getImageData(start.x, start.y, end.x, end.y);
}

export function normalizeAreaCoords(start: Rastrr.Point, end: Rastrr.Point) {
  const normalizedStart = { ...start };
  const normalizedEnd = { ...end };
  if (end.y < 0) {
    normalizedEnd.y = Math.abs(end.y);
    normalizedStart.y -= normalizedEnd.y;
  }
  if (end.x < 0) {
    normalizedEnd.x = Math.abs(end.x);
    normalizedStart.x -= normalizedEnd.x;
  }
  return { start: normalizedStart, end: normalizedEnd };
}
