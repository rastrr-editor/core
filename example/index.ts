import { Color, LayerFactory, LayerEmitter } from '../src';
// @ts-ignore
import EventEmitter from 'events';

const canvas = document.getElementById('canvas');
const inputFile = document.getElementById('input-image');
const rectBtn = document.getElementById('rect');

// @ts-ignore
const canvasCtx = canvas.getContext('2d');

const layers = [];
const layerEmitter = new EventEmitter() as LayerEmitter;

layerEmitter.on('change', () => globalRedraw());

function globalRedraw() {
  for (const layer of layers) {
    canvasCtx.drawImage(layer.canvas, layer.offset.x, layer.offset.y);
  }
}

inputFile.addEventListener('change', function () {
  // @ts-ignore
  LayerFactory.fromFile(inputFile.files[0]).then((layer) => {
    layers.push(layer);
    layer.setOpacity(100);
    globalRedraw();
  });
});

rectBtn.addEventListener('click', function () {
  const lay1 = LayerFactory.empty(500, 500);
  const lay2 = LayerFactory.filled(500, 500, new Color(255, 100, 100));

  lay2.setEmitter(layerEmitter);

  layers.push(lay1);
  layers.push(lay2);

  // @ts-ignore
  lay1.rectangle(0, 0, 250, 250, new Color(128, 168, 243, 255));
  // @ts-ignore
  lay2.rectangle(0, 0, 250, 250, new Color(250, 20, 20, 255));

  setTimeout(() => {
    lay2.setOpacity(100);
    lay2.setOffset({ x: 100, y: 100 });
  }, 3000);

  globalRedraw();
});
