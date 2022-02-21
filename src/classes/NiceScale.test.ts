import { Primitive } from '../types';

import NiceScale, { MIN_TICK_DISTANCE } from './NiceScale';

const MIN_VALUE = 100;
const MAX_VALUE = 200;
const RESULTS = {
  percentToValue: 50,
  posToValue: 26,
  valueToPercent: 0.5,
  valueToPos: 762,
};

const mockAbstract = jest.fn();
const mockCalculate = jest.fn();

class NaughtyScale extends NiceScale {
  public testAbstractFunctions() {
    this.calculate();
  }

  public testSetAxisLength(length: number) {
    this.setAxisLength(length);
    return { axisLength: this.axisLength, maxTicks: this.maxTicks };
  }

  public testSetMinMaxValues(minValue: number, maxValue: number) {
    this.setMinMaxValues(minValue, maxValue);
    return { maxValue: this.maxValue, minValue: this.minValue };
  }

  public testNiceNum(range: number, round: boolean) {
    return this.niceNum(range, round);
  }

  public percentToValue(percent: number): Primitive {
    mockAbstract(percent);
    return RESULTS.percentToValue;
  }

  public posToValue(pos: number): Primitive {
    mockAbstract(pos);
    return RESULTS.posToValue;
  }

  public valueToPercent(value: number): number {
    mockAbstract(value);
    return RESULTS.valueToPercent;
  }

  public valueToPos(value: number): number {
    mockAbstract(value);
    return RESULTS.valueToPos;
  }

  protected calculate() {
    mockCalculate();
  }
}

describe('NiceScale class', () => {
  let scale: NaughtyScale;

  beforeAll(() => {
    scale = new NaughtyScale(MIN_VALUE, MAX_VALUE);
  });

  it('should initialize with constructor params', () => {
    expect(scale.min).toBe(MIN_VALUE);
    expect(scale.max).toBe(MAX_VALUE);
  });

  it('should handle 0 scale range', () => {
    const tests = [
      { input: 0.05, output: { max: 0.075, min: 0.025 } },
      { input: 0.5, output: { max: 0.75, min: 0.25 } },
      { input: 5, output: { max: 7.5, min: 2.5 } },
      { input: 50, output: { max: 75, min: 25 } },
      { input: 500, output: { max: 750, min: 250 } },
    ];
    tests.forEach(test => {
      const zeroScale = new NaughtyScale(test.input, test.input);
      expect(zeroScale.min).toBeCloseTo(test.output.min);
      expect(zeroScale.max).toBeCloseTo(test.output.max);
    });
  });

  it('should set axis length', () => {
    const { axisLength, maxTicks } = scale.testSetAxisLength(100);
    expect(axisLength).toBe(100);
    expect(maxTicks).toBe(100 / MIN_TICK_DISTANCE);
    expect(mockCalculate).toHaveBeenCalled();
  });

  it('should set min and max values', () => {
    const { maxValue, minValue } = scale.testSetMinMaxValues(500, 1000);
    expect(minValue).toBe(500);
    expect(maxValue).toBe(1000);
    expect(mockCalculate).toHaveBeenCalled();
  });

  it('should return nice numbers', () => {
    expect(scale.testNiceNum(1.5, true)).toBe(2);
    expect(scale.testNiceNum(1.5, false)).toBe(2);
    expect(scale.testNiceNum(108, true)).toBe(100);
    expect(scale.testNiceNum(108, false)).toBe(200);
    expect(scale.testNiceNum(256, true)).toBe(200);
    expect(scale.testNiceNum(256, false)).toBe(500);
    expect(scale.testNiceNum(512, true)).toBe(500);
    expect(scale.testNiceNum(512, false)).toBe(1000);
    expect(scale.testNiceNum(768, true)).toBe(1000);
    expect(scale.testNiceNum(768, false)).toBe(1000);
  });

  it('should have abstract percentToValue defined', () => {
    const value = scale.percentToValue(RESULTS.valueToPercent);
    expect(mockAbstract).toHaveBeenCalledWith(RESULTS.valueToPercent);
    expect(value).toBe(RESULTS.percentToValue);
  });

  it('should have abstract posToValue defined', () => {
    const value = scale.posToValue(RESULTS.valueToPos);
    expect(mockAbstract).toHaveBeenCalledWith(RESULTS.valueToPos);
    expect(value).toBe(RESULTS.posToValue);
  });

  it('should have abstract valueToPercent defined', () => {
    const value = scale.valueToPercent(RESULTS.percentToValue);
    expect(mockAbstract).toHaveBeenCalledWith(RESULTS.percentToValue);
    expect(value).toBe(RESULTS.valueToPercent);
  });

  it('should have abstract valueToPos defined', () => {
    const value = scale.valueToPos(RESULTS.posToValue);
    expect(mockAbstract).toHaveBeenCalledWith(RESULTS.posToValue);
    expect(value).toBe(RESULTS.valueToPos);
  });

  it('should have abstract calculate defined', () => {
    scale.testAbstractFunctions();
    expect(mockCalculate).toHaveBeenCalled();
  });
});
