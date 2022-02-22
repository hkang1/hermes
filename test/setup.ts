import 'jest-canvas-mock';
import ResizeObserverPolyfill from 'resize-observer-polyfill';

global.ResizeObserver = ResizeObserverPolyfill;
