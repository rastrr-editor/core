import {Layer, Color} from '../src'

const canvas = document.getElementById('canvas')
const inputFile = document.getElementById('input-image')
const rectBtn = document.getElementById('rect')

// @ts-ignore
const canvasCtx = canvas.getContext('2d')

const layers = []

function globalRedraw() {
    let pos = 0;

    for (const layer of layers) {
        canvasCtx.drawImage(layer.canvas, pos, pos)
        pos += 100;
    }
}

inputFile.addEventListener('change', function () {
    // @ts-ignore
    Layer.fromFile(inputFile.files[0]).then(layer => {
        layers.push(layer);
        layer.setAlpha(100)
        globalRedraw();
    })
})

rectBtn.addEventListener('click', function () {
    const lay1 = new Layer(500, 500);
    const lay2 = new Layer(500, 500);

    layers.push(lay1)
    layers.push(lay2)

    lay1.rectangle(0, 0, 250, 250, new Color(128, 168, 243, 100))
    lay2.rectangle(0, 0, 250, 250, new Color(250, 20, 20, 100))

    lay2.setAlpha(150)

    globalRedraw();
})



