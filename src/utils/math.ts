import { Point, Rect, Size } from '../types';

export const distance = (pointA: Point, pointB: Point): number => {
  return Math.sqrt((pointB.x - pointA.x) ** 2 + (pointB.y - pointA.y) ** 2);
};

export const deg2rad = (deg: number): number => deg * Math.PI / 180;

export const rad2deg = (rad: number): number => rad * 180 / Math.PI;

export const rotatePoint = (x: number, y: number, rad: number, px = 0, py = 0): Point => {
  const dx = (x - px);
  const dy = (y - py);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: cos * dx - sin * dy + px,
    y: sin * dx + cos * dy + py,
  };
};

export const rotateSize = (size: Size, deg: number): Size => {
  const rad = deg2rad(deg);
  const radInverse = Math.PI / 2 - rad;
  const w = Math.abs(size.h * Math.sin(radInverse)) + Math.abs(size.w * Math.sin(rad));
  const h = Math.abs(size.w * Math.sin(radInverse)) + Math.abs(size.h * Math.sin(rad));
  return { h, w };
};

export const dotProduct = (v0: Point, v1: Point): number => {
  return v0.x * v1.x + v0.y * v1.y;
};

/**
 * Barycentric Technique on determining if a point is within a triangle.
 * https://blackpawn.com/texts/pointinpoly/default.html
 */
export const isPointInTriangle = (p: Point, a: Point, b: Point, c: Point): boolean => {
  // Compute vectors.
  const v0 = { x: c.x - a.x, y: c.y - a.y };
  const v1 = { x: b.x - a.x, y: b.y - a.y };
  const v2 = { x: p.x - a.x, y: p.y - a.y };

  // Compute dot products.
  const dot00 = dotProduct(v0, v0);
  const dot01 = dotProduct(v0, v1);
  const dot02 = dotProduct(v0, v2);
  const dot11 = dotProduct(v1, v1);
  const dot12 = dotProduct(v1, v2);

  // Compute barycentric coordinates.
  const inverseDenominator = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * inverseDenominator;
  const v = (dot00 * dot12 - dot01 * dot02) * inverseDenominator;

  // Check if the point is in the triangle.
  return u >= 0 && v >= 0 && u + v < 1;
};

/**
 * Returns the percentage of intersection given two rectangles.
 * https://stackoverflow.com/a/9325084/5402432
 */
export const percentRectIntersection = (r0: Rect, r1: Rect): number => {
  const [ r0x0, r0x1, r0y0, r0y1 ] = [ r0.x, r0.x + r0.w, r0.y, r0.y + r0.h ];
  const [ r1x0, r1x1, r1y0, r1y1 ] = [ r1.x, r1.x + r1.w, r1.y, r1.y + r1.h ];
  const intersectionArea = Math.max(0, Math.min(r0x1, r1x1) - Math.max(r0x0, r1x0)) * Math.max(0, Math.min(r0y1, r1y1) - Math.max(r0y0, r1y0));
  const unionArea = (r0.w * r0.h) + (r1.w * r1.h) - intersectionArea;
  return intersectionArea / unionArea;
};

export const shiftRect = (rect: Rect, shift: Point): Rect => {
  return { h: rect.h, w: rect.w, x: rect.x + shift.x, y: rect.y + shift.y  };
};
