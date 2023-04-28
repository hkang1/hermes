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

  it('should call `onDimensionMove` when dimensions get dragged', () => {
    const onDimensionMove = jest.fn();
    const config: t.RecursivePartial<t.Config> = { ...sharedConfig, hooks: { onDimensionMove } };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

    jest.runOnlyPendingTimers();
    expect(onDimensionMove).not.toHaveBeenCalled();

    // Move dimension from right to left.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 961, clientY: 38 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 577, clientY: 38 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 577, clientY: 38 });

    jest.runOnlyPendingTimers();
    expect(onDimensionMove).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'layer-split-factor' }),
      4,
      7,
    );

    // Move dimension from left to right.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 321, clientY: 38 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 577, clientY: 38 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 577, clientY: 38 });

    jest.runOnlyPendingTimers();
    expect(onDimensionMove).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'layer-dense-size' }),
      4,
      2,
    );

    utils.hermesTeardown(setup);
  });

  it('should throttle `onDimensionMove` when dimensions get dragged', () => {
    const onDimensionMove = jest.fn();
    const config: t.RecursivePartial<t.Config> = { hooks: { onDimensionMove } };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

    jest.runOnlyPendingTimers();
    expect(onDimensionMove).not.toHaveBeenCalled();

    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 961, clientY: 38 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 577, clientY: 38 });

    // Advance throttle timer for mouse move.
    jest.runOnlyPendingTimers();

    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 577, clientY: 38 });

    jest.runOnlyPendingTimers();
    expect(onDimensionMove).toHaveBeenCalled();

    utils.hermesTeardown(setup);
  });

  it('should not call `onDimensionMove` when non-draggable dimensions are dragged', () => {
    const onDimensionMove = jest.fn();
    const config: t.RecursivePartial<t.Config> = { ...sharedConfig, hooks: { onDimensionMove } };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

    jest.runOnlyPendingTimers();
    expect(onDimensionMove).not.toHaveBeenCalled();

    // Dragging a non-draggable dimension.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 1217, clientY: 38 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 577, clientY: 38 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 577, clientY: 38 });

    jest.runOnlyPendingTimers();
    expect(onDimensionMove).not.toHaveBeenCalled();

    // Dragging a draggable dimension over a non-draggable dimension.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 1089, clientY: 38 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 1217, clientY: 38 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 1217, clientY: 38 });

    jest.runOnlyPendingTimers();
    expect(onDimensionMove).not.toHaveBeenCalled();

    utils.hermesTeardown(setup);
  });

  it('should call `onFilterChange` after creating a filter', () => {
    const onFilterChange = jest.fn();
    const onFilterCreate = jest.fn();
    const config: t.RecursivePartial<t.Config> = {
      ...sharedConfig,
      hooks: { onFilterChange, onFilterCreate },
    };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

    jest.runOnlyPendingTimers();
    expect(onFilterChange).not.toHaveBeenCalled();
    expect(onFilterCreate).not.toHaveBeenCalled();

    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 123 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 246 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 246 });

    jest.runOnlyPendingTimers();
    expect(onFilterChange).toHaveBeenCalled();
    expect(onFilterCreate).toHaveBeenCalled();

    utils.hermesTeardown(setup);
  });

  it('should call `onFilterCreate` when clicking on an open axis', () => {
    const onFilterCreate = jest.fn();
    const config: t.RecursivePartial<t.Config> = { ...sharedConfig, hooks: { onFilterCreate } };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

    jest.runOnlyPendingTimers();
    expect(onFilterCreate).not.toHaveBeenCalled();

    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 123 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 246 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 246 });

    jest.runOnlyPendingTimers();
    expect(onFilterCreate).toHaveBeenCalled();

    utils.hermesTeardown(setup);
  });

  it('should call `onFilterMove` when dragging an existing filter', () => {
    const onFilterCreate = jest.fn();
    const onFilterMove = jest.fn();
    const config: t.RecursivePartial<t.Config> = {
      ...sharedConfig,
      hooks: { onFilterCreate, onFilterMove },
    };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

    jest.runOnlyPendingTimers();
    expect(onFilterCreate).not.toHaveBeenCalled();
    expect(onFilterMove).not.toHaveBeenCalled();

    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 123 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 246 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 246 });

    jest.runOnlyPendingTimers();
    expect(onFilterCreate).toHaveBeenCalled();

    // Attemp to move down out of axis bounds.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 200 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 1000 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 1000 });

    jest.runOnlyPendingTimers();
    expect(onFilterMove).toHaveBeenCalled();

    // Attemp to move up out of axis bounds.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 400 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: -100 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: -100 });

    jest.runOnlyPendingTimers();
    expect(onFilterMove).toHaveBeenCalled();

    utils.hermesTeardown(setup);
  });

  it('should call `onFilterRemove` when clicking on an existing filter', () => {
    const onFilterCreate = jest.fn();
    const onFilterRemove = jest.fn();
    const config: t.RecursivePartial<t.Config> = {
      ...sharedConfig,
      hooks: { onFilterCreate, onFilterRemove },
    };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

    jest.runOnlyPendingTimers();
    expect(onFilterCreate).not.toHaveBeenCalled();
    expect(onFilterRemove).not.toHaveBeenCalled();

    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 123 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 246 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 246 });

    jest.runOnlyPendingTimers();
    expect(onFilterCreate).toHaveBeenCalled();

    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 200 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 200 });

    jest.runOnlyPendingTimers();
    expect(onFilterRemove).toHaveBeenCalled();

    utils.hermesTeardown(setup);
  });

  it('should call `onFilterResize` when dragging an outer edge of an existing filter', () => {
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
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 123 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 246 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 246 });

    jest.runOnlyPendingTimers();
    expect(onFilterCreate).toHaveBeenCalled();

    // Drag the upper part of the filter.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 123 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 100 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 100 });

    jest.runOnlyPendingTimers();
    expect(onFilterResize).toHaveBeenCalled();

    // Drag the lower part of the filter.
    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 246 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 250 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 250 });

    jest.runOnlyPendingTimers();
    expect(onFilterResize).toHaveBeenCalled();

    utils.hermesTeardown(setup);
  });

  it('should call `onReset` when double clicking chart', () => {
    const onReset = jest.fn();
    const config: t.RecursivePartial<t.Config> = { ...sharedConfig, hooks: { onReset } };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

    jest.runOnlyPendingTimers();
    expect(onReset).not.toHaveBeenCalled();

    utils.dispatchMouseEvent('dblclick', setup.element);

    jest.runOnlyPendingTimers();
    expect(onReset).toHaveBeenCalled();

    utils.hermesTeardown(setup);
  });

  it('should call `onResize` when chart element resizes', () => {
    const onResize = jest.fn();
    const config: t.RecursivePartial<t.Config> = {
      hooks: { onResize },
      interactions: { throttleDelayResize: 0 },
    };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

    jest.runOnlyPendingTimers();
    expect(onResize).toHaveBeenCalled();

    utils.dispatchResizeEvent(setup.element);

    jest.runOnlyPendingTimers();
    expect(onResize).toHaveBeenCalledTimes(2);

    utils.hermesTeardown(setup);
  });
});
