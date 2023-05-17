import { c, cblock } from '@/components/Code';

export default function GettingStarted() {
  return (
    <>
      <h1>Getting Started</h1>

      <h2>Installation</h2>

      <p>
        Let's start by installing the {c`hermes-parallel-coordinates`} library.
      </p>

      {cblock`npm install hermes-parallel-coordinates@latest`}

      <p>Next import {c`Hermes`} into your project.</p>

      {cblock`
// ES6 import
import Hermes from 'hermes-parallel-coordinates';

// CommonJS
var Hermes = require('hermes-parallel-coordinates');
      `}

      <h2>My First Hermes Chart</h2>
    </>
  );
}
