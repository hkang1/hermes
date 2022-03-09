import { FILTER, INVALID_RECT } from '../defaults';
import * as t from '../types';

import { clone, comparePrimitive } from './data';
import { shiftRect } from './math';

export const DIMENSION_SWAP_THRESHOLD = 30;
export const FILTER_REMOVE_THRESHOLD = 1;
export const FILTER_RESIZE_THRESHOLD = 3;

export const getDragBound = (index: number, ix: t.IX, bound: t.Rect): t.Rect => {
  const action = ix.shared.action;
  const isLabelDrag = action.type === t.ActionType.LabelMove && action.dimIndex === index;
  const dragBound = ix.dimension.bound || INVALID_RECT;
  const offset = ix.dimension.boundOffset || { x: 0, y: 0 };
  return isLabelDrag ? shiftRect(dragBound, offset) : bound;
};

export const internalToFilter = (filter: t.InternalFilter): t.Filter => {
  return comparePrimitive(filter.value0, filter.value1) === 1
    ? [ filter.value1, filter.value0 ]
    : [ filter.value0, filter.value1 ];
};

export const internalToFilters = (filters: t.InternalFilters): t.Filters => {
  return Object.keys(filters).reduce((acc, key) => {
    acc[key] = filters[key]
      .map(filter => internalToFilter(filter))
      .sort((a: t.Filter, b: t.Filter) => comparePrimitive(a[0], b[0]));
    return acc;
  }, {} as t.Filters);
};

export const isFilterEmpty = (filter: t.InternalFilter): boolean => {
  return isNaN(filter.p0) && isNaN(filter.p1);
};

// TODO: possibly invalid logic
export const isFilterInvalid = (filter: t.InternalFilter): boolean => {
  return filter.p0 >= filter.p1;
};

export const isIntersectingFilters = (
  filter0: t.InternalFilter,
  filter1: t.InternalFilter,
): boolean => {
  return filter0.p0 <= filter1.p1 && filter1.p0 <= filter0.p1;
};

export const mergeFilters = (
  filter0: t.InternalFilter,
  filter1: t.InternalFilter,
): t.InternalFilter => {
  const newFilter: t.InternalFilter = clone(FILTER);
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
