import * as t from './types';
/**
 * Invalid defaults.
 */
export declare const INVALID_VALUE: number;
export declare const INVALID_POINT: {
    x: number;
    y: number;
};
export declare const INVALID_RECT: {
    h: number;
    w: number;
    x: number;
    y: number;
};
export declare const INVALID_ACTION: {
    dimIndex: number;
    p0: {
        x: number;
        y: number;
    };
    p1: {
        x: number;
        y: number;
    };
    type: t.ActionType;
};
/**
 * Style defaults.
 */
export declare const BEZIER_FACTOR = 0.3;
export declare const DIRECTION: CanvasDirection;
export declare const FILL_STYLE = "black";
export declare const FONT = "normal 12px san-serif";
export declare const LINE_CAP: CanvasLineCap;
export declare const LINE_DASH_OFFSET = 0;
export declare const LINE_JOIN: CanvasLineJoin;
export declare const LINE_WIDTH = 1;
export declare const MITER_LIMIT = 10;
export declare const STROKE_STYLE = "black";
export declare const TEXT_ALIGN = "left";
export declare const TEXT_BASELINE = "middle";
/**
 * Framework options defaults.
 */
export declare const HERMES_OPTIONS: t.HermesOptions;
export declare const FILTER: t.Filter;
export declare const IX: t.IX;
