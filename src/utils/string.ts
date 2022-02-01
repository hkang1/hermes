import { Primitive } from '../types';

import { isString } from './data';

export const readableNumber = (num: number, precision = 6): string => {
  let readable: string = num.toString();

  if (isNaN(num)) {
    readable = 'NaN';
  } else if (!Number.isFinite(num)) {
    readable = `${num < 0 ? '-' : ''}Infinity`;
  } else if (!Number.isInteger(num)) {
    readable = num.toFixed(precision);

    const absoluteNum = Math.abs(num);
    if (absoluteNum < 0.01 || absoluteNum > 999) {
      readable = num.toExponential(precision);
    }
  }

  return readable;
};

export const readableTick = (num: number): string => {
  let readable = readableNumber(num);
  readable = readable.replace(/(\.[0-9]+?)0+(e-?\d+)?$/, '$1$2'); // e.g. 0.750000 => 0.75
  readable = readable.replace(/\.(e)/, '$1');                     // e.g. 2.e5 => 2e5
  return readable;
};

export const str2value = (str: string): Primitive => {
  if (str === 'true') return true;
  if (str === 'false') return false;

  const parsed = parseFloat(str);
  if (!isNaN(parsed)) return parsed;

  return str;
};

export const value2str = (value: Primitive): string => {
  return isString(value) ? value : value.toString();
};
