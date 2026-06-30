const esbuild = require('esbuild');
const { sassPlugin } = require('esbuild-sass-plugin');
const isWatch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const options = {
	logLevel: 'info',
	bundle: true,
	target: 'es2022',
	entryPoints: {Main: 'src/index.ts'},
	outdir: '../../../Public/HotspotContent',
	plugins: [sassPlugin({ silenceDeprecations: ['import'] })],
	minify: process.env.NODE_ENV === 'production'
};

if (isWatch) {
	esbuild.context({ ...options, sourcemap: true }).then((ctx) => ctx.watch());
} else {
	esbuild.build(options);
}
