import NiceScale from '../classes/NiceScale';
import * as t from '../types';

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
