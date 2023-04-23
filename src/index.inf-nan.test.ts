import * as utils from 'test/utils';

import * as t from './types';
import { Tester } from './utils/tester';

const testSetup = (tester: Tester, dataOptions?: t.RandomNumberOptions) => {
  const idempotentDimensions = tester.generateDimensions(10, false);
  const idempotentData = tester.generateData(idempotentDimensions, 50, false, dataOptions);
  return utils.hermesSetup(idempotentDimensions, undefined, idempotentData);
};

const testSetConfig = (
  setup: utils.HermesSetup,
  config: t.RecursivePartial<t.Config> = {},
  redraw = true,
) => {
  setup.hermes.setConfig(config, redraw);
  jest.runOnlyPendingTimers();
};

describe('Hermes Infinity and NaN', () => {
  const tester = utils.HermesTester.getTester();

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Infinity', () => {
    it('should render positive infinity axis', () => {
      const setup = testSetup(tester, { includePositiveInfinity: 0.5 });
      testSetConfig(setup);
      expect(setup.hermes.getCtx().__getDrawCalls()).toMatchSnapshot();
      utils.hermesTeardown(setup);
    });

    it('should render negative infinity axis', () => {
      const setup = testSetup(tester, { includeNegativeInfinity: 0.5 });
      testSetConfig(setup);
      expect(setup.hermes.getCtx().__getDrawCalls()).toMatchSnapshot();
      utils.hermesTeardown(setup);
    });
  });

  describe('NaN', () => {
    it('should render NaN axis', () => {
      const setup = testSetup(tester, { includeNaN: 0.5 });
      testSetConfig(setup);
      expect(setup.hermes.getCtx().__getDrawCalls()).toMatchSnapshot();
      utils.hermesTeardown(setup);
    });
  });

  describe('Infinity and NaN', () => {
    it('should render NaN axis', () => {
      const setup = testSetup(tester, {
        includeNaN: 0.5,
        includeNegativeInfinity: 0.5,
        includePositiveInfinity: 0.5,
      });
      testSetConfig(setup);
      expect(setup.hermes.getCtx().__getDrawCalls()).toMatchSnapshot();
      utils.hermesTeardown(setup);
    });
  });
});
