import { Point } from '@/types';

/**
 * Get mouse position relative to an element position.
 */
export const getMousePoint = (e: MouseEvent, element: Element): Point => {
  const rect = element.getBoundingClientRect();
  return getMousePointWithRect(e, rect);
};

/**
 * Get mouse position relative to an element position in percent.
 */
export const getMousePointPercent = (e: MouseEvent, element: Element): Point => {
  const rect = element.getBoundingClientRect();
  const { x, y } = getMousePointWithRect(e, rect);
  return { x: x / rect.width, y: y / rect.height };
};

/**
 * Get mouse position relative to a DOM Rect.
 */
export const getMousePointWithRect = (e: MouseEvent, rect: DOMRect): Point => {
  const x = (e.clientX - rect.x) * devicePixelRatio;
  const y = (e.clientY - rect.y) * devicePixelRatio;
  return { x, y };
};
