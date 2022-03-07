import { Range } from '../types';

export const isBoolean = (data: unknown): data is boolean => typeof data === 'boolean';
export const isError = (data: unknown): data is Error => data instanceof Error;
export const isNumber = (data: unknown): data is number => typeof data === 'number';
export const isMap = (data: unknown): boolean => data instanceof Map;
export const isObject = (data: unknown): boolean => {
  return typeof data === 'object' && !Array.isArray(data)
    && !isMap(data) && !isSet(data) && data !== null;
};
export const isSet = (data: unknown): boolean => data instanceof Set;
export const isString = (data: unknown): data is string => typeof data === 'string';
export const isSymbol = (data: unknown): data is symbol => typeof data === 'symbol';

export const clone = <T = unknown>(data: T): T => {
  return JSON.parse(JSON.stringify(data));
};

export const capDataRange = (data: number, range: Range): number => {
  return Math.min(range[1], Math.max(range[0], data));
};

export const getDataRange = (data: unknown[]): Range => {
  return data.reduce((acc: Range, x) => {
    if (isNumber(x)) {
      if (x > acc[1]) acc[1] = x;
      if (x < acc[0]) acc[0] = x;
    }
    return acc;
  }, [ Infinity, -Infinity ]);
};

export const idempotentItem = <T = unknown>(list: T[], index: number): T => {
  return list[index % list.length];
};

export const idempotentLogNumber = (
  base: number,
  max: number,
  min: number,
  count: number,
  index: number,
): number => {
  const log = base === 10 ? Math.log10 : base === 2 ? Math.log2 : Math.log;
  const denominator = log === Math.log ? Math.log(base) : 1;
  const maxExp = log(max) / denominator;
  const minExp = log(min) / denominator;
  return base ** idempotentNumber(maxExp, minExp, count, index);
};

export const idempotentNumber = (
  max: number,
  min: number,
  count: number,
  index: number,
): number => {
  const adjustedCount = count > 1 ? count - 1 : 1;
  const inc = (max - min) / adjustedCount;
  return (index % (adjustedCount + 1)) * inc + min;
};

export const randomInt = (max: number, min = 0): number => {
  return Math.floor(Math.random() * (max - min)) + min;
};

export const randomItem = <T = unknown>(list: T[]): T => {
  return list[randomInt(list.length)];
};

export const randomLogNumber = (base: number, max: number, min: number): number => {
  const log = base === 10 ? Math.log10 : base === 2 ? Math.log2 : Math.log;
  const denominator = log === Math.log ? Math.log(base) : 1;
  const maxExp = log(max) / denominator;
  const minExp = log(min) / denominator;
  return base ** randomNumber(maxExp, minExp);
};

export const randomNumber = (max: number, min: number): number => {
  return Math.random() * (max - min) + min;
};
