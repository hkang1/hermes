import { tryHermes } from 'test/utils';

import * as t from './types';
import * as tester from './utils/tester';

const ELEMENT_ID = 'chart';
const DIMENSION_COUNT = 4;
const DATA_COUNT = 50;
const EVENT_INIT = { bubbles: true, cancelable: true, view: window };

describe('Hermes Hooks', () => {
  let element: HTMLDivElement;
  let dimensions: t.Dimension[];
  let data: t.Data;
  const dblClickEvent = new MouseEvent('dblclick', EVENT_INIT);
  // const resizeEvent = new Event('resize', EVENT_INIT);

  beforeEach(() => {
    element = document.createElement('div');
    element.id = ELEMENT_ID;
    document.body.appendChild(element);

    dimensions = tester.generateDimensions(DIMENSION_COUNT);
    data = tester.generateData(dimensions, DATA_COUNT);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  describe('onReset', () => {
    it('should call `onReset` when double clicking chart', () => {
      const onReset = jest.fn();
      const config: t.RecursivePartial<t.Config> = { hooks: { onReset } };
      const { destroy } = tryHermes(element, dimensions, config, data);

      expect(onReset).not.toHaveBeenCalled();

      element.dispatchEvent(dblClickEvent);
      expect(onReset).toHaveBeenCalled();

      destroy();
    });
  });

  describe('onResize', () => {
    it('should call `onResize` when chart element resizes', () => {
      const onResize = jest.fn();
      const config: t.RecursivePartial<t.Config> = { hooks: { onResize }, resizeThrottleDelay: 0 };
      const { destroy } = tryHermes(element, dimensions, config, data);

      expect(onResize).toHaveBeenCalled();

      // TODO: ResizeObserver is not calling the resize handler via resize-observer-polyfill
      // document.dispatchEvent(resizeEvent);
      // expect(onResize).toHaveBeenCalledTimes(2);

      destroy();
    });
  });
});
