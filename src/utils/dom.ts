import { Point } from '../types';

import { isString } from './data';

export const getElement = <T extends HTMLElement>(target: T | string): T | null => {
  if (!isString(target)) return target;
  return document.querySelector(target);
};

/*
 * Get mouse position relative to an element position.
 */
export const getMousePoint = (e: MouseEvent, element: Element): Point => {
  const rect = element.getBoundingClientRect();
  const x = (e.clientX - rect.x) * devicePixelRatio;
  const y = (e.clientY - rect.y) * devicePixelRatio;
  return { x, y };
};
