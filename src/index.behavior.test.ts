import getTextSize from 'test/mocks/getTextSize';
import * as utils from 'test/utils';

import * as t from './types';
import * as canvas from './utils/canvas';

describe('Hermes Hooks', () => {
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

  it('should merge overlapping filters into one', () => {
    const onFilterCreate = jest.fn();
    const onFilterResize = jest.fn();
    const config: t.RecursivePartial<t.Config> = {
      ...sharedConfig,
      hooks: { onFilterCreate, onFilterResize },
    };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

    jest.runOnlyPendingTimers();
    expect(onFilterCreate).not.toHaveBeenCalled();
    expect(onFilterResize).not.toHaveBeenCalled();

    // Create the 1st filter.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 100 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 150 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 150 });

    // Should be 1 filter.
    expect(setup.hermes.getFilters()['layer-free-decay'].length).toBe(1);

    // Create the 2nd filter.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 200 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 250 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 250 });

    // Should be 2 filters.
    expect(setup.hermes.getFilters()['layer-free-decay'].length).toBe(2);

    jest.runOnlyPendingTimers();
    expect(onFilterCreate).toHaveBeenCalledTimes(2);

    // Drag the bottom part of the 2nd filter to reverse.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 250 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 175 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 175 });

    jest.runOnlyPendingTimers();
    expect(onFilterResize).toHaveBeenCalled();

    // Drag the lower part of the 1st filter to overlap with 2nd filter.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 150 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 200 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 200 });

    // Expect the two overlapping filters to merge into one.
    expect(setup.hermes.getFilters()['layer-free-decay'].length).toBe(1);

    jest.runOnlyPendingTimers();
    expect(onFilterResize).toHaveBeenCalled();

    utils.hermesTeardown(setup);
  });

  it('should remove filters of size 0', () => {
    const onFilterCreate = jest.fn();
    const onFilterResize = jest.fn();
    const config: t.RecursivePartial<t.Config> = {
      ...sharedConfig,
      hooks: { onFilterCreate, onFilterResize },
    };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

    jest.runOnlyPendingTimers();
    expect(onFilterCreate).not.toHaveBeenCalled();
    expect(onFilterResize).not.toHaveBeenCalled();

    // Create the filter.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 100 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 150 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 150 });

    // Expect the two overlapping filters to merge into one.
    expect(setup.hermes.getFilters()['layer-free-decay'].length).toBe(1);

    // Resize the filter to be size of 0.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 150 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 100 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 100 });

    // Expect the two overlapping filters to merge into one.
    expect(setup.hermes.getFilters()['layer-free-decay'].length).toBe(0);

    jest.runOnlyPendingTimers();
    expect(onFilterResize).toHaveBeenCalled();

    utils.hermesTeardown(setup);
  });
});
