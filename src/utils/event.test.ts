import * as utils from './event';

describe('event utilities', () => {
  describe('throttle', () => {
    beforeAll(() => jest.useFakeTimers());

    afterAll(() => jest.useRealTimers());

    it('should create a throttle function', () => {
      const fn = jest.fn();
      const count = 100;
      const interval = 1000;
      const delay = interval / count;
      const throttledFn = utils.throttle(fn, delay);
      for (let i = 0; i < count; i++) {
        throttledFn();
      }

      // At this point `fn` should not have been called.
      expect(fn).not.toHaveBeenCalled();

      // Fast-forward until all timers have executed.
      jest.runAllTimers();

      // Check that the function has only been called once.
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
