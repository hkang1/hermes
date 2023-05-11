import * as utils from 'test/utils';

import * as t from './types';

const testSetConfig = (
  setup: utils.HermesSetup,
  config: t.RecursivePartial<t.Config> = {},
  redraw = true,
) => {
  setup.hermes.setConfig(config, redraw);
  jest.runOnlyPendingTimers();
};

describe('Hermes Config', () => {
  const tester = utils.HermesTester.getTester();
  const idempotentDimensions = tester.generateDimensions(10, false);
  const idempotentData = tester.generateData(idempotentDimensions, 50, false, {
    includeNaN: 0.1,
    includeNegativeInfinity: 0.1,
    includePositiveInfinity: 0.1,
  });
  let setup: utils.HermesSetup;

  beforeEach(() => {
    jest.useFakeTimers();
    setup = utils.hermesSetup(idempotentDimensions, undefined, idempotentData);
  });

  afterEach(() => {
    utils.hermesTeardown(setup);
    jest.useRealTimers();
  });

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
      jest.runOnlyPendingTimers();
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

  describe('filters', () => {
    it('should draw chart with filters initialized from config', () => {
      const config: t.RecursivePartial<t.Config> = {
        filters: {
          'accuracy': [ [ 0.1, 0.3 ] ],
          'learning-rate': [ [ 0.4, 0.6 ], [ 0.8, 0.9 ] ],
        },
        interactions: { throttleDelayResize: 0 },
      };
      const setup = utils.hermesSetup(idempotentDimensions, config, idempotentData);
      const ctx = setup.hermes?.getCtx();

      expect(ctx.__getDrawCalls()).toMatchSnapshot();

      utils.hermesTeardown(setup);
    });
  });

  describe('interactions', () => {
    it('should call `onResize` only once during a throttle period', () => {
      const onResize = jest.fn();
      const resizeCount = 100;
      const config: t.RecursivePartial<t.Config> = {
        hooks: { onResize },
        interactions: { throttleDelayResize: 100 },
      };
      const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

      // Expect chart creation to call resize once.
      jest.runOnlyPendingTimers();
      expect(onResize).toHaveBeenCalled();

      // Expect a series of `resizeCount` calls get throttled down.
      new Array(resizeCount).fill(null).forEach(() => utils.dispatchResizeEvent(setup.element));
      jest.runOnlyPendingTimers();
      expect(onResize.mock.calls.length).toBeLessThan(resizeCount);

      utils.hermesTeardown(setup);
    });
  });

  describe('style', () => {
    describe('axes', () => {
      describe('label', () => {
        it('should render label after in horizontal layout', () => {
          testSetConfig(setup, {
            direction: t.Direction.Horizontal,
            style: { axes: { label: { placement: t.LabelPlacement.After } } },
          });
          expect(setup.hermes.getCtx().__getDrawCalls()).toMatchSnapshot();
        });

        it('should render label after in vertical layout', () => {
          testSetConfig(setup, {
            direction: t.Direction.Vertical,
            style: { axes: { label: { placement: t.LabelPlacement.After } } },
          });
          expect(setup.hermes.getCtx().__getDrawCalls()).toMatchSnapshot();
        });

        it('should render label at an angle in horizontal layout', () => {
          testSetConfig(setup, {
            direction: t.Direction.Horizontal,
            style: { axes: { label: { angle: Math.PI / 4 } } },
          });
          expect(setup.hermes.getCtx().__getDrawCalls()).toMatchSnapshot();
        });

        it('should render label at an angle in vertical layout', () => {
          testSetConfig(setup, {
            direction: t.Direction.Vertical,
            style: { axes: { label: { angle: Math.PI / 4 } } },
          });
          expect(setup.hermes.getCtx().__getDrawCalls()).toMatchSnapshot();
        });
      });
    });

    describe('data', () => {
      describe('colorScale', () => {
        it('should render color scale based on a dimension key', () => {
          testSetConfig(setup, {
            direction: t.Direction.Horizontal,
            style: {
              data: {
                targetColorScale: [ '#cc0000', '#cc9900', '#0000cc' ],
                targetDimensionKey: 'accuracy',
              },
            },
          });
          expect(setup.hermes.getCtx().__getDrawCalls()).toMatchSnapshot();
        });
      });

      describe('NaN, -Inf, and +Inf', () => {
        it('should render unique colors for NaN, -Inf, and +Inf', () => {
          testSetConfig(setup, {
            direction: t.Direction.Horizontal,
            style: {
              data: {
                overrideNaN: { lineWidth: 2, strokeStyle: 'rgba(255, 0, 0, 0.3)' },
                overrideNegativeInfinity: { lineWidth: 2, strokeStyle: 'rgba(0, 255, 0, 0.3)' },
                overridePositiveInfinity: { lineWidth: 2, strokeStyle: 'rgba(0, 0, 255, 0.3)' },
              },
            },
          });
          expect(setup.hermes.getCtx().__getDrawCalls()).toMatchSnapshot();
        });
      });
    });

    describe('dimension', () => {
      describe('label', () => {
        it('should render label after in horizontal layout', () => {
          testSetConfig(setup, {
            direction: t.Direction.Horizontal,
            style: { dimension: { label: { placement: t.LabelPlacement.After } } },
          });
          expect(setup.hermes.getCtx().__getDrawCalls()).toMatchSnapshot();
        });

        it('should render label after in vertical layout', () => {
          testSetConfig(setup, {
            direction: t.Direction.Vertical,
            style: { dimension: { label: { placement: t.LabelPlacement.After } } },
          });
          expect(setup.hermes.getCtx().__getDrawCalls()).toMatchSnapshot();
        });

        it('should render label at an angle in horizontal layout', () => {
          testSetConfig(setup, {
            direction: t.Direction.Horizontal,
            style: { dimension: { label: { angle: Math.PI / 4 } } },
          });
          expect(setup.hermes.getCtx().__getDrawCalls()).toMatchSnapshot();
        });

        it('should render label at an angle in vertical layout', () => {
          testSetConfig(setup, {
            direction: t.Direction.Vertical,
            style: { dimension: { label: { angle: Math.PI / 4 } } },
          });
          expect(setup.hermes.getCtx().__getDrawCalls()).toMatchSnapshot();
        });
      });

      describe('layout', () => {
        it('should render horizontal chart with dimension layout `axis-evenly-spaced`', () => {
          testSetConfig(setup, {
            direction: t.Direction.Horizontal,
            style: { dimension: { layout: t.DimensionLayout.AxisEvenlySpaced } },
          });
          expect(setup.hermes.getCtx().__getDrawCalls()).toMatchSnapshot();
        });

        it('should render horizontal chart with dimension layout `equidistant`', () => {
          testSetConfig(setup, {
            direction: t.Direction.Horizontal,
            style: { dimension: { layout: t.DimensionLayout.Equidistant } },
          });
          expect(setup.hermes.getCtx().__getDrawCalls()).toMatchSnapshot();
        });

        it('should render vertical chart with dimension layout `axis-evenly-spaced`', () => {
          testSetConfig(setup, {
            direction: t.Direction.Vertical,
            style: { dimension: { layout: t.DimensionLayout.AxisEvenlySpaced } },
          });
          expect(setup.hermes.getCtx().__getDrawCalls()).toMatchSnapshot();
        });

        it('should render vertical chart with dimension layout `equidistant`', () => {
          testSetConfig(setup, {
            direction: t.Direction.Vertical,
            style: { dimension: { layout: t.DimensionLayout.Equidistant } },
          });
          expect(setup.hermes.getCtx().__getDrawCalls()).toMatchSnapshot();
        });
      });
    });

    describe('padding', () => {
      it('should render padding with 1 number', () => {
        testSetConfig(setup, { style: { padding: 16 } });
        expect(setup.hermes.getCtx().__getDrawCalls()).toMatchSnapshot();
      });

      it('should render padding with [ top/bottom, left/right ]', () => {
        testSetConfig(setup, { style: { padding: [ 16, 8 ] } });
        expect(setup.hermes.getCtx().__getDrawCalls()).toMatchSnapshot();
      });

      it('should render padding with [ top, bottom, left, right ]', () => {
        testSetConfig(setup, { style: { padding: [ 4, 8, 16, 32 ] } });
        expect(setup.hermes.getCtx().__getDrawCalls()).toMatchSnapshot();
      });
    });
  });
});
