import { DEFAULT_DATA, DEFAULT_DIMENSIONS, hermesSetup, hermesTeardown } from 'test/utils';

import * as t from './types';

const EVENT_INIT = { bubbles: true, cancelable: true, view: window };

describe('Hermes Hooks', () => {
  const dblClickEvent = new MouseEvent('dblclick', EVENT_INIT);
  const resizeEvent = new Event('resize', EVENT_INIT);

  it('should call `onDimensionMove` when dimensions get dragged', () => {
    const onDimensionMove = jest.fn();
    const config: t.RecursivePartial<t.Config> = { hooks: { onDimensionMove } };
    const setup = hermesSetup(DEFAULT_DIMENSIONS, config, DEFAULT_DATA);

    setup.element?.dispatchEvent(new MouseEvent('mousedown', {
      ...EVENT_INIT,
      clientX: 953,
      clientY: 38,
    }));
    setup.element?.dispatchEvent(new MouseEvent('mousemove', {
      ...EVENT_INIT,
      clientX: 578,
      clientY: 38,
    }));
    setup.element?.dispatchEvent(new MouseEvent('mouseup', {
      ...EVENT_INIT,
      clientX: 578,
      clientY: 38,
    }));
    expect(onDimensionMove).toHaveBeenCalled();

    hermesTeardown(setup);
  });

  it('should call `onReset` when double clicking chart', () => {
    const onReset = jest.fn();
    const config: t.RecursivePartial<t.Config> = { hooks: { onReset } };
    const setup = hermesSetup(DEFAULT_DIMENSIONS, config, DEFAULT_DATA);

    expect(onReset).not.toHaveBeenCalled();
    setup.element?.dispatchEvent(dblClickEvent);
    expect(onReset).toHaveBeenCalled();

    hermesTeardown(setup);
  });

  it('should call `onResize` when chart element resizes', () => {
    const onResize = jest.fn();
    const config: t.RecursivePartial<t.Config> = { hooks: { onResize }, resizeThrottleDelay: 0 };
    const setup = hermesSetup(DEFAULT_DIMENSIONS, config, DEFAULT_DATA);

    expect(onResize).toHaveBeenCalled();
    setup.element?.dispatchEvent(resizeEvent);
    expect(onResize).toHaveBeenCalledTimes(2);

    hermesTeardown(setup);
  });
});
