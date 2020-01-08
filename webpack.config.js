const webpack = require('webpack')
const path = require('path')
const EnvConfigPlugin = require('./src/index.js')

const resolve = (filePath) => path.resolve(__dirname, filePath)

const config = {
	mode: 'production',

	entry: './demo/index.js',

	output: {
		filename: 'dist.js',
		chunkFilename: 'dist.js',
		publicPath: '',
		path: resolve('../demo')
	},

	resolve: {
		extensions: ['.js'],
		modules: [
			resolve('../dev')
		]
	},

	module: {
		rules: []
	},

	optimization: {},

	plugins: [
		new EnvConfigPlugin({
			entry: resolve('./config.json'),
			output: resolve('./demo/config.json'),
			env: 'production'
		})
	]
}

webpack(config, (err, stats) => {
	if (err) throw err

	if (stats.hasErrors()) {
		console.error('Build failed with errors.')
		process.exit(1)
	}
})
