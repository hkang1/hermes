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
});
