import { isString } from './data';

export const getElement = <T extends HTMLElement>(target: T | string): T | null => {
  if (!isString(target)) return target;
  return document.querySelector(target);
};
