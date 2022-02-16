import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default [
  {
    input: './tsc-out/index.js',
    output: [
      {
        file: './dist/hermes.esm.js',
        format: 'es',
        name: 'Hermes',
      },
      {
        exports: 'auto',
        file: './dist/hermes.cjs.js',
        format: 'cjs',
        name: 'Hermes',
      },
      {
        esModule: false,
        file: './dist/hermes.iife.js',
        format: 'iife',
        name: 'Hermes',
      },
    ],
    plugins: [ resolve(), commonjs() ],
  },
];
