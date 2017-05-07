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
    'background/index':     './src/background.js',
    'browserAction/index':  './src/browserAction.js',
    'contentScript/index':  './src/contentScript.js'
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
            presets: ['es2015']
        }
        }
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([{ from: './static/images' }]),
    new CopyWebpackPlugin([{ from: './manifest' }])
  ]
};
