const CLOSE_ENOUGH_THRESHOLD = 1e-11;

export const isCloseEnough = (n0: number, n1: number): boolean => {
  return Math.abs(n0 - n1) < CLOSE_ENOUGH_THRESHOLD;
};
