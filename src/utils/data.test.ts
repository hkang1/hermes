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
  { type: [ Type.Error, Type.Object ], value: new Error('this is an error') },
  { type: [ Type.Error, Type.Object ], value: Error('this is another error') },
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

  describe('getDataRange', () => {
    it('should get a range from a list of data', () => {
      const data = [ -123, 123, 0, 48 ];
      expect(utils.getDataRange(data)).toStrictEqual([ -123, 123 ]);
    });

    it('should ignore non-numbers when getting a range', () => {
      const data = [ null, undefined, -123, 123, 0, Infinity, NaN ];
      expect(utils.getDataRange(data)).toStrictEqual([ -123, Infinity ]);
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
  });
});
