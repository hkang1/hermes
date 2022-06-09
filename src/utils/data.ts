import {
  ActualAndFiniteRanges,
  Data,
  DimensionType,
  EDimensionType,
  NestedObject,
  Primitive,
  RandomNumberOptions,
  Range,
} from '../types';

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

export const clone = <T = unknown>(data: T): T => {
  return JSON.parse(JSON.stringify(data));
};

export const capDataRange = (data: number, range: Range): number => {
  return Math.min(range[1], Math.max(range[0], data));
};

export const comparePrimitive = (a: Primitive, b: Primitive): number => {
  if (isString(a) && isString(b)) return a.localeCompare(b);
  if (a === b) return 0;
  return a > b ? 1 : -1;
};

export const deepMerge = <T extends NestedObject>(...objects: T[]): T => {
  return objects.reduce((acc, object) => {
    Object.keys(object).forEach((key: keyof T) => {
      if (isObject(acc[key]) && isObject(object[key])) {
        acc[key] = deepMerge(acc[key] as T, object[key] as T) as T[keyof T];
      } else if (Array.isArray(acc[key]) && Array.isArray(object[key])) {
        acc[key] = object[key];
        /**
         * If we wanted to merge the arrays as well, we can use the following line,
         * maybe rewrite this function as a configurable function.
         * acc[key] = Array.from(new Set((acc[key] as unknown[]).concat(acc[key])));
         */
      } else {
        acc[key] = object[key];
      }
    });
    return acc;
  }, {} as T);
};

export const getDataRange = (
  data: unknown[],
  dimensionType: EDimensionType,
): ActualAndFiniteRanges => {
  const isFiniteOnScale = (x: number) =>
    dimensionType === DimensionType.Logarithmic ? isFinite(Math.log(x)) : isFinite(x);
  const { actual, finite } : ActualAndFiniteRanges = data
    .reduce(
      (acc: ActualAndFiniteRanges, x: unknown) => {
        if (isNumber(x)) {
          if (isFiniteOnScale(x)) {
            if (x < acc.finite[0]) acc.finite[0] = x;
            if (x > acc.finite[1]) acc.finite[1] = x;
          }
          if (x < acc.actual[0]) acc.actual[0] = x;
          if (x > acc.actual[1]) acc.actual[1] = x;
        }
        return acc;
      },
      { actual: [ Infinity, -Infinity ], finite: [ Number.MAX_VALUE, -Number.MAX_VALUE ] },
    );
  return { actual: actual.sort(), finite: finite.sort() };
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

export const randomLogNumber = (
  base: number,
  max: number,
  min: number,
  options: RandomNumberOptions = {},
): number => {
  const log = base === 10 ? Math.log10 : base === 2 ? Math.log2 : Math.log;
  const denominator = log === Math.log ? Math.log(base) : 1;
  const maxExp = log(max) / denominator;
  const minExp = log(min) / denominator;
  const exp = randomNumber(maxExp, minExp, options);
  if (isNaN(exp) || !isFinite(exp)) return exp;
  return base ** exp;
};

export const randomNumber = (
  max: number,
  min: number,
  options: RandomNumberOptions = {},
): number => {
  if (options.includeNaN != null) {
    const probabilityNan = capDataRange(options.includeNaN, [ 0, 1 ]);
    if (Math.random() < probabilityNan) return Number.NaN;
  }
  if (options.includeNegativeInfinity != null) {
    const probabilityNegativeInfinity = capDataRange(options.includeNegativeInfinity, [ 0, 1 ]);
    if (Math.random() < probabilityNegativeInfinity) return -Infinity;
  }
  if (options.includePositiveInfinity != null) {
    const probabilityPositiveInfinity = capDataRange(options.includePositiveInfinity, [ 0, 1 ]);
    if (Math.random() < probabilityPositiveInfinity) return Infinity;
  }
  return Math.random() * (max - min) + min;
};

export const removeInfinityNanSeries = (data: Data): { count: number, data: Data } => {
  const keys = Object.keys(data);
  const indicesToRemove: Record<number, boolean> = {};
  const filteredData: Data = {};
  let count = 0;

  // Find all the series indices to remove.
  for (const key of keys) {
    if (count === 0) count = data[key].length;
    for (const [ index, value ] of data[key].entries()) {
      if (!isNumber(value) || (!isNaN(value) && isFinite(value))) continue;
      indicesToRemove[index] = true;
    }
  }

  // Filter out all the series based on the remove indices.
  for (const key of keys) {
    filteredData[key] = data[key].filter((_, index) => !indicesToRemove[index]);
  }

  return {
    count: count - Object.keys(indicesToRemove).length,
    data: filteredData,
  };
};
