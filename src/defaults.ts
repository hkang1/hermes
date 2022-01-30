import * as t from './types';

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

export const INVALID_VALUE = Number.NaN;

export const HERMES_OPTIONS: t.HermesOptions = {
  direction: t.Direction.Horizontal,
  style: {
    axes: {
      axis: {
        fillStyle: 'black',
        lineWidth: 1,
      },
      axisBoundaryPadding: 10,
      label: {
        fillStyle: 'rgba(0, 0, 0, 1.0)',
        font: 'normal 11px sans-serif',
        lineWidth: 3,
        offset: 4,
        placement: t.LabelPlacement.Before,
        strokeStyle: 'rgba(255, 255, 255, 1.0)',
      },
      tick: {
        fillStyle: 'black',
        length: 4,
        lineWidth: 1,
      },
    },
    data: {
      lineWidth: 1,
      path: {
        options: {},
        type: t.PathType.Straight,
      },
      strokeStyle: 'rgba(82, 144, 244, 0.3)',
    },
    dimension: {
      label: {
        // angle: Math.PI / 4,
        fillStyle: 'rgba(0, 0, 0, 1.0)',
        font: 'normal 12px sans-serif',
        lineWidth: 3,
        offset: 10,
        placement: t.LabelPlacement.Before,
        strokeStyle: 'rgba(255, 255, 255, 1.0)',
      },
      labelBoundaryPadding: 5,
      layout: t.DimensionLayout.AxisEvenlySpaced,
    },
    padding: 50,
  },
};

export const DRAG = {
  bound0: undefined,
  bound1: undefined,
  index: -1,
  offset: { x: 0, y: 0 },
  p0: { x: Number.NaN, y: Number.NaN },
  p1: { x: Number.NaN, y: Number.NaN },
  type: t.DragType.None,
};
