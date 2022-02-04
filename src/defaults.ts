import * as t from './types';

/**
 * Invalid defaults.
 */
export const INVALID_VALUE = Number.NaN;
export const INVALID_POINT = { x: Number.NaN, y: Number.NaN };
export const INVALID_RECT = { h: Number.NaN, w: Number.NaN, x: Number.NaN, y: Number.NaN };

/**
 * Style defaults.
 */
export const BEZIER_FACTOR = 0.3;
export const DIRECTION: CanvasDirection = 'inherit';
export const FILL_STYLE = 'black';
export const FONT = 'normal 12px san-serif';
export const LINE_CAP: CanvasLineCap = 'butt';
export const LINE_DASH_OFFSET = 0.0;
export const LINE_JOIN: CanvasLineJoin = 'round';
export const LINE_WIDTH = 1.0;
export const MITER_LIMIT = 10.0;
export const STROKE_STYLE = 'black';
export const TEXT_ALIGN = 'left';
export const TEXT_BASELINE = 'middle';

/**
 * Framework options defaults.
 */
export const HERMES_OPTIONS: t.HermesOptions = {
  direction: t.Direction.Horizontal,
  style: {
    axes: {
      axis: {
        boundaryPadding: 15,
        lineWidth: 1,
        strokeStyle: 'rgba(147, 147, 147, 1.0)',
      },
      filter: {
        fillStyle: 'rgba(0, 0, 0, 1.0)',
        strokeStyle: 'rgba(255, 255, 255, 1.0)',
        width: 4,
      },
      label: {
        fillStyle: 'rgba(0, 0, 0, 1.0)',
        font: 'normal 11px sans-serif',
        lineWidth: 3,
        offset: 4,
        placement: t.LabelPlacement.Before,
        strokeStyle: 'rgba(255, 255, 255, 1.0)',
      },
      tick: {
        length: 4,
        lineWidth: 1,
        strokeStyle: 'rgba(147, 147, 147, 1.0)',
      },
    },
    data: {
      default: {
        lineWidth: 1,
        strokeStyle: 'rgba(82, 144, 244, 1.0)',
      },
      filtered: {
        lineWidth: 1,
        strokeStyle: 'rgba(82, 144, 244, 0.1)',
      },
      path: {
        options: {},
        type: t.PathType.Straight,
      },
    },
    dimension: {
      label: {
        angle: Math.PI / 4,
        boundaryPadding: 5,
        fillStyle: 'rgba(0, 0, 0, 1.0)',
        font: 'normal 11px sans-serif',
        lineWidth: 3,
        offset: 16,
        placement: t.LabelPlacement.Before,
        strokeStyle: 'rgba(255, 255, 255, 1.0)',
      },
      layout: t.DimensionLayout.AxisEvenlySpaced,
    },
    padding: [ 32, 16, 64, 16 ],
  },
};

export const FILTER: t.Filter = {
  p0: Number.NaN,
  p1: Number.NaN,
  value0: Number.NaN,
  value1: Number.NaN,
};

export const DRAG: t.Drag = {
  action: t.ActionType.None,
  dimension: {
    bound0: undefined,
    bound1: undefined,
    offset: { x: 0, y: 0 },
  },
  filters: {
    active: FILTER,
    key: undefined,
  },
  shared: {
    index: -1,
    p0: { x: Number.NaN, y: Number.NaN },
    p1: { x: Number.NaN, y: Number.NaN },
  },
};
