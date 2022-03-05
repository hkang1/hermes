import 'jest-extended';
import HermesError from 'src/classes/HermesError';
import { Data, Dimension } from 'src/types';

import { HermesTester } from './utils';

declare global {
  const hermesTest: {
    config: Config,
    data: Data,
    dimensions: Dimension[],
    element?: HTMLElement,
    error?: HermesError,
    hermes?: HermesTester,
  };
}
