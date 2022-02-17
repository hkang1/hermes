type ThrottledFn = (...args: unknown[]) => void;

export const throttle = (fn: (...args: unknown[]) => void, delay: number): ThrottledFn => {
  let timer: NodeJS.Timer;
  return (...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
