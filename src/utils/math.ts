import { Point, Size } from '../types';

export const distance = (pointA: Point, pointB: Point): number => {
  return Math.sqrt((pointB.x - pointA.x) ** 2 + (pointB.y - pointA.y) ** 2);
};

export const deg2rad = (deg: number): number => deg * Math.PI / 180;

export const rad2deg = (rad: number): number => rad * 180 / Math.PI;

export const rotateSize = (size: Size, deg: number): Size => {
  const rad = deg2rad(deg);
  const radInverse = Math.PI / 2 - rad;
  const w = Math.abs(size.h * Math.sin(radInverse)) + Math.abs(size.w * Math.sin(rad));
  const h = Math.abs(size.w * Math.sin(radInverse)) + Math.abs(size.h * Math.sin(rad));
  return { h, w };
};
