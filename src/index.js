/**
 * Generate configuration files based on env.
 * @author yangxi | 599321378@qq.com
 **/

const glob = require('glob')
const fs = require('fs-extra')

const logTag = '[@monajs/env-config-webpack-plugin]: '

// default env option
const defaultEnv = 'production'

// exec once
let once = false

class EnvConfigWebpackPlugin {
	constructor (options) {
		this.entry = options.entry
		if (!this.entry) throw new Error(`${logTag}The option \`entry\` is necessary.`)
		this.output = options.output
		if (!this.output) throw new Error(`${logTag}The option \`output\` is necessary.`)
		this.env = options.env || process.env.NODE_ENV || defaultEnv
	}

	// remove output files
	action (compilation, callback) {
		fs.remove(this.output, err => {
			if (err) throw err
			fs.stat(this.entry, (err, stat) => {
				if (err) throw err
				const res = stat.isDirectory() ? 2 : (stat.isFile() ? 1 : 0)
				if (res === 0) {
					throw new Error(`${logTag}Please check if the path（\`${this.entry}\`） exists`)
				}
				this.isEntryDir = res === 2
				this.fileHandler(compilation, callback)
			})
		})
	}

	// ensure output path exists
	// generate json for output path
	fileHandler (compilation, callback) {
		if (this.isEntryDir) {
			//dir
			fs.ensureDir(this.output, (err) => {
				if (err) throw err
				const list = glob.sync(`${this.entry}/*.json`, {
					matchBase: true
				})
				list.forEach((entry, index) => {
					const output = entry.replace(this.entry, this.output)
					this.generateJson(entry, output, (list.length - 1 === index) ? () => this.end(compilation, callback) : null)
				})
			})
		} else {
			//file
			fs.ensureFile(this.output, (err) => {
				if (err) throw err
				this.generateJson(this.entry, this.output, () => this.end(compilation, callback))
			})
		}
		console.info(`${logTag}Generate configuration files success!`)
	}

	// generate json files
	generateJson (entry, ouput, next) {
		fs.readJson(entry, (err, json) => {
			if (err) throw err
			const data = Object.assign({}, json['common'], json[this.env])
			fs.writeFile(ouput, JSON.stringify(data, null, '\t'), (err) => {
				if (err) throw err
				console.info(`${logTag} ${ouput}`)
				if (next) next()
			})
		})
	}

	end (compilation, callback) {
		once = true
		// callback && callback()
	}

	apply (compiler) {
		const plugin = { name: 'EnvConfigPlugin' }
		compiler.hooks.thisCompilation.tap(plugin, (compilation, callback) => {
			// exec once
			console.log(once)
			if (!once) {
				this.action(compilation, callback)
			} else {
				// callback && callback()
			}
		})
	}
}

module.exports = EnvConfigWebpackPlugin
