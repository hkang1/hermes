import { Direction, EDirection } from '../types';

import LinearScale from './LinearScale';

class TestScale extends LinearScale {
  constructor(
    direction: EDirection,
    minValue: number,
    maxValue: number,
    config: { dataOnEdge?: boolean, reverse?: boolean } = {},
  ) {
    super(direction, minValue, maxValue, config);
  }

  public testCalculate() {
    this.calculate();
  }
}

describe('LinearScale class', () => {
  let scale: TestScale;

  describe('with dataOnEdge', () => {
    const AXIS_LENGTH = 200;
    const MIN_VALUE = 32;
    const MAX_VALUE = 64;
    const tests = [
      { percent: 0.0, position: 0, value: MIN_VALUE },
      { percent: 0.25, position: 50, value: 40 },
      { percent: 0.5, position: 100, value: 48 },
      { percent: 0.75, position: 150, value: 56 },
      { percent: 1.0, position: 200, value: MAX_VALUE },
    ];

    beforeAll(() => {
      scale = new TestScale(Direction.Horizontal, MIN_VALUE, MAX_VALUE, { dataOnEdge: true });
      scale.setAxisLength(AXIS_LENGTH);
    });

    it('should convert percent to value', () => {
      tests.forEach(test => {
        expect(scale.percentToValue(test.percent)).toBe(test.value);
      });
    });

    it('should convert value to percent', () => {
      tests.forEach(test => {
        expect(scale.valueToPercent(test.value)).toBe(test.percent);
      });
    });

    it('should convert position to value', () => {
      tests.forEach(test => {
        expect(scale.posToValue(test.position)).toBe(test.value);
      });
    });

    it('should convert value to position', () => {
      tests.forEach(test => {
        expect(scale.valueToPos(test.value)).toBe(test.position);
      });
    });

    it('should calculate linear values properly', () => {
      scale.testCalculate();
      expect(scale.min).toBe(30);
      expect(scale.max).toBe(70);
      expect(scale.range).toBe(50);
      expect(scale.tickLabels).toStrictEqual([ '*32', '40', '50', '60', '*64' ]);
      expect(scale.tickPadding).toBe(0);
      expect(scale.tickPos).toStrictEqual([ 0, 50, 112.5, 175, 200 ]);
      expect(scale.tickSpacing).toBe(10);
      expect(scale.ticks).toStrictEqual([ 32, 40, 50, 60, 64 ]);
    });
  });

  describe('without dataOnEdge', () => {
    const AXIS_LENGTH = 200;
    const MIN_VALUE = 32;
    const MAX_VALUE = 64;
    const tests = [
      { percent: 0.0, position: 0, value: 30 },
      { percent: 0.25, position: 50, value: 40 },
      { percent: 0.5, position: 100, value: 50 },
      { percent: 0.75, position: 150, value: 60 },
      { percent: 1.0, position: 200, value: 70 },
    ];

    beforeAll(() => {
      scale = new TestScale(Direction.Horizontal, MIN_VALUE, MAX_VALUE, { dataOnEdge: false });
      scale.setAxisLength(AXIS_LENGTH);
    });

    it('should convert percent to value', () => {
      tests.forEach(test => {
        expect(scale.percentToValue(test.percent)).toBe(test.value);
      });
    });

    it('should convert value to percent', () => {
      tests.forEach(test => {
        expect(scale.valueToPercent(test.value)).toBe(test.percent);
      });
    });

    it('should convert position to value', () => {
      tests.forEach(test => {
        expect(scale.posToValue(test.position)).toBe(test.value);
      });
    });

    it('should convert value to position', () => {
      tests.forEach(test => {
        expect(scale.valueToPos(test.value)).toBe(test.position);
      });
    });

    it('should calculate linear values properly', () => {
      scale.testCalculate();
      expect(scale.min).toBe(30);
      expect(scale.max).toBe(70);
      expect(scale.range).toBe(50);
      expect(scale.tickLabels).toStrictEqual([ '30', '40', '50', '60', '70' ]);
      expect(scale.tickPadding).toBe(0);
      expect(scale.tickPos).toStrictEqual([ 0, 50, 100, 150, 200 ]);
      expect(scale.tickSpacing).toBe(10);
      expect(scale.ticks).toStrictEqual([ 30, 40, 50, 60, 70 ]);
    });
  });
});
