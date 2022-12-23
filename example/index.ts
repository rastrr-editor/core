import { Color, LayerFactory, Viewport, PencilCommand } from '../src';

const container = document.getElementById('viewport');
const inputFile = document.getElementById('input-image');
const rectBtn = document.getElementById('rect');
const pencilBtn = document.getElementById('pencil');

const viewport = new Viewport(container, { strategy: 'canvas' });
const CanvasFactory = LayerFactory.setType('canvas');

viewport.layers.emitter.on('change', () => viewport.render());
viewport.layers.emitter.on('add', () => viewport.render());
viewport.layers.emitter.on('remove', () => viewport.render());
viewport.layers.emitter.on('move', () => viewport.render());

inputFile.addEventListener('change', function () {
  if (inputFile instanceof HTMLInputElement && inputFile.files.length) {
    CanvasFactory.fromFile(inputFile.files[0]).then((layer) => {
      viewport.layers.add(layer);
      layer.setOpacity(0.7);
    });
  }
});

rectBtn.addEventListener('click', function () {
  const lay1 = CanvasFactory.filled(500, 500, new Color(128, 168, 243));
  const lay2 = CanvasFactory.filled(300, 300, new Color(255, 100, 100));

  lay1.name = 'lay1';
  lay2.name = 'lay2';

  viewport.layers.add(lay1);
  viewport.layers.add(lay2);

  lay1.setOffset({ x: 0, y: 0 });
  lay2.setOffset({ x: 100, y: 100 });

  // setTimeout(() => {
  //   lay2.setWidth(200);
  //   lay2.setHeight(200);
  //   lay2.setOpacity(0.7);
  //   lay2.setOffset({ x: 100, y: 100 });
  // }, 1000);

  viewport.layers.setActive(1);

  // setTimeout(() => {
  //   viewport.layers.setActive(0);
  //   console.log('setActive');
  // }, 10000);
});

pencilBtn.addEventListener('click', function () {
  const activeLayer = viewport.layers.activeLayer;
  if (activeLayer !== undefined) {
    // @ts-ignore
    const pencilCommand = new PencilCommand(activeLayer, generate(100, 100));
    pencilCommand.execute().then((data) => console.log('final', data));
  }
});

function* generate(
  x: number,
  y: number
): Generator<Promise<{ x: number; y: number }>> {
  yield Promise.resolve({ x: x, y: y });

  for (let i = 0; i <= 100; i++) {
    yield new Promise((resolve) => {
      setTimeout(() => resolve({ x: x + i, y: y + i }), 100);
    });
  }

  return Promise.resolve({ x: 300, y: 300 });
}
