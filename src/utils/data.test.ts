import { DimensionType, NestedObject } from '../types';

import * as utils from './data';

enum Type {
  Boolean = 'boolean',
  Error = 'error',
  Map = 'map',
  Null = 'null',
  Number = 'number',
  Object = 'object',
  Set = 'set',
  String = 'string',
  Symbol = 'symbol',
  Undefined = 'undefined',
}

const RANDOM_TEST_COUNT = 20;

const mapPopulated = new Map();
mapPopulated.set('Caleb', true);
mapPopulated.set('Kimi', true);
mapPopulated.set('Kenzo', true);

const typeTests = [
  { type: Type.Boolean, value: false },
  { type: Type.Boolean, value: true },
  { type: Type.Error, value: new Error('this is an error') },
  { type: Type.Error, value: Error('this is another error') },
  { type: Type.Map, value: new Map() },
  { type: Type.Map, value: mapPopulated },
  { type: Type.Null, value: null },
  { type: Type.Number, value: 123 },
  { type: Type.Number, value: -8.21e9 },
  { type: Type.Number, value: Number.NEGATIVE_INFINITY },
  { type: Type.Number, value: Number.NaN },
  { type: Type.Object, value: { x: -1.5, y: 1.5, z: { a: null } } },
  { type: Type.Set, value: new Set() },
  { type: Type.Set, value: new Set([ 1, 'abc', true ]) },
  { type: Type.String, value: 'hello denver' },
  { type: Type.String, value: 'this is a multi-\nline string' },
  { type: Type.Symbol, value: Symbol() },
  { type: Type.Symbol, value: Symbol('foo') },
  { type: Type.Undefined, value: undefined },
];

const testType = (type: Type, fn: (data: unknown) => boolean) => {
  typeTests.forEach(test => {
    const expected = Array.isArray(test.type) ? test.type.includes(type) : test.type === type;
    expect(fn(test.value)).toStrictEqual(expected);
  });
};

