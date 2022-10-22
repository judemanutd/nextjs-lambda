import path from 'path'
import ZipPlugin from 'zip-webpack-plugin'

const webpackConfig = {
	entry: './lib/standalone/image-handler.ts',
	target: 'node',
	output: {
		path: path.resolve('.webpack'),
		filename: 'handler.js',
		libraryTarget: 'commonjs',
		library: 'handler',
		libraryExport: 'handler',
	},
	resolve: {
		extensions: ['.ts', '.js', '.json'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: { loader: 'swc-loader' },
			},
		],
	},
	externals: {
		sharp: 'commonjs sharp',
	},
	plugins: [
		new ZipPlugin({
			path: path.resolve('dist'),
			filename: 'image-handler.zip',
		}),
	],
}

export default webpackConfig
