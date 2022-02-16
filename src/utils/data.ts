import { Range } from '../types';

export const isBoolean = (data: unknown): data is boolean => typeof data === 'boolean';
export const isError = (data: unknown): data is Error => data instanceof Error;
export const isNumber = (data: unknown): data is number => typeof data === 'number';
export const isMap = (data: unknown): boolean => data instanceof Map;
export const isObject = (data: unknown): boolean => {
  return typeof data === 'object' && !Array.isArray(data) && !isSet(data) && data !== null;
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
