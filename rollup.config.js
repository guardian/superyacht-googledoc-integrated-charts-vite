// rollup.config.js
import terser from '@rollup/plugin-terser';

export default [{
	input: 'charts/horizontalbar.mjs',
	output: [
		{
			file: 'public/charts/horizontalbar.js',
			format: 'es',
			name: 'horizontalbar',
			plugins: [terser()]
		}
	]
},{
	input: 'charts/horizontalgroupedbar.mjs',
	output: [
		{
			file: 'public/charts/horizontalgroupedbar.js',
			format: 'es',
			name: 'horizontalgroupedbar',
			plugins: [terser()]
		}
	]
},{
	input: 'charts/linechart.mjs',
	output: [
		{
			file: 'public/charts/linechart.js',
			format: 'es',
			name: 'linechart',
			plugins: [terser()]
		}
	]
},{
	input: 'charts/lollipop.mjs',
	output: [
		{
			file: 'public/charts/lollipop.js',
			format: 'es',
			name: 'lollipop',
			plugins: [terser()]
		}
	]
},{
	input: 'charts/scatterplot.mjs',
	output: [
		{
			file: 'public/charts/scatterplot.js',
			format: 'es',
			name: 'scatterplot',
			plugins: [terser()]
		}
	]
},{
	input: 'charts/smallmultiples.mjs',
	output: [
		{
			file: 'public/charts/smallmultiples.js',
			format: 'es',
			name: 'smallmultiples',
			plugins: [terser()]
		}
	]
},{
	input: 'charts/stackedarea.mjs',
	output: [
		{
			file: 'public/charts/stackedarea.js',
			format: 'es',
			name: 'stackedarea',
			plugins: [terser()]
		}
	]
},{
	input: 'charts/table.mjs',
	output: [
		{
			file: 'public/charts/table.js',
			format: 'es',
			name: 'table',
			plugins: [terser()]
		}
	]
},{
	input: 'charts/textable.mjs',
	output: [
		{
			file: 'public/charts/textable.js',
			format: 'es',
			name: 'table',
			plugins: [terser()]
		}
	]
},{
	input: 'charts/verticalbar.mjs',
	output: [
		{
			file: 'public/charts/verticalbar.js',
			format: 'es',
			name: 'verticalbar',
			plugins: [terser()]
		}
	]
},{
	input: 'charts/bubble.mjs',
	output: [
		{
			file: 'public/charts/bubble.js',
			format: 'es',
			name: 'bubble',
			plugins: [terser()]
		}
	]
},{
	input: 'preview/preview.mjs',
	output: [
		{
			file: 'preview/preview.js',
			format: 'es',
			name: 'verticalbar',
			plugins: [terser()]
		}
	]
}]