var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

/**
 * Each entry is name:address
 * So the output will name each file the key and source it from the value
 *
 */
module.exports = {
  entry: {
    'background':                   './src/background.js',
    'contentScript':                './src/contentScript.js',
    'browserAction/browserAction':  './src/browserAction.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "[name].js"
  },
  resolve: {
    modules: [ "node_modules", __dirname + "/js" ]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
              presets: ['react', 'stage-3']
          }
        }
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([{ from: './src/images', to: 'images' }]),
    new CopyWebpackPlugin([{ from: './src/manifest.json' }]),
    new CopyWebpackPlugin([{ from: './src/browserAction', to: 'browserAction' }])
  ]
};
