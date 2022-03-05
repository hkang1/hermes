import { hermesSetup, tryHermes } from 'test/utils';

import * as t from './types';

const EVENT_INIT = { bubbles: true, cancelable: true, view: window };

describe('Hermes Hooks', () => {
  const dblClickEvent = new MouseEvent('dblclick', EVENT_INIT);
  const resizeEvent = new Event('resize', EVENT_INIT);

  hermesSetup();

  it('should call `onReset` when double clicking chart', () => {
    const onReset = jest.fn();
    const config: t.RecursivePartial<t.Config> = { hooks: { onReset } };
    tryHermes(hermesTest.dimensions, config, hermesTest.data);

    expect(onReset).not.toHaveBeenCalled();

    hermesTest.element?.dispatchEvent(dblClickEvent);
    expect(onReset).toHaveBeenCalled();
  });

  it('should call `onResize` when chart element resizes', done => {
    const onResize = jest.fn();
    const config: t.RecursivePartial<t.Config> = { hooks: { onResize }, resizeThrottleDelay: 0 };
    tryHermes(hermesTest.dimensions, config, hermesTest.data);

    expect(onResize).toHaveBeenCalled();

    // hermes?.overrideResizeObserver(element);
    // TODO: ResizeObserver is not calling the resize handler via resize-observer-polyfill
    // element.dispatchEvent(resizeEvent);
    if (hermesTest.element) hermesTest.element.style.width = '100px';

    setTimeout(() => {
      console.log(document.body.innerHTML);
      expect(onResize).toHaveBeenCalledTimes(2);
      done();
    }, 1000);
  });
});
