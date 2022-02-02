const path = require('path');
const webpack = require('webpack');
const fs = require("fs");
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
	entry: ['./src/index.ts'],
	module: {
		rules: [
			{
				test: /\.[jt]sx?$/,
				use: 'babel-loader',
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.jsx', '.js']
	},
	output: {
		publicPath: '/dist/',
		filename: 'bot.js',
		path: path.resolve(__dirname, 'dist/')
	},
	devtool: false,
	target: "node12.18",
	plugins: [
		new webpack.BannerPlugin({
			banner: fs.readFileSync('./src/options.js').toString(),
			raw: true
		}),
		new ESLintPlugin({
			extensions: ['.tsx', '.ts', '.jsx', '.js']
		}),
		new webpack.NoEmitOnErrorsPlugin()
	],
	optimization: {
		emitOnErrors: false
	}
};
