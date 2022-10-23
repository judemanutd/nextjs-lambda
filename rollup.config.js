const pkg = require('./package.json')
const { defineConfig } = require('rollup')
const esbuild = require('esbuild')
const path = require('path')
const AdmZip = require('adm-zip')
const typescript = require('rollup-plugin-typescript2')
const json = require('@rollup/plugin-json')

const standalone = {
	name: 'standalone',
	resolveId(source, importer, options) {
		return source
	},
	transform(code, id) {
		const result = esbuild.buildSync({
			stdin: {
				contents: code,
				loader: 'ts',
				resolveDir: path.dirname(id),
			},
			external: ['sharp', 'next', 'aws-cdk', 'aws-sdk'],
			bundle: true,
			minify: true,
			write: false,
			outdir: 'out',
			platform: 'node',
			target: 'es2022',
		})

		result.errors.forEach((err) => {
			console.error(err.text)
		})
		result.warnings.forEach((err) => {
			console.warn(err.text)
		})

		return result.outputFiles[0].text
	},
	writeBundle(options, bundle) {
		console.log(options.file)
		const outputFileName = options.file

		if (!outputFileName.includes('.zip')) {
			return
		}

		const chunkCode = Object.values(bundle)[0].code

		const zip = new AdmZip()
		zip.addFile('index.js', chunkCode)
		zip.writeZip(outputFileName)
	},
}

module.exports = defineConfig([
	{
		input: 'lib/index.ts',
		plugins: [typescript({ useTsconfigDeclarationDir: true })],
		output: {
			format: 'esm',
			file: pkg.exports,
		},
	},
	{
		input: 'lib/cli.ts',
		plugins: [standalone],
		output: {
			format: 'esm',
			file: pkg.bin['next-utils'],
			banner: '#!/usr/bin/env node',
		},
	},
	{
		input: 'lib/standalone/server-handler.ts',
		plugins: [standalone],
		output: [
			{
				file: 'dist/server-handler.zip',
			},
			{
				file: 'dist/server-handler.js',
			},
		],
	},
	{
		input: 'lib/cdk-app.ts',
		plugins: [typescript({ useTsconfigDeclarationDir: true, tsconfig: './tsconfig.json' }), json()],
		output: {
			format: 'esm',
			file: 'dist/cdk-app.js',
		},
	},
	// @NOTE: Moved away = require(Rollup as Webpack is more efficient in bundling internal require.resolve calls.
	// Resulting in no need for layers and smaller bundle overall.
	// {
	// 	input: 'lib/standalone/image-handler.ts',
	// 	plugins: [standalone],
	// 	output: [
	// 		{
	// 			file: 'dist/image-handler.zip',
	// 		},
	// 		{
	// 			file: 'dist/image-handler.js',
	// 		},
	// 	],
	// },
])
