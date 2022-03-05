import 'jest-extended';
import HermesError from 'src/classes/HermesError';

import { HermesTester } from './utils';

declare global {
  const hermesTest: {
    element?: HTMLElement,
    error?: HermesError,
    hermes?: HermesTester,
  };
}
