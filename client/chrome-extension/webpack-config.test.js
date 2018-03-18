const baseConfig = require('./webpack.config.js');
const nodeExternals = require('webpack-node-externals');

module.exports = Object.assign(baseConfig, {
  target: 'node',
  externals: [nodeExternals()],
});
