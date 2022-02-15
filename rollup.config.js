import fs from 'fs';

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

fs.copyFileSync('./tsc-out/index.d.ts', './dist/hermes.d.ts');
fs.copyFileSync('./tsc-out/types.d.ts', './dist/types.d.ts');
fs.copyFileSync('./tsc-out/defaults.d.ts', './dist/defaults.d.ts');

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
