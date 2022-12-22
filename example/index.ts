import { Color, LayerFactory, Viewport, PencilCommand } from '../src';

const container = document.getElementById('viewport');
const inputFile = document.getElementById('input-image');
const rectBtn = document.getElementById('rect');
const pencilBtn = document.getElementById('pencil');

const viewport = new Viewport(container, 'canvas');
const CanvasFactory = LayerFactory.setType('canvas');
const pencilCommand = new PencilCommand(viewport);

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
  const onMouseDown = function (e) {
    const promise = pencilCommand.execute();
    console.log(promise);
    promise.then((data) => console.log('final', data));

    container.addEventListener('mousemove', onMouseMove);

    container.addEventListener('mouseup', onMouseUp, { once: true });

    viewport.emitter.emit('mousedown', {
      x: e.pageX - this.offsetLeft,
      y: e.pageY - this.offsetTop,
    });
  };

  const onMouseMove = function (e) {
    viewport.emitter.emit('mousemove', {
      x: e.pageX - this.offsetLeft,
      y: e.pageY - this.offsetTop,
    });
  };

  const onMouseUp = function (e) {
    viewport.emitter.emit('mouseup', {
      x: e.pageX - this.offsetLeft,
      y: e.pageY - this.offsetTop,
    });
    container.removeEventListener('mousemove', onMouseMove);
  };

  container.addEventListener('mousedown', onMouseDown, { once: true });
});
