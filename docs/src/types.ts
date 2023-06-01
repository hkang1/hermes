export type Point = { x: number, y: number };

export type RecordKey = string | number | symbol;

export type ValueOf<T> = T[keyof T];
