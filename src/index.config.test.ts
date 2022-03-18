import * as utils from 'test/utils';

import * as t from './types';

describe('Hermes Config', () => {
  const tester = utils.HermesTester.getTester();
  const idempotentDimensions = tester.generateDimensions(10, false);
  const idempotentData = tester.generateData(idempotentDimensions, 50, false);

  describe('direction', () => {
    it('should render the chart vertically', () => {
      const config: t.RecursivePartial<t.Config> = { direction: t.Direction.Vertical };
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

    it('should render chart consistently in debug mode', () => {
      const config: t.RecursivePartial<t.Config> = { debug: true };
      const setup = utils.hermesSetup(idempotentDimensions, config, idempotentData);
      const ctx = setup.hermes?.getCtx();

      expect(ctx.__getDrawCalls()).toMatchSnapshot();

      utils.hermesTeardown(setup);
    });
  });

  describe('interactions', () => {
    it('should call `onResize` only once during a throttle period', () => {
      jest.useFakeTimers();

      const onResize = jest.fn();
      const config: t.RecursivePartial<t.Config> = {
        hooks: { onResize },
        interactions: { throttleDelayResize: 100 },
      };
      const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

      jest.runOnlyPendingTimers();

      expect(onResize).toHaveBeenCalled();

      new Array(100).fill(null).forEach(() => utils.dispatchResizeEvent(setup.element));

      jest.runOnlyPendingTimers();

      expect(onResize).toHaveBeenCalledTimes(2);

      utils.hermesTeardown(setup);

      jest.useRealTimers();
    });
  });

  describe('style', () => {
    describe('padding', () => {
      it('should render padding with 1 number', () => {
        const config: t.RecursivePartial<t.Config> = { style: { padding: 16 } };
        const setup = utils.hermesSetup(idempotentDimensions, config, idempotentData);
        const ctx = setup.hermes?.getCtx();

        expect(ctx.__getDrawCalls()).toMatchSnapshot();

        utils.hermesTeardown(setup);
      });

      it('should render padding with [ top/bottom, left/right ]', () => {
        const config: t.RecursivePartial<t.Config> = { style: { padding: [ 16, 8 ] } };
        const setup = utils.hermesSetup(idempotentDimensions, config, idempotentData);
        const ctx = setup.hermes?.getCtx();

        expect(ctx.__getDrawCalls()).toMatchSnapshot();

        utils.hermesTeardown(setup);
      });

      it('should render padding with [ top, bottom, left, right ]', () => {
        const config: t.RecursivePartial<t.Config> = { style: { padding: [ 4, 8, 16, 32 ] } };
        const setup = utils.hermesSetup(idempotentDimensions, config, idempotentData);
        const ctx = setup.hermes?.getCtx();

        expect(ctx.__getDrawCalls()).toMatchSnapshot();

        utils.hermesTeardown(setup);
      });
    });
  });
});
