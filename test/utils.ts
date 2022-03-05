import Hermes from '../src';
import HermesError from '../src/classes/HermesError';
import * as t from '../src/types';
import * as tester from '../src/utils/tester';

export const CLOSE_PRECISION = 8;

const DEFAULT_DOM_RECT: DOMRect = {
  bottom: 0,
  height: 768,
  left: 0,
  right: 0,
  toJSON: jest.fn(),
  top: 0,
  width: 1024,
  x: 0,
  y: 0,
};

/**
 * Test Wrapper Classes and Related Functions
 */

export class HermesTester extends Hermes {
  public getData(): t.Data { return this.data; }
  public getDataCount(): number { return this.dataCount; }
  public overrideResizeObserver(element: HTMLElement): void {
    console.log('hello');
    this.resizeObserver = new ResizeObserver(() => {
      console.log('Resized!');
    });
    this.resizeObserver.observe(element);
  }
}

export const tryHermes = (
  dimensions: t.Dimension[],
  config: t.RecursivePartial<t.Config> = {},
  data: t.Data = {},
): void => {
  try {
    if (!hermesTest.element) throw new HermesError('Missing hermes chart element.');
    hermesTest.hermes = new HermesTester(hermesTest.element, dimensions, config, data);
  } catch (e) {
    hermesTest.error = e as HermesError;
  }
};

/**
 * Jest Helper Functions
 */

export const ELEMENT_ID = 'hermes';
export const DIMENSION_COUNT = 4;
export const DATA_COUNT = 50;

export const hermesSetup = (): void => {
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;

  beforeAll(() => {
    const element = document.createElement('div');
    element.id = ELEMENT_ID;
    element.style.width = '1024px';
    element.style.height = '768px';

    hermesTest.element = element;
    hermesTest.dimensions = tester.generateDimensions(DIMENSION_COUNT);
    hermesTest.data = tester.generateData(hermesTest.dimensions, DATA_COUNT);

    document.body.appendChild(element);

    Element.prototype.getBoundingClientRect = getBoundingClientRect();
  });

  afterAll(() => {
    if (hermesTest.element) {
      document.body.removeChild(hermesTest.element);
      hermesTest.element = undefined;
    }

    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  afterEach(() => {
    hermesTest.hermes?.destroy();
    hermesTest.hermes = undefined;
    hermesTest.error = undefined;
  });
};

/**
 * Helper Functions
 */

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

export const getBoundingClientRect = (defaultRect = DEFAULT_DOM_RECT) => (): DOMRect => defaultRect;
