const esbuild = require('esbuild');
const isWatch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const options = {
	logLevel: 'info',
	bundle: true,
	target: 'es2022',
	entryPoints: {Main: 'src/index.ts'},
	outdir: '../../../Public/HotspotContent',
	// Styles are compiled separately via the build:css script (Dart Sass).
	loader: {'.scss': 'empty'},
	minify: process.env.NODE_ENV === 'production'
};

if (isWatch) {
	esbuild.context(options).then((ctx) => ctx.watch());
} else {
	esbuild.build(options);
}
