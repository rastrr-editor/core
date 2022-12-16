import { Color, LayerFactory, LayerList } from '../src';
// @ts-ignore
import EventEmitter from 'events';

// @ts-ignore
const canvas: HTMLCanvasElement = document.getElementById('canvas');
const inputFile = document.getElementById('input-image');
const rectBtn = document.getElementById('rect');

const canvasCtx = canvas.getContext('2d');

const layers = new LayerList();

const CanvasFactory = LayerFactory.setType('canvas');

function globalRedraw() {
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  for (const layer of layers) {
    canvasCtx.drawImage(layer.canvas, layer.offset.x, layer.offset.y);
  }
}

inputFile.addEventListener('change', function () {
  // @ts-ignore
  CanvasFactory.fromFile(inputFile.files[0]).then((layer) => {
    layers.add(layer);
    layer.setOpacity(0.7);
    globalRedraw();
  });
});

rectBtn.addEventListener('click', function () {
  const lay1 = CanvasFactory.filled(500, 500, new Color(128, 168, 243));
  const lay2 = CanvasFactory.filled(100, 100, new Color(255, 100, 100));

  lay1.name = 'lay1';
  lay2.name = 'lay2';

  layers.add(lay1);
  layers.add(lay2);

  // @ts-ignore
  // lay1.rectangle(0, 0, 250, 250, new Color(128, 168, 243, 255));
  // @ts-ignore
  // lay2.rectangle(0, 0, 250, 250, new Color(250, 20, 20, 255));

  setTimeout(() => {
    lay2.setWidth(200);
    lay2.setHeight(200);
    lay2.setOpacity(0.7);
    lay2.setOffset({ x: 100, y: 100 });

    globalRedraw();
  }, 1000);

  globalRedraw();
});
