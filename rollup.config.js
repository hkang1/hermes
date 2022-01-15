const fs = require('fs');

fs.copyFileSync('./tsc-out/index.d.ts', './dist/hermes.d.ts');

export default [
  {
    input: './tsc-out/index.js',
    output: [
      {
        name: 'Hermes',
        file: './dist/hermes.esm.js',
        format: 'es',
      },
      {
        name: 'Hermes',
        file: './dist/hermes.cjs.js',
        format: 'cjs',
        exports: 'auto',
      },
      {
        name: 'Hermes',
        file: './dist/hermes.iife.js',
        format: 'iife',
        esModule: false,
      },
    ]
  },
];
