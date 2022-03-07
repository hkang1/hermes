import * as utils from 'test/utils';

import * as t from './types';

describe('Hermes Config', () => {
  describe('direction', () => {
    it('should render the chart vertically', () => {
      const config: t.RecursivePartial<t.Config> = { direction: t.Direction.Vertical };
      const tester = utils.HermesTester.getTester();
      const dimensions = tester.generateDimensions(3, false);
      const data = tester.generateData(dimensions, 10, false);
      const setup = utils.hermesSetup(dimensions, config, data);

      const ctx = setup.hermes?.getCtx();
      expect(ctx.__getDrawCalls()).toMatchSnapshot();

      utils.hermesTeardown(setup);
    });
  });

  describe('debug', () => {
    it('should draw debugging outlines', () => {
      const config: t.RecursivePartial<t.Config> = { debug: true };
      const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

      // Because the spy is setup after initializing, it will not catch the initial call.
      const spyDrawDebugOutline = jest.spyOn(setup.hermes, 'drawDebugOutline');
      expect(spyDrawDebugOutline).not.toHaveBeenCalled();

      // `redraw` should trigger drawing of the debug outlines.
      setup.hermes.redraw();
      expect(spyDrawDebugOutline).toHaveBeenCalled();

      // Clear out mock.
      spyDrawDebugOutline.mockClear();

      utils.hermesTeardown(setup);
    });
  });

  describe('resizeThrottleDelay', () => {
    it('should call `onResize` only once during a throttle period', () => {
      const onResize = jest.fn();
      const config: t.RecursivePartial<t.Config> = {
        hooks: { onResize },
        resizeThrottleDelay: 100,
      };
      const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

      expect(onResize).toHaveBeenCalled();

      new Array(100).fill(null).forEach(() => utils.dispatchResizeEvent(setup.element));

      expect(onResize).toHaveBeenCalledTimes(2);

      utils.hermesTeardown(setup);
    });
  });
});
