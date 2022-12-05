const path = require('path');

const isDev = process.env.NODE_ENV !== 'production'
const isProd = !isDev

const filename = (extension) => isDev ? `[name].${extension}` : `[name].[hash].${extension}`

module.exports = {
    mode: 'development',
    entry: {
        'example': './example/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'example', 'build'),
        filename: filename('js'),
    },
    resolve: {
        alias: {
        }
    }
}