import { Primitive } from '../types';
import { CLOSE_PRECISION } from '../utils/test';

import CategoricalScale from './CategoricalScale';

class TestScale extends CategoricalScale {
  constructor(categories?: Primitive[], dataOnEdge?: boolean) {
    super(categories, dataOnEdge);
  }

  public testCalculate() {
    this.calculate();
  }
}

describe('CategoricalScale', () => {
  let scale: TestScale;

  describe ('with onDataEdge', () => {
    const CATEGORIES = [ 'abc', 'def', 'ghi', 'jkl', 'mno' ];
    const AXIS_LENGTH = 200;
    const tests = [
      { percent: 0.0, position: 0, value: 'abc' },
      { percent: 0.25, position: 50, value: 'def' },
      { percent: 0.5, position: 100, value: 'ghi' },
      { percent: 0.75, position: 150, value: 'jkl' },
      { percent: 1.0, position: 200, value: 'mno' },
    ];

    beforeAll(() => {
      scale = new TestScale(CATEGORIES, true);
      scale.setAxisLength(AXIS_LENGTH);
    });

    it('should convert percent to value', () => {
      tests.forEach(test => {
        expect(scale.percentToValue(test.percent)).toBe(test.value);
      });
    });

    it('should convert value to percent', () => {
      tests.forEach(test => {
        expect(scale.valueToPercent(test.value)).toBeCloseTo(test.percent, CLOSE_PRECISION);
      });
    });

    it('should convert position to value', () => {
      tests.forEach(test => {
        expect(scale.posToValue(test.position)).toBe(test.value);
      });
    });

    it('should convert value to position', () => {
      tests.forEach(test => {
        expect(scale.valueToPos(test.value)).toBeCloseTo(test.position, CLOSE_PRECISION);
      });
    });

    it('should calculate log values properly', () => {
      scale.testCalculate();
      expect(scale.min).toBe(0);
      expect(scale.max).toBe(0);
      expect(scale.range).toBe(0);
      expect(scale.tickLabels).toStrictEqual([ 'abc', 'def', 'ghi', 'jkl', 'mno' ]);
      expect(scale.tickPadding).toBe(0);
      expect(scale.tickPos).toStrictEqual([ 0, 50, 100, 150, 200 ]);
      expect(scale.tickSpacing).toBe(50);
      expect(scale.ticks).toStrictEqual([]);
    });
  });

  describe ('without onDataEdge', () => {
    const CATEGORIES = [ 'abc', 'def', 'ghi', 'jkl', 'mno' ];
    const AXIS_LENGTH = 200;
    const tests = [
      { percent: 0.1, position: 20, value: 'abc' },
      { percent: 0.3, position: 60, value: 'def' },
      { percent: 0.5, position: 100, value: 'ghi' },
      { percent: 0.7, position: 140, value: 'jkl' },
      { percent: 0.9, position: 180, value: 'mno' },
    ];

    beforeAll(() => {
      scale = new TestScale(CATEGORIES, false);
      scale.setAxisLength(AXIS_LENGTH);
    });

    it('should convert percent to value', () => {
      tests.forEach(test => {
        expect(scale.percentToValue(test.percent)).toBe(test.value);
      });
    });

    it('should convert value to percent', () => {
      tests.forEach(test => {
        expect(scale.valueToPercent(test.value)).toBeCloseTo(test.percent, CLOSE_PRECISION);
      });
    });

    it('should convert position to value', () => {
      tests.forEach(test => {
        expect(scale.posToValue(test.position)).toBe(test.value);
      });
    });

    it('should convert value to position', () => {
      tests.forEach(test => {
        expect(scale.valueToPos(test.value)).toBeCloseTo(test.position, CLOSE_PRECISION);
      });
    });

    it('should calculate log values properly', () => {
      scale.testCalculate();
      expect(scale.min).toBe(0);
      expect(scale.max).toBe(0);
      expect(scale.range).toBe(0);
      expect(scale.tickLabels).toStrictEqual([ 'abc', 'def', 'ghi', 'jkl', 'mno' ]);
      expect(scale.tickPadding).toBe(0);
      expect(scale.tickPos).toStrictEqual([ 20, 60, 100, 140, 180 ]);
      expect(scale.tickSpacing).toBe(40);
      expect(scale.ticks).toStrictEqual([]);
    });
  });
});
