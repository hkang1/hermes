export const isBoolean = (data: unknown): data is boolean => typeof data === 'boolean';
export const isError = (data: unknown): data is Error => data instanceof Error;
export const isNumber = (data: unknown): data is number => typeof data === 'number';
export const isMap = (data: unknown): boolean => data instanceof Map;
export const isObject = (data: unknown): boolean => {
  return typeof data === 'object' && data != null
    && Object.getPrototypeOf(data) === Object.prototype
    && !Array.isArray(data) && !isMap(data) && !isSet(data);
};
export const isSet = (data: unknown): boolean => data instanceof Set;
export const isString = (data: unknown): data is string => typeof data === 'string';
export const isSymbol = (data: unknown): data is symbol => typeof data === 'symbol';
