import resizeObserverEntry from 'test/mocks/resizeObserverEntry';

import HermesError from '../src/classes/HermesError';
import Hermes from '../src/index';
import * as t from '../src/types';
import * as tester from '../src/utils/tester';

export const CLOSE_PRECISION = 8;

export const ELEMENT_ID = 'hermes';
export const DIMENSION_COUNT = 10;
export const DATA_COUNT = 50;

export const DEFAULT_WIDTH = 1280;
export const DEFAULT_HEIGHT = 500;
export const DEFAULT_DIMENSIONS = tester.generateDimensions(DIMENSION_COUNT, false);
export const DEFAULT_DATA = tester.generateData(DEFAULT_DIMENSIONS, DATA_COUNT);

export const DEFAULT_MOUSE_INIT = { bubbles: true, cancelable: true, view: window };

/**
 * Test Wrapper Classes and Related Functions
 */

export interface HermesSetup {
  element?: HTMLElement;
  error?: HermesError;
  hermes?: HermesTester;
}

export class HermesTester extends Hermes {
  constructor(
    target: HTMLElement | string,
    dimensions: t.Dimension[],
    config: t.RecursivePartial<t.Config> = {},
    data: t.Data = {},
  ) {
    super(target, dimensions, config, data);

    /**
     * The ResizeObserver doesn't trigger properly in jsdom.
     * Instead we capture a resize event to fire off the handler.
     */
    this.element.addEventListener('resize', () => {
      this.handleResize([ resizeObserverEntry(this.element) ]);
    });
  }

  public getData(): t.Data { return this.data; }
  public getDataCount(): number { return this.dataCount; }
}

export const hermesSetup = (
  dimensions: t.Dimension[],
  config: t.RecursivePartial<t.Config> = {},
  data: t.Data = {},
): HermesSetup => {
  const setup: HermesSetup = { element: undefined, error: undefined, hermes: undefined };

  try {
    setup.element = document.createElement('div');
    setup.element.id = ELEMENT_ID;
    setup.element.style.width = `${DEFAULT_WIDTH}px`;
    setup.element.style.height = `${DEFAULT_HEIGHT}px`;
    document.body.appendChild(setup.element);

    if (!setup.element) throw new HermesError('Unable to create chart HTML element.');

    setup.hermes = new HermesTester(setup.element, dimensions, config, data);
  } catch (e) {
    setup.error = e as HermesError;
  }

  return setup;
};

export const hermesTeardown = (setup: HermesSetup): void => {
  setup.hermes?.destroy();

  if (setup.element && document.body.contains(setup.element)) {
    document.body.removeChild(setup.element);
  }
};

/**
 * Helper Functions
 */

export const dispatchMouseEvent = (
  type: 'dblclick' | 'mousedown' | 'mousemove' | 'mouseup',
  target?: HTMLElement,
  options?: MouseEventInit,
): void => {
  const event = new MouseEvent(type, { ...DEFAULT_MOUSE_INIT, ...(options || {}) });
  target?.dispatchEvent(event);
};

export const getContext = (): CanvasRenderingContext2D => {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 400;

  let ctx: CanvasRenderingContext2D | null = null;
  while (ctx === null) {
    ctx = canvas.getContext('2d');
  }

  return ctx;
};
