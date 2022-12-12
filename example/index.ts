import { Color, LayerFactory, LayerEmitter, Layer } from '../src';
// @ts-ignore
import EventEmitter from 'events';

// @ts-ignore
const canvas: HTMLCanvasElement = document.getElementById('canvas');
const inputFile = document.getElementById('input-image');
const rectBtn = document.getElementById('rect');

const canvasCtx = canvas.getContext('2d');

const layers: Layer[] = [];
const layerEmitter = new EventEmitter() as LayerEmitter;
const CanvasFactory = LayerFactory.setType('canvas');

layerEmitter.on('change', () => globalRedraw());

function globalRedraw() {
  for (const layer of layers) {
    canvasCtx.drawImage(layer.canvas, layer.offset.x, layer.offset.y);
  }
}

inputFile.addEventListener('change', function () {
  // @ts-ignore
  CanvasFactory.fromFile(inputFile.files[0]).then((layer) => {
    layers.push(layer);
    layer.setEmitter(layerEmitter);
    layer.setOpacity(0.7);
  });
});

rectBtn.addEventListener('click', function () {
  const lay1 = CanvasFactory.filled(500, 500, new Color(128, 168, 243));
  const lay2 = CanvasFactory.filled(100, 100, new Color(255, 100, 100));

  lay2.setEmitter(layerEmitter);

  layers.push(lay1);
  layers.push(lay2);

  // @ts-ignore
  // lay1.rectangle(0, 0, 250, 250, new Color(128, 168, 243, 255));
  // @ts-ignore
  // lay2.rectangle(0, 0, 250, 250, new Color(250, 20, 20, 255));

  setTimeout(() => {
    lay2.setWidth(200);
    lay2.setHeight(200);
    lay2.setOpacity(0.7);
    lay2.setOffset({ x: 100, y: 100 });
  }, 3000);

  globalRedraw();
});
