import * as utils from './data';

describe('data utilities', () => {
  describe('isBoolean', () => {
    it('should detect booleans', () => {
      expect(utils.isBoolean(true)).toStrictEqual(true);
      expect(utils.isBoolean(false)).toStrictEqual(true);
    });

    it('should detect non-booleans', () => {
      expect(utils.isBoolean(123)).toStrictEqual(false);
      expect(utils.isBoolean('abc')).toStrictEqual(false);
      expect(utils.isBoolean({ x: 1, y: 2 })).toStrictEqual(false);
      expect(utils.isBoolean(null)).toStrictEqual(false);
      expect(utils.isBoolean(undefined)).toStrictEqual(false);
    });
  });
});
