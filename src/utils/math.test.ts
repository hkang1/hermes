import { Point } from '../types';

import * as utils from './math';
import { CLOSE_PRECISION } from './test';

const degrads = [
  { deg: 0, rad: 0 },
  { deg: 45, rad: Math.PI / 4 },
  { deg: 90, rad: Math.PI / 2 },
  { deg: 135, rad: Math.PI * 3 / 4 },
  { deg: 180, rad: Math.PI },
  { deg: 270, rad: Math.PI * 3 / 2 },
  { deg: 360, rad: 2 * Math.PI },
  { deg: -90, rad: -Math.PI / 2 },
  { deg: -180, rad: -Math.PI },
  { deg: -270, rad: -Math.PI * 3 / 2 },
];

describe('math utilities', () => {
  describe('distance', () => {
    it('should calculate distance from two points', () => {
      expect(utils.distance({ x: 0, y: 0 }, { x: 10, y: 10 })).toBe(14.142135623730951);
      expect(utils.distance({ x: 1, y: 5 }, { x: -5, y: -3 })).toBe(10);
    });
  });

  describe('deg2rad', () => {
    it('should convert degrees to radians', () => {
      degrads.forEach(degrad => {
        expect(utils.deg2rad(degrad.deg)).toBe(degrad.rad);
      });
    });
  });

  describe('rad2deg', () => {
    it('should convert radians to degrees', () => {
      degrads.forEach(degrad => {
        expect(utils.rad2deg(degrad.rad)).toBe(degrad.deg);
      });
    });
  });

  describe('rotatePoint', () => {
    it('should rotate cartesian point', () => {
      const tests: { inputs: [ number, number, number ], output: Point }[] = [
        { inputs: [ 2, 4, Math.PI / 4 ], output: { x: -1.4142135623730947, y: 4.242640687119286 } },
        { inputs: [ 1, 5, -Math.PI ], output: { x: -1, y: -5 } },
        { inputs: [ -300, 2048, -Math.PI * 5 ], output: { x: 300, y: -2048 } },
      ];
      tests.forEach(test => {
        const point = utils.rotatePoint.apply(null, test.inputs);
        expect(point.x).toBeCloseTo(test.output.x, CLOSE_PRECISION);
        expect(point.y).toBeCloseTo(test.output.y, CLOSE_PRECISION);
      });
    });
  });

  describe('rotateSize', () => {
    it('should return the new boundary after rotation', () => {
      const size = utils.rotateSize({ h: 50, w: 100 }, 45);
      expect(size.w).toBeCloseTo(106.0660171779821, CLOSE_PRECISION);
      expect(size.h).toBeCloseTo(106.0660171779821, CLOSE_PRECISION);
    });

    it('should return the new boundary after a reverse rotation', () => {
      const size = utils.rotateSize({ h: 10, w: 5 }, -30);
      expect(size.w).toBeCloseTo(11.160254037844387, CLOSE_PRECISION);
      expect(size.h).toBeCloseTo(9.330127018922193, CLOSE_PRECISION);
    });
  });

  describe('dotProduct', () => {
    it('should return the dot product of two points', () => {
      expect(utils.dotProduct({ x: 0, y: 0 }, { x: 10, y: 10 })).toBe(0);
      expect(utils.dotProduct({ x: -10, y: 10 }, { x: 10, y: -10 })).toBe(-200);
    });
  });

  describe('isPointInTriangle', () => {
    it('should detect points that are within the triangle', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 0, y: 100 };
      const c = { x: 100, y: 0 };
      const p0 = { x: 10, y: 10 };
      const p1 = { x: 10, y: 20 };
      const p2 = { x: 20, y: 10 };
      expect(utils.isPointInTriangle(p0, a, b, c)).toBe(true);
      expect(utils.isPointInTriangle(p1, a, b, c)).toBe(true);
      expect(utils.isPointInTriangle(p2, a, b, c)).toBe(true);
    });

    it('should detect points that are not within the triangle', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 0, y: 100 };
      const c = { x: 100, y: 0 };
      const p0 = { x: -10, y: -10 };
      const p1 = { x: 100, y: 100 };
      const p2 = { x: 51, y: 51 };
      expect(utils.isPointInTriangle(p0, a, b, c)).toBe(false);
      expect(utils.isPointInTriangle(p1, a, b, c)).toBe(false);
      expect(utils.isPointInTriangle(p2, a, b, c)).toBe(false);
    });
  });

  describe('percentRectIntersection', () => {
    it('should return a percentage for rectangles that intersect', () => {
      const rect0 = { h: 50, w: 100, x: 0, y: 0 };
      const rect1 = { h: 50, w: 100, x: 30, y: 0 };
      const rect2 = { h: 50, w: 100, x: 50, y: 0 };
      const rect3 = { h: 50, w: 100, x: 70, y: 0 };
      expect(utils.percentRectIntersection(rect0, rect1)).toBe(0.7);
      expect(utils.percentRectIntersection(rect0, rect2)).toBe(0.5);
      expect(utils.percentRectIntersection(rect0, rect3)).toBe(0.3);
    });

    it('should return 0 for non-intersecting rectangles', () => {
      const rect0 = { h: 50, w: 100, x: 0, y: 0 };
      const rect1 = { h: 50, w: 100, x: 200, y: 0 };
      expect(utils.percentRectIntersection(rect0, rect1)).toBe(0);
    });
  });

  describe('shiftRect', () => {
    it('should shift a rectangle by a given offset', () => {
      const rect = { h: 50, w: 100, x: 0, y: 0 };
      const offset0 = { x: 50, y: 50 };
      const offset1 = { x: -50, y: -50 };
      const offset2 = { x: -50, y: 50 };
      expect(utils.shiftRect(rect, offset0)).toStrictEqual({ ...rect, ...offset0 });
      expect(utils.shiftRect(rect, offset1)).toStrictEqual({ ...rect, ...offset1 });
      expect(utils.shiftRect(rect, offset2)).toStrictEqual({ ...rect, ...offset2 });
    });
  });
});
