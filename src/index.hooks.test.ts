import { hermesSetup, tryHermes } from 'test/utils';

import * as t from './types';

const EVENT_INIT = { bubbles: true, cancelable: true, view: window };

describe.skip('Hermes Hooks', () => {
  let element: HTMLDivElement;
  let dimensions: t.Dimension[];
  let data: t.Data;
  const dblClickEvent = new MouseEvent('dblclick', EVENT_INIT);
  const resizeEvent = new Event('resize', EVENT_INIT);

  hermesSetup();

  describe('onReset', () => {
    it('should call `onReset` when double clicking chart', () => {
      const onReset = jest.fn();
      const config: t.RecursivePartial<t.Config> = { hooks: { onReset } };
      tryHermes(dimensions, config, data);

      expect(onReset).not.toHaveBeenCalled();

      element.dispatchEvent(dblClickEvent);
      expect(onReset).toHaveBeenCalled();
    });
  });

  describe('onResize', () => {
    it('should call `onResize` when chart element resizes', () => {
      const onResize = jest.fn();
      const config: t.RecursivePartial<t.Config> = { hooks: { onResize }, resizeThrottleDelay: 0 };
      tryHermes(dimensions, config, data);

      expect(onResize).toHaveBeenCalled();

      // hermes?.overrideResizeObserver(element);
      // TODO: ResizeObserver is not calling the resize handler via resize-observer-polyfill
      // element.dispatchEvent(resizeEvent);
      element.style.width = '100px';
      console.log(document.body.innerHTML);
      expect(onResize).toHaveBeenCalledTimes(2);
    });
  });
});
