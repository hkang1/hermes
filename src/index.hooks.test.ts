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

  beforeAll(() => {
    spyGetTextSize = jest.spyOn(canvas, 'getTextSize').mockImplementation(getTextSize);
  });

  afterAll(() => {
    spyGetTextSize.mockClear();
  });

  it('should call `onDimensionMove` when dimensions get dragged', () => {
    const onDimensionMove = jest.fn();
    const config: t.RecursivePartial<t.Config> = { hooks: { onDimensionMove } };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

    expect(onDimensionMove).not.toHaveBeenCalled();

    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 961, clientY: 38 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 577, clientY: 38 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 577, clientY: 38 });

    expect(onDimensionMove).toHaveBeenCalled();

    utils.hermesTeardown(setup);
  });

  it('should call `onFilterChange` after creating a filter', () => {
    const onFilterChange = jest.fn();
    const onFilterCreate = jest.fn();
    const config: t.RecursivePartial<t.Config> = { hooks: { onFilterChange, onFilterCreate } };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

    expect(onFilterChange).not.toHaveBeenCalled();
    expect(onFilterCreate).not.toHaveBeenCalled();

    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 123 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 246 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 246 });

    expect(onFilterChange).toHaveBeenCalled();
    expect(onFilterCreate).toHaveBeenCalled();

    utils.hermesTeardown(setup);
  });

  it('should call `onFilterCreate` when clicking on an open axis', () => {
    const onFilterCreate = jest.fn();
    const config: t.RecursivePartial<t.Config> = { hooks: { onFilterCreate } };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

    expect(onFilterCreate).not.toHaveBeenCalled();

    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 123 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 246 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 246 });

    expect(onFilterCreate).toHaveBeenCalled();

    utils.hermesTeardown(setup);
  });

  it('should call `onFilterMove` when dragging an existing filter', () => {
    const onFilterCreate = jest.fn();
    const onFilterMove = jest.fn();
    const config: t.RecursivePartial<t.Config> = { hooks: { onFilterCreate, onFilterMove } };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

    expect(onFilterCreate).not.toHaveBeenCalled();
    expect(onFilterMove).not.toHaveBeenCalled();

    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 123 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 246 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 246 });

    expect(onFilterCreate).toHaveBeenCalled();

    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 200 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 250 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 250 });

    expect(onFilterMove).toHaveBeenCalled();

    utils.hermesTeardown(setup);
  });

  it('should call `onFilterRemove` when clicking on an existing filter', () => {
    const onFilterCreate = jest.fn();
    const onFilterRemove = jest.fn();
    const config: t.RecursivePartial<t.Config> = { hooks: { onFilterCreate, onFilterRemove } };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

    expect(onFilterCreate).not.toHaveBeenCalled();
    expect(onFilterRemove).not.toHaveBeenCalled();

    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 123 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 246 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 246 });

    expect(onFilterCreate).toHaveBeenCalled();

    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 200 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 200 });

    expect(onFilterRemove).toHaveBeenCalled();

    utils.hermesTeardown(setup);
  });

  it('should call `onFilterResize` when dragging an outer edge of an existing filter', () => {
    const onFilterCreate = jest.fn();
    const onFilterResize = jest.fn();
    const config: t.RecursivePartial<t.Config> = { hooks: { onFilterCreate, onFilterResize } };
    const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

    expect(onFilterCreate).not.toHaveBeenCalled();
    expect(onFilterResize).not.toHaveBeenCalled();

    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 123 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 246 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 246 });

    expect(onFilterCreate).toHaveBeenCalled();

    utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 449, clientY: 123 });
    utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 449, clientY: 100 });
    utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 449, clientY: 100 });

    expect(onFilterResize).toHaveBeenCalled();

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

    utils.dispatchResizeEvent(setup.element);

    expect(onResize).toHaveBeenCalledTimes(2);

    utils.hermesTeardown(setup);
  });
});
