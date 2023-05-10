import getTextSize from 'test/mocks/getTextSize';
import * as utils from 'test/utils';

import * as t from './types';
import * as canvas from './utils/canvas';

describe('Hermes Behaviors', () => {
  let spyGetTextSize: jest.SpyInstance<t.Size, [
    ctx: CanvasRenderingContext2D,
    text: string,
    font?: string | undefined
  ]>;
  const sharedConfig: t.RecursivePartial<t.Config> = {
    interactions: {
      throttleDelayMouseMove: 0,
      throttleDelayResize: 0,
    },
  };

  beforeAll(() => {
    jest.useFakeTimers();
    spyGetTextSize = jest.spyOn(canvas, 'getTextSize').mockImplementation(getTextSize);
  });

  afterAll(() => {
    spyGetTextSize.mockClear();
    jest.useRealTimers();
  });

  it('should cap filter size to the dimension axis length', () => {
    const config: t.RecursivePartial<t.Config> = { ...sharedConfig };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA_INF_NAN);
    jest.runOnlyPendingTimers();

    // Create the filter.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 100 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 150 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 150 });
    jest.runOnlyPendingTimers();

    // Should be 1 filter.
    expect(setup.hermes.getFilters()['layer-free-decay'].length).toBe(1);

    // Drag the top part of filter to the very top.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 100 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: -100 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: -100 });
    jest.runOnlyPendingTimers();

    // Drag the lower part of filter to the very bottom.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 150 });
    utils.dispatchMouseEvent('mousemove', setup.element, {
      clientX: 449,
      clientY: utils.DEFAULT_HEIGHT,
    });
    utils.dispatchMouseEvent('mouseup', setup.element, {
      clientX: 449,
      clientY: utils.DEFAULT_HEIGHT,
    });
    jest.runOnlyPendingTimers();

    // Expect the filter to be full range from 0 to 1.
    expect(setup.hermes.getFilters()['layer-free-decay'][0].p0).toBe(0);
    expect(setup.hermes.getFilters()['layer-free-decay'][0].p1).toBe(1);

    utils.hermesTeardown(setup);
  });

  it('should merge overlapping filters into one', () => {
    const onFilterCreate = jest.fn();
    const onFilterResize = jest.fn();
    const config: t.RecursivePartial<t.Config> = {
      ...sharedConfig,
      hooks: { onFilterCreate, onFilterResize },
    };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA_INF_NAN);
    jest.runOnlyPendingTimers();

    expect(onFilterCreate).not.toHaveBeenCalled();
    expect(onFilterResize).not.toHaveBeenCalledTimes(1);

    // Create the 1st filter.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 100 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 150 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 150 });
    jest.runOnlyPendingTimers();

    // Should be 1 filter.
    expect(setup.hermes.getFilters()['layer-free-decay'].length).toBe(1);

    // Create the 2nd filter.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 200 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 250 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 250 });
    jest.runOnlyPendingTimers();

    // Should be 2 filters.
    expect(setup.hermes.getFilters()['layer-free-decay'].length).toBe(2);
    expect(onFilterCreate).toHaveBeenCalledTimes(2);

    // Drag the bottom part of the 2nd filter to reverse.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 250 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 175 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 175 });
    jest.runOnlyPendingTimers();

    expect(onFilterResize).toHaveBeenCalledTimes(1);

    // Drag the lower part of the 1st filter to overlap with 2nd filter.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 150 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 200 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 200 });
    jest.runOnlyPendingTimers();

    // Expect the two overlapping filters to merge into one.
    expect(onFilterResize).toHaveBeenCalledTimes(2);
    expect(setup.hermes.getFilters()['layer-free-decay'].length).toBe(1);

    utils.hermesTeardown(setup);
  });

  it('should remove filters of size 0', () => {
    const onFilterCreate = jest.fn();
    const onFilterResize = jest.fn();
    const config: t.RecursivePartial<t.Config> = {
      ...sharedConfig,
      direction: t.Direction.Vertical,
      hooks: { onFilterCreate, onFilterResize },
    };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA_INF_NAN);
    jest.runOnlyPendingTimers();

    expect(onFilterCreate).not.toHaveBeenCalled();
    expect(onFilterResize).not.toHaveBeenCalled();

    // Create the filter.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 200, clientY: 167 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 400, clientY: 167 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 400, clientY: 167 });
    jest.runOnlyPendingTimers();

    // Expect the two overlapping filters to merge into one.
    expect(setup.hermes.getFilters()['layer-free-decay'].length).toBe(1);

    // Resize the filter to be size of 0.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 400, clientY: 167 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 200, clientY: 167 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 200, clientY: 167 });
    jest.runOnlyPendingTimers();

    expect(onFilterResize).toHaveBeenCalled();

    // Expect the two overlapping filters to merge into one.
    expect(setup.hermes.getFilters()['layer-free-decay'].length).toBe(0);

    utils.hermesTeardown(setup);
  });
});
