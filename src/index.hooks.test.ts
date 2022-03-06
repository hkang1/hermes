import getTextSize from 'test/mocks/getTextSize';
import * as utils from 'test/utils';

import * as t from './types';
import * as canvas from './utils/canvas';

const EVENT_OPTIONS = { bubbles: true, cancelable: true, view: window };

describe('Hermes Hooks', () => {
  const resizeEvent = new Event('resize', EVENT_OPTIONS);

  beforeAll(() => {
    jest.spyOn(canvas, 'getTextSize').mockImplementation(getTextSize);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should call `onDimensionMove` when dimensions get dragged', () => {
    const onDimensionMove = jest.fn();
    const config: t.RecursivePartial<t.Config> = { hooks: { onDimensionMove } };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

    expect(onDimensionMove).not.toHaveBeenCalled();

    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 953, clientY: 38 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 578, clientY: 38 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 578, clientY: 38 });

    expect(onDimensionMove).toHaveBeenCalled();

    utils.hermesTeardown(setup);
  });

  it('should call `onReset` when double clicking chart', () => {
    const onReset = jest.fn();
    const config: t.RecursivePartial<t.Config> = { hooks: { onReset } };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

    expect(onReset).not.toHaveBeenCalled();

    utils.dispatchMouseEvent('dblclick', setup.element);

    expect(onReset).toHaveBeenCalled();

    utils.hermesTeardown(setup);
  });

  it('should call `onResize` when chart element resizes', () => {
    const onResize = jest.fn();
    const config: t.RecursivePartial<t.Config> = { hooks: { onResize }, resizeThrottleDelay: 0 };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

    expect(onResize).toHaveBeenCalled();

    setup.element?.dispatchEvent(resizeEvent);

    expect(onResize).toHaveBeenCalledTimes(2);

    utils.hermesTeardown(setup);
  });
});
