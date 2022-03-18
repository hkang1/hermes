import * as utils from './event';

describe('event utilities', () => {
  beforeAll(() => jest.useFakeTimers());

  afterAll(() => jest.useRealTimers());

  describe('debounce', () => {
    it('should create a debounced function', () => {
      const fn = jest.fn();
      const count = 1000;
      const delay = 100;
      const increment = 10;
      const debouncedFn = utils.debounce(fn, delay);

      for (let i = 0; i < count; i++) {
        debouncedFn();
        jest.advanceTimersByTime(increment);
      }

      // At this point `fn` should not have been called.
      expect(fn).not.toHaveBeenCalled();

      // Fast-forward until all timers have executed.
      jest.runAllTimers();

      // Check that the function has only been called once.
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    it('should create a throttled function', () => {
      const fn = jest.fn();
      const count = 1000;
      const delay = 100;
      const increment = 10;
      const throttledFn = utils.throttle(fn, delay);

      // At this point `fn` should not have been called.
      expect(fn).not.toHaveBeenCalled();

      for (let i = 0; i < count; i++) {
        throttledFn();
        jest.advanceTimersByTime(increment);
      }

      expect(fn).toHaveBeenCalledTimes(count / increment);
    });
  });
});
