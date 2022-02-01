import NiceScale from '../classes/NiceScale';
import { FILTER } from '../defaults';
import * as t from '../types';

import { clone } from './data';

interface Layout {
  axisStart: t.Point;
  axisStop: t.Point;
  bound: t.Rect;
}

export const getAxisPositionValue = (
  cursor: t.Point,
  layout: Layout,
  direction: t.Direction,
  scale: NiceScale,
): t.Primitive => {
  const key = direction === t.Direction.Horizontal ? 'y' : 'x';
  const min = layout.bound[key] + layout.axisStart[key];
  const max = layout.bound[key] + layout.axisStop[key];
  const pos = Math.min(max, Math.max(min, cursor[key])) - min;
  return scale.posToValue(pos);
};

export const getDragBound = (index: number, drag: t.Drag, bound: t.Rect): t.Rect => {
  const isLabelDrag = drag.type === t.DragType.DimensionLabel && drag.shared.index === index;
  return isLabelDrag && drag.dimension.bound1 ? drag.dimension.bound1 : bound;
};

export const isFilterEmpty = (filter: t.Filter): boolean => {
  return isNaN(filter.p0) && isNaN(filter.p1);
};

export const isIntersectingFilters = (filter0: t.Filter, filter1: t.Filter): boolean => {
  return filter0.p0 <= filter1.p1 && filter1.p0 <= filter0.p1;
};

export const mergeFilters = (filter0: t.Filter, filter1: t.Filter): t.Filter => {
  const newFilter: t.Filter = clone(FILTER);
  if (filter0.p0 < filter1.p0) {
    newFilter.p0 = filter0.p0;
    newFilter.value0 = filter0.value0;
  } else {
    newFilter.p0 = filter1.p0;
    newFilter.value0 = filter1.value0;
  }
  if (filter0.p1 > filter1.p1) {
    newFilter.p1 = filter0.p1;
    newFilter.value1 = filter0.value1;
  } else {
    newFilter.p1 = filter1.p1;
    newFilter.value1 = filter1.value1;
  }
  return newFilter;
};
