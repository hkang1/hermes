import { CLOSE_PRECISION } from 'test/utils';

import LogScale from './LogScale';

class TestScale extends LogScale {
  constructor(minValue: number, maxValue: number, logBase?: number, dataOnEdge?: boolean) {
    super(minValue, maxValue, logBase, dataOnEdge);
  }

  public getLogBase() {
    return this.logBase;
  }

  public testCalculate() {
    this.calculate();
  }
}

describe('LogScale class', () => {
  let scale: TestScale;

  describe('with dataOnEdge', () => {
    const AXIS_LENGTH = 200;
    const MIN_VALUE = 2;
    const MAX_VALUE = 64;
    const tests = [
      { percent: 0.0, position: 0, value: MIN_VALUE },
      { percent: 0.25, position: 50, value: 4.756828460010884 },
      { percent: 0.5, position: 100, value: 11.31370849898476 },
      { percent: 0.75, position: 150, value: 26.908685288118868 },
      { percent: 1.0, position: 200, value: MAX_VALUE },
    ];

    beforeAll(() => {
      scale = new TestScale(MIN_VALUE, MAX_VALUE, 2, true);
      scale.setAxisLength(AXIS_LENGTH);
    });

    it('should set log base', () => {
      scale.setLogBase(10);
      expect(scale.getLogBase()).toBe(10);
      scale.setLogBase(2);
      expect(scale.getLogBase()).toBe(2);
    });

    it('should convert percent to value', () => {
      tests.forEach(test => {
        expect(scale.percentToValue(test.percent)).toBeCloseTo(test.value, CLOSE_PRECISION);
      });
    });

    it('should convert value to percent', () => {
      tests.forEach(test => {
        expect(scale.valueToPercent(test.value)).toBeCloseTo(test.percent, CLOSE_PRECISION);
      });
    });

    it('should convert position to value', () => {
      tests.forEach(test => {
        expect(scale.posToValue(test.position)).toBeCloseTo(test.value, CLOSE_PRECISION);
      });
    });

    it('should convert value to position', () => {
      tests.forEach(test => {
        expect(scale.valueToPos(test.value)).toBeCloseTo(test.position, CLOSE_PRECISION);
      });
    });

    it('should calculate log values properly', () => {
      scale.testCalculate();
      expect(scale.min).toBe(2);
      expect(scale.max).toBe(64);
      expect(scale.range).toBe(62);
      expect(scale.tickLabels).toStrictEqual([ '*2', '4', '8', '16', '32', '*64' ]);
      expect(scale.tickPadding).toBe(0);
      expect(scale.tickPos).toStrictEqual([ 0, 40, 80, 120, 160, 200 ]);
      expect(scale.tickSpacing).toBe(1);
      expect(scale.ticks).toStrictEqual([ 2, 4, 8, 16, 32, 64 ]);
    });
  });

  describe('without dataOnEdge', () => {
    const AXIS_LENGTH = 200;
    const MIN_VALUE = 2;
    const MAX_VALUE = 64;
    const tests = [
      { percent: 0.0, position: 0, value: 1 },
      { percent: 0.25, position: 50, value: 3.1622776601683795 },
      { percent: 0.5, position: 100, value: 10 },
      { percent: 0.75, position: 150, value: 31.622776601683793 },
      { percent: 1.0, position: 200, value: 100 },
    ];

    beforeAll(() => {
      scale = new TestScale(MIN_VALUE, MAX_VALUE, 10, false);
      scale.setAxisLength(AXIS_LENGTH);
    });

    it('should convert percent to value', () => {
      tests.forEach(test => {
        expect(scale.percentToValue(test.percent)).toBeCloseTo(test.value, CLOSE_PRECISION);
      });
    });

    it('should convert value to percent', () => {
      tests.forEach(test => {
        expect(scale.valueToPercent(test.value)).toBeCloseTo(test.percent, CLOSE_PRECISION);
      });
    });

    it('should convert position to value', () => {
      tests.forEach(test => {
        expect(scale.posToValue(test.position)).toBeCloseTo(test.value, CLOSE_PRECISION);
      });
    });

    it('should convert value to position', () => {
      tests.forEach(test => {
        expect(scale.valueToPos(test.value)).toBeCloseTo(test.position, CLOSE_PRECISION);
      });
    });

    it('should calculate log values properly', () => {
      scale.testCalculate();
      expect(scale.min).toBe(2);
      expect(scale.max).toBe(64);
      expect(scale.range).toBe(99);
      expect(scale.tickLabels).toStrictEqual([ '1', '10', '100' ]);
      expect(scale.tickPadding).toBe(0);
      expect(scale.tickPos).toStrictEqual([ 0, 100, 200 ]);
      expect(scale.tickSpacing).toBe(1);
      expect(scale.ticks).toStrictEqual([ 1, 10, 100 ]);
    });
  });
});
