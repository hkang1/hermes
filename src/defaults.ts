import * as t from './types';

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

export const HERMES_OPTIONS: t.HermesOptions = {
  direction: t.Direction.Horizontal,
  style: {
    axes: {
      axis: {
        color: 'black',
        width: 1,
      },
      label: {
        color: 'black',
        font: { size: 11 },
        offset: 4,
        placement: t.LabelPlacement.Before,
      },
      tick: {
        color: 'black',
        length: 4,
        width: 1,
      },
    },
    dimension: {
      label: {
        angle: Math.PI / 4,
        color: 'black',
        font: { size: 14 },
        offset: 10,
        placement: t.LabelPlacement.Before,
      },
      layout: t.DimensionLayout.AxisEvenlySpaced,
    },
    padding: 25,
  },
};
