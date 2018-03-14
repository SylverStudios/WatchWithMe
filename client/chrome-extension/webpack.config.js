const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');

const extractBrowserActionsCSS = new ExtractTextPlugin('[name].css');

/**
 * Each entry is name:address
 * So the output will name each file the key and source it from the value
 *
 */
module.exports = {
  entry: {
    'background':                   './src/background.js',
    'contentScript':                './src/contentScript.js',
    'browserAction/browserAction':  './src/browserAction/browserAction.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "[name].js"
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [ "node_modules", __dirname + "/js" ]
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
              presets: ['react', 'stage-3']
          }
        }
      },
      {
        test: /\.scss$/,
        exclude: /\.module\.scss$/,
        use: extractBrowserActionsCSS.extract({
          use: [
            { loader: 'css-loader', options: { minimize: false, sourceMap: true } },
            { loader: 'sass-loader', options: { sourceMap: true } },
          ],
        }),
      }
    ]
  },
  devtool: 'cheap-module-source-map',
  plugins: [
    new CopyWebpackPlugin([{ from: './src/images', to: 'images' }]),
    new CopyWebpackPlugin([{ from: './src/manifest.json' }]),
    extractBrowserActionsCSS,
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/browserAction/browserAction.html'),
      filename: path.resolve(__dirname, 'dist/browserAction/browserAction.html'),
      excludeAssets: [/background/, /contentScript/]
    }),
    new HtmlWebpackExcludeAssetsPlugin(),
  ]
};
