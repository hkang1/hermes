import * as utils from './test';

describe('unit testing utilities', () => {
  describe('isCloseEnough', () => {
    it('should determine if two numbers are close enought for unit tests', () => {
      expect(utils.isCloseEnough(0.9999999999999, 1.0)).toBe(true);
      expect(utils.isCloseEnough(0.999999, 1.0)).toBe(false);
    });
  });
});
