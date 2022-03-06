import 'jest-canvas-mock';
import ResizeObserverPolyfill from 'resize-observer-polyfill';

import getBoundingClientRect from 'test/mocks/getBoundingClientRect';

global.ResizeObserver = ResizeObserverPolyfill;

const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;

// Performed before every test suite.
beforeAll(() => {
  Element.prototype.getBoundingClientRect = getBoundingClientRect();
});

// Tear down after every test suite.
afterAll(() => {
  Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;

  /**
   * Performing `jest.resetAllMocks()` in between `describe()` and `it()` blocks
   * interferes with `jest-canvas-mock`, such that future `getContext()` calls
   * fails to return a context.
   * https://github.com/hustcc/jest-canvas-mock/issues/72#issuecomment-1021724961
   */
  jest.resetAllMocks();
});
