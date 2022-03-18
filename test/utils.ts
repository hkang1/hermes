import resizeObserverEntry from 'test/mocks/resizeObserverEntry';

import HermesError from '../src/classes/HermesError';
import Hermes from '../src/index';
import * as t from '../src/types';
import { throttle } from '../src/utils/event';
import * as tester from '../src/utils/tester';

export const CLOSE_PRECISION = 8;

export const ELEMENT_ID = 'hermes';
export const DIMENSION_COUNT = 10;
export const DATA_COUNT = 50;

export const DEFAULT_WIDTH = 1280;
export const DEFAULT_HEIGHT = 500;
export const DEFAULT_DIMENSIONS = tester.generateDimensions(DIMENSION_COUNT, false);
export const DEFAULT_DATA = tester.generateData(DEFAULT_DIMENSIONS, DATA_COUNT);

export const DEFAULT_EVENT_INIT = { bubbles: true, cancelable: true, view: window };

/**
 * Test Interfaces and Types
 */

export type TestArg = t.Primitive | undefined;

export interface HermesSetup {
  element: HTMLElement;
  hermes: HermesTester;
}

export interface HermesSetupWithError {
  element?: HTMLElement;
  error?: HermesError;
  hermes?: HermesTester;
}

/**
 * Test Wrapper Classes and Related Functions
 */

export class HermesTester extends Hermes {
  constructor(
    target: HTMLElement | string,
    dimensions?: t.Dimension[],
    config?: t.RecursivePartial<t.Config>,
    data?: t.Data,
  ) {
    super(target, dimensions, config, data);

    /**
     * The ResizeObserver doesn't trigger properly in jsdom.
     * Instead we capture a resize event to fire off the handler.
     */
    const size = { h: DEFAULT_HEIGHT, w: DEFAULT_WIDTH };
    const resize = () => {
      this.handleResize([ resizeObserverEntry(this.element, size.w++, size.h++) ]);
    };
    this.element.addEventListener(
      'resize',
      this.config.interactions.throttleDelayResize === 0
        ? resize
        : throttle(() => resize(), this.config.interactions.throttleDelayResize),
    );

    // We fire a resize event to simulate the ResizeObserver.observe() behavior.
    if (config) dispatchResizeEvent(this.element);
  }

  public getCanvas(): HTMLCanvasElement { return this.canvas; }
  public getConfig(): t.Config { return this.config; }
  public getCtx(): CanvasRenderingContext2D { return this.ctx; }
  public getData(): t.Data { return this.data; }
  public getDataCount(): number { return this.dataCount; }
  public drawDebugOutline(): void { super.drawDebugOutline(); }
}

export const hermesSetup = (
  dimensions?: t.Dimension[],
  config?: t.RecursivePartial<t.Config>,
  data?: t.Data,
): HermesSetup => {
  const setup: HermesSetupWithError = {};

  setup.element = document.createElement('div');
  setup.element.id = ELEMENT_ID;
  setup.element.style.width = `${DEFAULT_WIDTH}px`;
  setup.element.style.height = `${DEFAULT_HEIGHT}px`;
  if (!setup.element) throw new HermesError('Unable to create chart HTML element.');

  document.body.appendChild(setup.element);

  setup.hermes = new HermesTester(setup.element, dimensions, config, data);
  if (!setup.hermes) {
    hermesTeardown(setup);
    throw new Error('Unable to initialize Hermes.');
  }

  return setup as HermesSetup;
};

export const hermesSetupWithError = (
  dimensions?: t.Dimension[],
  config?: t.RecursivePartial<t.Config>,
  data?: t.Data,
): HermesSetupWithError => {
  let setup: HermesSetupWithError = {};

  try {
    setup = hermesSetup(dimensions, config, data);
  } catch (e) {
    setup.error = e as HermesError;
  }

  return setup;
};

export const hermesTeardown = (setup: HermesSetupWithError): void => {
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
  const event = new MouseEvent(type, { ...DEFAULT_EVENT_INIT, ...(options || {}) });
  target?.dispatchEvent(event);
};

export const dispatchResizeEvent = (
  target?: HTMLElement,
  options?: EventInit,
): void => {
  const event = new Event('resize', { ...DEFAULT_EVENT_INIT, ...(options || {}) });
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

/**
 * Helper Functions for Generating Test Table
 */

export const addOptionsToTable = (table: TestArg[][], options: TestArg[]): TestArg[][] => {
  return table.length === 0
    ? options.map(option => ([ option ]))
    : options.reduce((acc, option) => {
      table.forEach(row => acc.push([ ...row, option ]));
      return acc;
    }, [] as TestArg[][]);
};

export const optionsToTable = (options: Record<t.RecordKey, TestArg[]>): TestArg[][] => {
  let table: TestArg[][] = [];
  Object.values(options).forEach(value => {
    table = addOptionsToTable(table, value);
  });
  return table;
};
