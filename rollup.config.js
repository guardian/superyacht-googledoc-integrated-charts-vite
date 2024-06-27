import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';

const plugins = [
  resolve({
    browser: true,
    preferBuiltins: false,
  }),
  commonjs(),
  terser() // Optional: Minify the output
];

export default [{
  input: 'charts/horizontalbar.mjs',
  output: {
    file: 'public/charts/horizontalbar.js',
    format: 'es',
    name: 'horizontalbar',
  },
  plugins
}, {
  input: 'charts/horizontalgroupedbar.mjs',
  output: {
    file: 'public/charts/horizontalgroupedbar.js',
    format: 'es',
    name: 'horizontalgroupedbar',
  },
  plugins
}, {
  input: 'charts/linechart.mjs',
  output: {
    file: 'public/charts/linechart.js',
    format: 'es',
    name: 'linechart',
  },
  plugins
}, {
  input: 'charts/lollipop.mjs',
  output: {
    file: 'public/charts/lollipop.js',
    format: 'es',
    name: 'lollipop',
  },
  plugins
}, {
  input: 'charts/rangechart.mjs',
  output: {
    file: 'public/charts/rangechart.js',
    format: 'es',
    name: 'rangechart',
  },
  plugins
}, {
  input: 'charts/scatterplot.mjs',
  output: {
    file: 'public/charts/scatterplot.js',
    format: 'es',
    name: 'scatterplot',
  },
  plugins
}, {
  input: 'charts/smallmultiples.mjs',
  output: {
    file: 'public/charts/smallmultiples.js',
    format: 'es',
    name: 'smallmultiples',
  },
  plugins
}, {
  input: 'charts/stackedarea.mjs',
  output: {
    file: 'public/charts/stackedarea.js',
    format: 'es',
    name: 'stackedarea',
  },
  plugins
}, {
  input: 'charts/table.mjs',
  output: {
    file: 'public/charts/table.js',
    format: 'es',
    name: 'table',
  },
  plugins
}, {
  input: 'charts/textable.mjs',
  output: {
    file: 'public/charts/textable.js',
    format: 'es',
    name: 'textable',
  },
  plugins
}, {
  input: 'charts/verticalbar.mjs',
  output: {
    file: 'public/charts/verticalbar.js',
    format: 'es',
    name: 'verticalbar',
  },
  plugins
}, {
  input: 'charts/bubble.mjs',
  output: {
    file: 'public/charts/bubble.js',
    format: 'es',
    name: 'bubble',
  },
  plugins
}, {
  input: 'preview/preview.mjs',
  output: {
    file: 'preview/preview.js',
    format: 'es',
    name: 'preview',
  },
  plugins
}, {
  input: 'charts/shared/wrangle.js',
  output: {
    file: 'public/charts/wrangle.js',
    format: 'es',
    name: 'wrangle',
  },
  plugins
}];
