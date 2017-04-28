var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: ['./js/app.js', './css/app.css'],
  output: {
	filename: 'js/wwm.bundle.js',
	path: path.resolve(__dirname, '../priv/static'),
	sourceMapFilename: "wwm.bundle.map",
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
		},
		{
		  test: /\.css$/,
		  loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' })
		}
	]
	},
	plugins: [
      new CopyWebpackPlugin([{ from: './static' }]),
 	  new ExtractTextPlugin("css/app.css"),
    ]
};
