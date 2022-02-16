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
});
