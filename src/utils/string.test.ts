import * as utils from './string';

describe('string utilities', () => {
  describe('readableNumber', () => {
    it('should make NaN readable', () => {
      expect(utils.readableNumber(Number.NaN)).toBe('NaN');
    });

    it('should make Infinity numbers readable', () => {
      expect(utils.readableNumber(Number.POSITIVE_INFINITY)).toBe('Infinity');
      expect(utils.readableNumber(Number.NEGATIVE_INFINITY)).toBe('-Infinity');
    });

    it('should make integers readable', () => {
      expect(utils.readableNumber(-100)).toBe('-100');
      expect(utils.readableNumber(0)).toBe('0');
      expect(utils.readableNumber(100)).toBe('100');
    });

    it('should make short floating point numbers readable', () => {
      expect(utils.readableNumber(-1.234)).toBe('-1.234000');
      expect(utils.readableNumber(1.2e12)).toBe('1.200000e+12');
      expect(utils.readableNumber(1.2e24)).toBe('1.200000e+24');
    });

    it('should limit large precision numbers to a default precision of 6', () => {
      expect(utils.readableNumber(Math.PI)).toBe('3.141593');
    });

    it('should make floating point numbers readable with certain precision', () => {
      expect(utils.readableNumber(-1.248)).toBe('-1.248000');
      expect(utils.readableNumber(-1.248, 5)).toBe('-1.24800');
      expect(utils.readableNumber(-1.248, 4)).toBe('-1.2480');
      expect(utils.readableNumber(-1.248, 3)).toBe('-1.248');
      expect(utils.readableNumber(-1.248, 2)).toBe('-1.25');
      expect(utils.readableNumber(-1.248, 1)).toBe('-1.2');
    });
  });

  describe('readableTick', () => {
    it('should remove the + plus sign after exponent sign', () => {
      expect(utils.readableTick(1.8e+5)).toBe('1.8e5');
      expect(utils.readableTick(2.345e+5)).toBe('2.345e5');
    });

    it('should remove excess trailing zeroes at the end of a decimal', () => {
      expect(utils.readableTick(0.75000000)).toBe('0.75');
      expect(utils.readableTick(0.05050000)).toBe('0.0505');
    });

    it('should remove excess trailing zeroes at the end of a scientific number', () => {
      expect(utils.readableTick(1.200000e-5)).toBe('1.2e-5');
      expect(utils.readableTick(1.000e5)).toBe('1e5');
      expect(utils.readableTick(1.0000e-24)).toBe('1e-24');
    });

    it('should remove excess trailing zeroes for large integers', () => {
      expect(utils.readableTick(100000)).toBe('1e5');
      expect(utils.readableTick(123456000000)).toBe('1.23456e11');
    });
  });

  describe('str2value', () => {
    it('should convert string to a primative', () => {
      expect(utils.str2value('true')).toBe(true);
      expect(utils.str2value('false')).toBe(false);
      expect(utils.str2value('NaN')).toBe(Number.NaN);
      expect(utils.str2value('Infinity')).toBe(Infinity);
      expect(utils.str2value('-Infinity')).toBe(-Infinity);
      expect(utils.str2value('hello world')).toBe('hello world');
      expect(utils.str2value('1.234')).toBe(1.234);
      expect(utils.str2value('123 hello')).toBe(123);
    });
  });

  describe('truncate', () => {
    const long = 'The quick brown fox jumps over the lazy dog';
    const short = 'fox';

    it('should truncate with default options', () => {
      expect(utils.truncate(long)).toBe('The quick brown fox jump...');
    });

    it('should leave short strings alone with default options', () => {
      expect(utils.truncate(short)).toBe(short);
      expect(utils.truncate('')).toBe('');
    });

    it('should truncate to a specific size', () => {
      expect(utils.truncate(long, { size: 20 })).toBe('The quick brown fox ...');
      expect(utils.truncate(long, { size: 10 })).toBe('The quick ...');
    });

    it('should trucate with custom suffix', () => {
      expect(utils.truncate(long, { suffix: '*' })).toBe('The quick brown fox jump*');
      expect(utils.truncate(long, { size: 4, suffix: '( ͡° ᴥ ͡°)' })).toBe('The ( ͡° ᴥ ͡°)');
    });
  });

  describe('value2str', () => {
    expect(utils.value2str(true)).toBe('true');
    expect(utils.value2str(false)).toBe('false');
    expect(utils.value2str(Number.NaN)).toBe('NaN');
    expect(utils.value2str(Number.POSITIVE_INFINITY)).toBe('Infinity');
    expect(utils.value2str(Number.NEGATIVE_INFINITY)).toBe('-Infinity');
    expect(utils.value2str('hello world')).toBe('hello world');
    expect(utils.value2str(1.234)).toBe('1.234');
    expect(utils.value2str(1e23)).toBe('1e+23');
  });
});
