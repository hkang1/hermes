type EventFn = (...args: unknown[]) => void;

export const debounce = (fn: (...args: unknown[]) => void, delay: number): EventFn => {
  let timer: NodeJS.Timer;
  return (...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const throttle = (fn: (...args: unknown[]) => void, delay: number): EventFn => {
  let timer: NodeJS.Timer | undefined;
  return (...args: unknown[]) => {
    if (timer == null) {
      timer = setTimeout(() => {
        fn(...args);
        timer = undefined;
      }, delay);
    }
  };
};