describe('data utilities', () => {
  describe('isBoolean', () => {
    it('should detect booleans', () => testType(Type.Boolean, utils.isBoolean));
  });

  describe('isError', () => {
    it('should detect error types', () => testType(Type.Error, utils.isError));
  });

  describe('isNumber', () => {
    it('should detect numbers', () => testType(Type.Number, utils.isNumber));
  });

  describe('isMap', () => {
    it('should detect maps', () => testType(Type.Map, utils.isMap));
  });

  describe('isObject', () => {
    it('should detect objects', () => testType(Type.Object, utils.isObject));
  });

  describe('isSet', () => {
    it('should detect sets', () => testType(Type.Set, utils.isSet));
  });

  describe('isString', () => {
    it('should detect strings', () => testType(Type.String, utils.isString));
  });

  describe('isSymbol', () => {
    it('should detect symbols', () => testType(Type.Symbol, utils.isSymbol));
  });

  describe('clone', () => {
    it('should clone objects', () => {
      const original = { x: 1, y: 2e2, z: { a: 'a', b: true, c: null } };
      expect(utils.clone(original)).toStrictEqual(original);
    });

    it('should clone arrays', () => {
      const original = [ 1, 2e2, 'abc', true, null ];
      expect(utils.clone(original)).toStrictEqual(original);
    });
  });

  describe('capDataRange', () => {
    it('should cap the data within the provided range', () => {
      expect(utils.capDataRange(-Infinity, [ 0, 10 ])).toBe(0);
      expect(utils.capDataRange(-1, [ 0, 10 ])).toBe(0);
      expect(utils.capDataRange(11, [ 0, 10 ])).toBe(10);
      expect(utils.capDataRange(Infinity, [ 0, 10 ])).toBe(10);
      expect(utils.capDataRange(NaN, [ 0, 10 ])).toBe(NaN);
    });
  });

  describe('comparePrimitive', () => {
    it('should compare booleans', () => {
      expect(utils.comparePrimitive(false, true)).toBe(-1);
      expect(utils.comparePrimitive(true, false)).toBe(1);
      expect(utils.comparePrimitive(true, true)).toBe(0);
      expect(utils.comparePrimitive(false, false)).toBe(0);
    });

    it('should compare numbers', () => {
      expect(utils.comparePrimitive(-1, 1)).toBe(-1);
      expect(utils.comparePrimitive(1, -1)).toBe(1);
      expect(utils.comparePrimitive(-1, -1)).toBe(0);
      expect(utils.comparePrimitive(0, 0)).toBe(0);
      expect(utils.comparePrimitive(1, 1)).toBe(0);
    });

    it('should compare strings', () => {
      expect(utils.comparePrimitive('abc', 'abcd')).toBe(-1);
      expect(utils.comparePrimitive('Abc', 'abcd')).toBe(-1);
      expect(utils.comparePrimitive('bcd', 'abcd')).toBe(1);
      expect(utils.comparePrimitive('Bcd', 'bcd')).toBe(1);
      expect(utils.comparePrimitive('abc', 'abc')).toBe(0);
      expect(utils.comparePrimitive('', '')).toBe(0);
    });
  });

  describe('deepMerge', () => {
    it('should merge objects, including deep properties', () => {
      const a: NestedObject = {
        a: { a0: 123, a1: 'abc', a2: true, a3: Date.now(), a4: null, a5: undefined },
        b: { b0: 234, b1: 'def', b2: true, b3: Date.now(), b4: null, b5: undefined },
        c: { c0: 345 },
      };
      const b: NestedObject = {
        b: {
          b0: 345,
          b1: 'efg',
          b3: new Date('2018-03-16T00:00:00'),
        },
      };
      const c: NestedObject = { c: undefined };
      const result = utils.deepMerge(a, b, c);
      expect(result.a).toStrictEqual(a.a);
      expect(result.b).toStrictEqual({
        b0: 345,
        b1: 'efg',
        b2: true,
        b3: new Date('2018-03-16T00:00:00'),
        b4: null,
        b5: undefined,
      });
      expect(result.c).toBeUndefined();
    });

    it('should not merge arrays', () => {
      const a: NestedObject = {
        a: [ 1, 2, 3 ],
        b: [ 4, 5, 6 ],
        c: [ 7, 8, 9 ],
      };
      const b: NestedObject = { b: [ 10, 11, 12 ] };
      const c: NestedObject = { c: undefined };
      const result = utils.deepMerge(a, b, c);
      expect(result.a).toStrictEqual(a.a);
      expect(result.b).toStrictEqual(b.b);
      expect(result.c).toBeUndefined();
    });
  });

  describe('getDataRange', () => {
    const DATA = [ 1e2, -3.14, 0, -0.24, 2048 ];
    const DATA_WITH_INFINITY = [ ...DATA, -Infinity, Infinity ];
    const RESULT = [ -3.14, 2048 ];

    it('should return the min and max data range', () => {
      expect(utils.getDataRange(DATA)).toStrictEqual(RESULT);
    });

    it('should ignore -Infinity and Infinity for min/max data range', () => {
      expect(utils.getDataRange(DATA_WITH_INFINITY)).toStrictEqual(RESULT);
    });
  });

  describe('idempotentItem', () => {
    it('should return the same item from a list everytime given an index', () => {
      const list = [ 'abc', 'def', 'ghi', 'jkl', 'mno', 'pqr', 'stu', 'vw', 'xyz' ];

      expect(utils.idempotentItem(list, 0)).toBe('abc');
      expect(utils.idempotentItem(list, 0)).toBe('abc');
      expect(utils.idempotentItem(list, 8)).toBe('xyz');
      expect(utils.idempotentItem(list, 8)).toBe('xyz');
    });

    it('should wrap around the list if the index is greater than the list size', () => {
      const list = [ 'abc', 'def', 'ghi', 'jkl', 'mno', 'pqr', 'stu', 'vw', 'xyz' ];

      expect(utils.idempotentItem(list, list.length)).toBe('abc');
      expect(utils.idempotentItem(list, list.length)).toBe('abc');
      expect(utils.idempotentItem(list, 3 * list.length)).toBe('abc');
      expect(utils.idempotentItem(list, 3 * list.length)).toBe('abc');
    });
  });

  describe('idempotentLogNumber', () => {
    it('should return the same number given the same range, count and index', () => {
      const [ logBase, min, max, count ] = [ 2, 4, 16, 3 ];

      expect(utils.idempotentLogNumber(logBase, max, min, count, 0)).toBe(4);
      expect(utils.idempotentLogNumber(logBase, max, min, count, 0)).toBe(4);
      expect(utils.idempotentLogNumber(logBase, max, min, count, 1)).toBe(8);
      expect(utils.idempotentLogNumber(logBase, max, min, count, 1)).toBe(8);
      expect(utils.idempotentLogNumber(logBase, max, min, count, 2)).toBe(16);
      expect(utils.idempotentLogNumber(logBase, max, min, count, 2)).toBe(16);
    });

    it('should wrap around the range if the index is greater than count', () => {
      const [ logBase, min, max, count ] = [ 2, 4, 16, 3 ];

      expect(utils.idempotentLogNumber(logBase, max, min, count, count)).toBe(4);
      expect(utils.idempotentLogNumber(logBase, max, min, count, count)).toBe(4);
      expect(utils.idempotentLogNumber(logBase, max, min, count, 3 * count)).toBe(4);
      expect(utils.idempotentLogNumber(logBase, max, min, count, 3 * count)).toBe(4);
    });

    it('should return min and max even with invalid count', () => {
      const [ logBase, min, max, count ] = [ 2, 4, 16, 0 ];

      expect(utils.idempotentLogNumber(logBase, max, min, count, 0)).toBe(4);
      expect(utils.idempotentLogNumber(logBase, max, min, count, 0)).toBe(4);
      expect(utils.idempotentLogNumber(logBase, max, min, count, 1)).toBe(16);
      expect(utils.idempotentLogNumber(logBase, max, min, count, 1)).toBe(16);
      expect(utils.idempotentLogNumber(logBase, max, min, count, 2)).toBe(4);
      expect(utils.idempotentLogNumber(logBase, max, min, count, 2)).toBe(4);
    });
  });

  describe('idempotentNumber', () => {
    it('should return the same number given the same range, count and index', () => {
      const [ min, max, count ] = [ 50, 100, 3 ];

      expect(utils.idempotentNumber(max, min, count, 0)).toBe(50);
      expect(utils.idempotentNumber(max, min, count, 0)).toBe(50);
      expect(utils.idempotentNumber(max, min, count, 1)).toBe(75);
      expect(utils.idempotentNumber(max, min, count, 1)).toBe(75);
      expect(utils.idempotentNumber(max, min, count, 2)).toBe(100);
      expect(utils.idempotentNumber(max, min, count, 2)).toBe(100);
    });

    it('should wrap around the range if the index is greater than count', () => {
      const [ min, max, count ] = [ 50, 100, 3 ];

      expect(utils.idempotentNumber(max, min, count, count)).toBe(50);
      expect(utils.idempotentNumber(max, min, count, count)).toBe(50);
      expect(utils.idempotentNumber(max, min, count, 3 * count)).toBe(50);
      expect(utils.idempotentNumber(max, min, count, 3 * count)).toBe(50);
    });

    it('should return min and max even with invalid count', () => {
      const [ min, max, count ] = [ 50, 100, 0 ];

      expect(utils.idempotentNumber(max, min, count, 0)).toBe(50);
      expect(utils.idempotentNumber(max, min, count, 0)).toBe(50);
      expect(utils.idempotentNumber(max, min, count, 1)).toBe(100);
      expect(utils.idempotentNumber(max, min, count, 1)).toBe(100);
      expect(utils.idempotentNumber(max, min, count, 2)).toBe(50);
      expect(utils.idempotentNumber(max, min, count, 2)).toBe(50);
    });
  });

  describe('processData', () => {
    const a = utils.processData({
      accuracy: [ NaN, 0.97, 0.98, 0.99 ],
      globalBatchSize: [ 2, 4, 8, 16 ],
      learningRate: [ 0.1, 0.01, 0.001, Infinity ],
      loss: [ 0.4, Infinity, 0.2, 0.1 ],
    });
    const b = utils.processData({
      accuracy: [ 0.96, 0.97, 0.98, 0.99 ],
      learningRate: [ 0.1, 0.01, 0.001, -Infinity ],
      loss: [ 0.4, -Infinity, 0.2, 0.1 ],
    });
    const c = utils.processData({
      accuracy: [ 0.97, 0.98, 0.99 ],
      globalBatchSize: [ 2, 4, 6 ],
      learningRate: [ 0.1, 0.01, 0.001 ],
      loss: [ -0.4, -0.2, NaN ],
    });

    it('should detect number of data series', () => {
      expect(a.seriesCount).toEqual(4);
      expect(b.seriesCount).toEqual(4);
      expect(c.seriesCount).toEqual(3);
    });

    it('should detect positive and negative Infinity numbers', () => {
      expect(a.hasInfinity).toBeTrue();
      expect(b.hasInfinity).toBeTrue();
      expect(c.hasInfinity).toBeFalse();
    });

    it('should detect NaNs', () => {
      expect(a.hasNaN).toBeTrue();
      expect(b.hasNaN).toBeFalse();
      expect(c.hasNaN).toBeTrue();
    });
  });

  describe('randomInt', () => {
    const MIN = 20;
    const MAX = 100;

    it('should generate a random integer', () => {
      for (let i = 0; i < RANDOM_TEST_COUNT; i++) {
        const value = utils.randomInt(MAX);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(MAX);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('should generate a random integer within range', () => {
      for (let i = 0; i < RANDOM_TEST_COUNT; i++) {
        const value = utils.randomInt(MAX, MIN);
        expect(value).toBeGreaterThanOrEqual(MIN);
        expect(value).toBeLessThan(MAX);
        expect(Number.isInteger(value)).toBe(true);
      }
    });
  });

  describe('randomItem', () => {
    const list = [ 'abc', 'def', 'ghi', 'jkl', 'mno', 'pqr', 'stu', 'vw', 'xyz' ];

    it('should randomly select an item from the list', () => {
      for (let i = 0; i < RANDOM_TEST_COUNT; i++) {
        const value = utils.randomItem(list);
        expect(list.includes(value)).toBe(true);
      }
    });
  });

  describe('randomLogNumber', () => {
    const LOG_BASE = 2;
    const MIN = 2;
    const MAX = 64;

    it('should generate a random log number', () => {
      for (let i = 0; i < RANDOM_TEST_COUNT; i++) {
        const value = utils.randomLogNumber(LOG_BASE, MAX, MIN);
        expect(value).toBeGreaterThanOrEqual(MIN);
        expect(value).toBeLessThan(MAX);
      }
    });

    it('should generate NaN', () => {
      const value = utils.randomLogNumber(LOG_BASE, MAX, MIN, { includeNaN: 1.0 });
      expect(value).toBeNaN();
    });

    it('should generate negative Infinity', () => {
      const value = utils.randomLogNumber(LOG_BASE, MAX, MIN, { includeNegativeInfinity: 1.0 });
      expect(value).toBe(-Infinity);
    });

    it('should generate positive Infinity', () => {
      const value = utils.randomLogNumber(LOG_BASE, MAX, MIN, { includePositiveInfinity: 1.0 });
      expect(value).toBe(Infinity);
    });
  });

  describe('randomNumber', () => {
    const MIN = 0.2;
    const MAX = 1;

    it('should generate a random number', () => {
      for (let i = 0; i < RANDOM_TEST_COUNT; i++) {
        const value = utils.randomNumber(MAX, MIN);
        expect(value).toBeGreaterThanOrEqual(MIN);
        expect(value).toBeLessThan(MAX);
        expect(Number.isInteger(value)).toBe(false);
      }
    });

    it('should generate NaN', () => {
      const value = utils.randomNumber(MAX, MIN, { includeNaN: 1.0 });
      expect(value).toBeNaN();
    });

    it('should generate negative Infinity', () => {
      const value = utils.randomNumber(MAX, MIN, { includeNegativeInfinity: 1.0 });
      expect(value).toBe(-Infinity);
    });

    it('should generate positive Infinity', () => {
      const value = utils.randomNumber(MAX, MIN, { includePositiveInfinity: 1.0 });
      expect(value).toBe(Infinity);
    });
  });
});
