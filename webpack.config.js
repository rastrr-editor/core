const webpack = require('webpack');
const path = require('path');

const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isDev = process.env.NODE_ENV !== 'production';
const isProd = !isDev;

const filename = (extension) =>
  isDev ? `[name].${extension}` : `[name].[hash].${extension}`;

const plugins = [
  new HTMLWebpackPlugin({
    template: path.resolve(__dirname, 'example', 'index.html'),
    minify: {
      collapseWhitespace: isProd,
    },
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: path.resolve(__dirname, 'example', 'style.css'),
        to: path.resolve(__dirname, 'example', 'build'),
      },
    ],
  }),
];

const optimization = {
  /** оптимизация загрузки модулей */
  splitChunks: {
    chunks: 'all',
  },
};

const babelOptions = (...additionalPresets) => {
  let options = {
    presets: ['@babel/preset-env'],
  };
  if (additionalPresets.length) {
    options.presets = options.presets.concat(additionalPresets);
  }
  return options;
};

const jsLoaders = () => {
  return [
    {
      loader: 'babel-loader',
      options: babelOptions(),
    },
  ];
};

/** настройка дев сервера */
const devServer = {
  // static: path.resolve(__dirname, 'example'),
  port: 4200,
  hot: isDev,
};

if (isDev) {
  plugins.push(new webpack.HotModuleReplacementPlugin());
}

module.exports = {
  mode: 'development',
  entry: {
    example: path.resolve(__dirname, 'example', 'index.ts'),
  },
  output: {
    filename: filename('js'),
    path: path.resolve(__dirname, 'example', 'build'),
    clean: true,
  },
  resolve: {
    /** импорт файлов с расширением по умолчанию */
    extensions: ['.js', '.ts', '.css', '.scss'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  devtool: isDev ? 'source-map' : '',
  optimization,
  devServer,
  plugins,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: jsLoaders(),
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: babelOptions('@babel/preset-typescript'),
        },
      },
    ],
  },
};
