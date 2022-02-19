import { Point } from '../types';

import * as utils from './math';
import { isCloseEnough } from './test';

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
        expect(isCloseEnough(point.x, test.output.x)).toBe(true);
        expect(isCloseEnough(point.y, test.output.y)).toBe(true);
      });
    });
  });

  describe('dotProduct', () => {
    it('should return the dot product of two points', () => {
      expect(utils.dotProduct({ x: 0, y: 0 }, { x: 10, y: 10 })).toBe(0);
      expect(utils.dotProduct({ x: -10, y: 10 }, { x: 10, y: -10 })).toBe(-200);
    });
  });
});
