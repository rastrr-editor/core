import { Color, LayerFactory } from '../src';

const canvas = document.getElementById('canvas');
const inputFile = document.getElementById('input-image');
const rectBtn = document.getElementById('rect');

// @ts-ignore
const canvasCtx = canvas.getContext('2d');

const layers = [];

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

  layers.push(lay1);
  layers.push(lay2);

  // @ts-ignore
  lay1.rectangle(0, 0, 250, 250, new Color(128, 168, 243, 255));
  // @ts-ignore
  lay2.rectangle(0, 0, 250, 250, new Color(250, 20, 20, 255));

  lay2.setOpacity(100);
  lay2.offset = { x: 100, y: 100 };

  globalRedraw();
});
