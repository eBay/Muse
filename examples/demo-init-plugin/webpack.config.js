const path = require('path');
const setupMuseDevServer = require('@ebay/muse-dev-utils/lib/setupMuseDevServer');

module.exports = {
  mode: process.env.NODE_ENV || 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build/dist'),
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  devServer: {
    // allowedHosts: ['.ebay.com'],
    setupMiddlewares: setupMuseDevServer,
    port: process.env.PORT || 8080,
  },
};
