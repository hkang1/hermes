import type { DeepMergeLeafURI } from 'deepmerge-ts';
import { deepmergeCustom } from 'deepmerge-ts';

import CategoricalScale from './classes/CategoricalScale';
import HermesError from './classes/HermesError';
import LinearScale from './classes/LinearScale';
import LogScale from './classes/LogScale';
import NiceScale from './classes/NiceScale';
import * as DEFAULT from './defaults';
import * as t from './types';
import * as canvas from './utils/canvas';
import { scale2rgba } from './utils/color';
import { capDataRange, clone, getDataRange } from './utils/data';
import { getElement } from './utils/dom';
import * as ix from './utils/interaction';
import { distance, isPointInTriangle } from './utils/math';
import * as tester from './utils/tester';

const customDeepmerge = deepmergeCustom<{
  DeepMergeArraysURI: DeepMergeLeafURI; // <-- Needed for correct output type.
}>({ mergeArrays: false });

class Hermes {
  private element: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private resizeObserver: ResizeObserver;
  private data: t.HermesData;
  private dataCount: number;
  private dimensions: t.InternalDimension[];
  private dimensionsOriginal: t.Dimension[];
  private options: t.HermesOptions;
  private size: t.Size = { h: 0, w: 0 };
  private ix: t.IX = clone(DEFAULT.IX);
  private filters: t.Filters = {};
  private _?: t.Internal = undefined;

  constructor(
    target: HTMLElement | string,
    data: t.HermesData,
    dimensions: t.Dimension[],
    options: t.RecursivePartial<t.HermesOptions> = {},
  ) {
    const element = getElement(target);
    if (!element) throw new HermesError('Target element selector did not match anything.');
    this.element = element;

    // Create a canvas and append it to the target element.
    this.canvas = document.createElement('canvas');
    this.element.appendChild(this.canvas);

    // Setup initial canvas size.
    const rect = this.element.getBoundingClientRect();
    this.setSize(rect.width, rect.height);

    // Get canvas context.
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new HermesError('Unable to get context from target element.');
    this.ctx = ctx;

    // Must have at least one dimension data available.
    if (Object.keys(data).length === 0)
      throw new HermesError('Need at least one dimension data record.');

    // All the dimension data should be equal in size.
    this.dataCount = 0;
    Object.values(data).forEach((dimData, i) => {
      if (i === 0) {
        this.dataCount = dimData.length;
      } else if (this.dataCount !== dimData.length) {
        throw new HermesError('The dimension data are not all identical in size.');
      }
    });
    this.data = data;

    if (dimensions.length === 0) throw new HermesError('Need at least one dimension defined.');
    this.dimensionsOriginal = clone(dimensions);
    this.dimensions = this.setDimensions(dimensions);
    this.options = customDeepmerge(DEFAULT.HERMES_OPTIONS, options) as t.HermesOptions;

    // Add resize observer to detect target element resizing.
    this.resizeObserver = new ResizeObserver(this.handleResize.bind(this));
    this.resizeObserver.observe(this.element);

    // Add mouse event handlers.
    this.element.addEventListener('dblclick', this.handleDoubleClick.bind(this));
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    window.addEventListener('mouseup', this.handleMouseUp.bind(this));

    this.calculate();
    this.draw();
  }

  static getTester(): tester.Tester {
    return tester;
  }

  public destroy(): void {
    this.resizeObserver.unobserve(this.element);
  }

  public setSize(w: number, h: number): void {
    this.canvas.width = w;
    this.canvas.height = h;
    this.size = { h, w };
  }

  private setDimensions(dimensions: t.Dimension[]): t.InternalDimension[] {
    return clone(dimensions).map(dimension => {
      const key = dimension.key;
      const data = this.data[key] || [];
      const internal: t.InternalDimension = {
        ...dimension,
        range: undefined,
        scale: new LinearScale(0, 100),
      };

      if ([ t.DimensionType.Linear, t.DimensionType.Logarithmic ].includes(dimension.type)) {
        internal.range = getDataRange(data);
        if (dimension.type === t.DimensionType.Linear) {
          internal.scale = new LinearScale(
            internal.range[0],
            internal.range[1],
            dimension.dataOnEdge,
          );
        } else if (dimension.type === t.DimensionType.Logarithmic) {
          internal.scale = new LogScale(
            internal.range[0],
            internal.range[1],
            dimension.logBase,
            dimension.dataOnEdge,
          );
        }
      } else if (dimension.type === t.DimensionType.Categorical) {
        internal.scale = new CategoricalScale(dimension.categories, dimension.dataOnEdge);
      }

      return internal;
    });
  }

  private calculate(): void {
    this.calculateLayout();
    this.calculateStyles();
  }

  private calculateLayout(): void {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const _: any = {
      dims: {
        list: new Array(this.dimensions.length)
          .fill(undefined)
          .map(() => ({ axes: {}, label: {}, layout: {} })),
        shared: { axes: {}, label: {}, layout: {} },
      },
      layout: {
        drawRect: {},
        padding: canvas.normalizePadding(this.options.style.padding),
      },
    };

    const { h, w } = this.size;
    const _l = _.layout;
    const _dsa = _.dims.shared.axes;
    const _dsl = _.dims.shared.label;
    const _dsly = _.dims.shared.layout;
    const dimCount = this.dimensions.length;
    const isHorizontal = this.options.direction === t.Direction.Horizontal;
    const dimLabelStyle = this.options.style.dimension.label;
    const dimLabelBoundaryPadding = this.options.style.dimension.label.boundaryPadding;
    const dimLayout = this.options.style.dimension.layout;
    const axesLabelStyle = this.options.style.axes.label;
    const axisBoundaryPadding = this.options.style.axes.axis.boundaryPadding;
    const isLabelBefore = dimLabelStyle.placement === t.LabelPlacement.Before;
    const isLabelAngled = dimLabelStyle.angle != null;
    const isAxesBefore = axesLabelStyle.placement === t.LabelPlacement.Before;

    /**
     * Calculate actual render area (canvas minus padding).
     */
    _l.drawRect = {
      h: h - _l.padding[0] - _l.padding[2],
      w: w - _l.padding[1] - _l.padding[3],
      x: _l.padding[3],
      y: _l.padding[0],
    };

    /**
     * Go through each of the dimension labels and calculate the size
     * of each one and figure out how much space is needed for them.
     */
    _dsl.cos = isLabelAngled ? Math.cos(dimLabelStyle.angle ?? 0) : undefined;
    _dsl.sin = isLabelAngled ? Math.sin(dimLabelStyle.angle ?? 0) : undefined;
    _dsl.rad = dimLabelStyle.angle || (isHorizontal ? undefined : (isLabelBefore ? -Math.PI : 0));
    _dsl.maxLengthCos = 0;
    _dsl.maxLengthSin = 0;
    this.dimensions.forEach((dimension, i) => {
      const textSize = canvas.getTextSize(this.ctx, dimension.label, dimLabelStyle.font);
      const _dlil = _.dims.list[i].label;

      _dlil.w = textSize.w;
      _dlil.h = textSize.h;
      _dlil.lengthCos = isLabelAngled ? textSize.w * _dsl.cos : textSize.w;
      _dlil.lengthSin = isLabelAngled ? textSize.w * _dsl.sin : textSize.h;

      if (Math.abs(_dlil.lengthCos) > Math.abs(_dsl.maxLengthCos)) {
        _dsl.maxLengthCos = _dlil.lengthCos;
      }
      if (Math.abs(_dlil.lengthSin) > Math.abs(_dsl.maxLengthSin)) {
        _dsl.maxLengthSin = _dlil.lengthSin;
      }
    });

    /**
     * Figure out the max axis pixel range after dimension labels are calculated.
     */
    _dsa.start = 0;
    _dsa.stop = 0;
    if (isHorizontal) {
      if (isLabelBefore) {
        const labelOffset = Math.max(0, _dsl.maxLengthSin);
        _dsa.start = _l.padding[0] + labelOffset + dimLabelStyle.offset;
        _dsa.stop = h - _l.padding[2];
      } else {
        const labelOffset = isLabelAngled ? Math.max(0, -_dsl.maxLengthSin) : _dsl.maxLengthSin;
        _dsa.start = _l.padding[0];
        _dsa.stop = h - _l.padding[2] - labelOffset - dimLabelStyle.offset;
      }
    } else {
      if (isLabelBefore) {
        const labelOffset = isLabelAngled ? Math.max(0, -_dsl.maxLengthCos) : _dsl.maxLengthCos;
        _dsa.start = _l.padding[3] + labelOffset + dimLabelStyle.offset;
        _dsa.stop = w - _l.padding[1];
      } else {
        const labelOffset = Math.max(0, _dsl.maxLengthCos);
        _dsa.start = _l.padding[3];
        _dsa.stop = w - _l.padding[1] - labelOffset - dimLabelStyle.offset;
      }
    }

    /**
     * Go through each axis and figure out the sizes of each axis labels.
     */
    _dsa.length = _dsa.stop - _dsa.start;
    _dsa.labelFactor = isAxesBefore ? -1 : 1;
    _dsly.totalBoundSpace = 0;
    this.dimensions.forEach((dimension, i) => {
      const _dlia = _.dims.list[i].axes;
      const _dlil = _.dims.list[i].label;
      const _dlily = _.dims.list[i].layout;
      const scale: NiceScale | undefined = dimension.scale;

      /**
       * Update the scale info based on ticks and find the longest tick label.
       */
      _dlia.tickLabels = [];
      _dlia.tickPos = [];
      _dlia.maxLength = 0;
      if (scale) {
        scale.setAxisLength(_dsa.length);

        _dlia.tickLabels = scale.tickLabels.slice();
        _dlia.tickPos = scale.tickPos.slice();

        scale.tickLabels.forEach(tickLabel => {
          const size = canvas.getTextSize(this.ctx, tickLabel, axesLabelStyle.font);
          _dlia.maxLength = Math.max(size.w, _dlia.maxLength);
        });
      }

      /**
       * Figure out where the axis alignment center should be.
       * First, base it on the direction and dimension label placement.
       */
      if (_dlil.lengthCos == null) {
        _dlily.spaceBefore = (isHorizontal ? _dlil.w : _dlil.h) / 2;
        _dlily.spaceAfter = _dlily.spaceBefore;
      } else if (isHorizontal) {
        _dlily.spaceBefore = _dlil.lengthCos < 0 ? -_dlil.lengthCos : 0;
        _dlily.spaceAfter = _dlil.lengthCos > 0 ? _dlil.lengthCos : 0;
      } else {
        _dlily.spaceBefore = _dlil.lengthSin > 0 ? _dlil.lengthSin : 0;
        _dlily.spaceAfter = _dlil.lengthSin < 0 ? -_dlil.lengthSin : 0;
      }

      /**
       * See if axes labels are long enough to shift the axis center.
       */
      if (isAxesBefore) {
        _dlily.spaceBefore = Math.max(_dlily.spaceBefore, _dlia.maxLength);
      } else {
        _dlily.spaceAfter = Math.max(_dlily.spaceAfter, _dlia.maxLength);
      }

      /**
       * Caclulate the layout positions.
       */
      if (isHorizontal) {
        _dlily.bound = {
          h: h - _l.padding[0] - _l.padding[2],
          w: _dlily.spaceBefore + _dlily.spaceAfter,
          x: 0,
          y: _l.padding[0],
        };
        _dsly.totalBoundSpace += _dlily.bound.w;
      } else {
        _dlily.bound = {
          h: _dlily.spaceBefore + _dlily.spaceAfter,
          w: w - _l.padding[1] - _l.padding[3],
          x: _l.padding[3],
          y: 0,
        };
        _dsly.totalBoundSpace += _dlily.bound.h;
      }
    });

    /**
     * Calculate the gap spacing between the dimensions.
     */
    if (isHorizontal) {
      _dsly.gap = dimCount > 1 ? (_l.drawRect.w - _dsly.totalBoundSpace) / (dimCount - 1) : 0;
      _dsly.offset = _l.padding[3];
      _dsly.space = _l.drawRect.w / dimCount;
    } else {
      _dsly.gap = dimCount > 1 ? (_l.drawRect.h - _dsly.totalBoundSpace) / (dimCount - 1) : 0;
      _dsly.offset = _l.padding[0];
      _dsly.space = _l.drawRect.h / dimCount;
    }

    /**
     * Update the dimension bounding position.
     */
    let traversed = _dsly.offset;
    for (let i = 0; i < _.dims.list.length; i++) {
      const _dlil = _.dims.list[i].label;
      const _dlily = _.dims.list[i].layout;

      if (isHorizontal) {
        if (dimLayout === t.DimensionLayout.AxisEvenlySpaced) {
          _dlily.bound.x = _dsly.offset + i * _dsly.space + _dsly.space / 2 - _dlily.spaceBefore;
        } else if (dimLayout === t.DimensionLayout.Equidistant) {
          _dlily.bound.x = _dsly.offset + i * _dsly.space + (_dsly.space - _dlily.bound.w) / 2;
        } else if (dimLayout === t.DimensionLayout.EvenlySpaced) {
          _dlily.bound.x = traversed;
          traversed += _dsly.gap + _dlily.bound.w;
        }
        _dlily.axisStart = { x: _dlily.spaceBefore, y: _dsa.start - _l.padding[0] };
        _dlily.axisStop = { x: _dlily.spaceBefore, y: _dsa.stop - _l.padding[0] };
        _dlily.labelPoint = {
          x: _dlily.spaceBefore,
          y: isLabelBefore
            ? _dsa.start - dimLabelStyle.offset - _l.padding[0]
            : _dsa.stop + dimLabelStyle.offset - _l.padding[0],
        };
      } else {
        if (dimLayout === t.DimensionLayout.AxisEvenlySpaced) {
          _dlily.bound.y = _dsly.offset + i * _dsly.space + _dsly.space / 2 - _dlily.spaceBefore;
        } else if (dimLayout === t.DimensionLayout.Equidistant) {
          _dlily.bound.y = _dsly.offset + i * _dsly.space + (_dsly.space - _dlily.bound.h) / 2;
        } else if (dimLayout === t.DimensionLayout.EvenlySpaced) {
          _dlily.bound.y = traversed;
          traversed += _dsly.gap + _dlily.bound.h;
        }
        _dlily.axisStart = { x: _dsa.start - _l.padding[3], y: _dlily.spaceBefore };
        _dlily.axisStop = { x: _dsa.stop - _l.padding[3], y: _dlily.spaceBefore };
        _dlily.labelPoint = {
          x: isLabelBefore
            ? _dsa.start - dimLabelStyle.offset - _l.padding[1]
            : _dsa.stop + dimLabelStyle.offset - _l.padding[1],
          y: _dlily.spaceBefore,
        };
      }

      /**
       * Calculate the dimension label text boundary.
       */
      const offsetX = isHorizontal ? -_dlil.w / 2 : 0;
      const offsetY = isHorizontal ? (isLabelBefore ? -_dlil.h : 0) : -_dlil.h / 2;
      _dlily.labelBoundary = canvas.getTextBoundary(
        _dlily.bound.x + _dlily.labelPoint.x,
        _dlily.bound.y + _dlily.labelPoint.y,
        _dlil.w,
        _dlil.h,
        _dsl.rad,
        isLabelAngled ? 0 : offsetX,
        isLabelAngled ? -_dlil.h / 2 : offsetY,
        dimLabelBoundaryPadding,
      );

      /**
       * Calculate the dimension axis boundary.
       */
      _dlily.axisBoundary = [
        {
          x: _dlily.bound.x + _dlily.axisStart.x - (isHorizontal ? axisBoundaryPadding : 0),
          y: _dlily.bound.y + _dlily.axisStart.y - (isHorizontal ? 0 : axisBoundaryPadding),
        },
        {
          x: _dlily.bound.x + _dlily.axisStart.x + (isHorizontal ? axisBoundaryPadding : 0),
          y: _dlily.bound.y + _dlily.axisStart.y + (isHorizontal ? 0 : axisBoundaryPadding),
        },
        {
          x: _dlily.bound.x + _dlily.axisStop.x + (isHorizontal ? axisBoundaryPadding : 0),
          y: _dlily.bound.y + _dlily.axisStop.y + (isHorizontal ? 0 : axisBoundaryPadding),
        },
        {
          x: _dlily.bound.x + _dlily.axisStop.x - (isHorizontal ? axisBoundaryPadding : 0),
          y: _dlily.bound.y + _dlily.axisStop.y - (isHorizontal ? 0 : axisBoundaryPadding),
        },
      ];
    }

    this._ = _;
  }

  private calculateStyles(): void {
    if (!this._) return;

    this._.styles = this._.styles || [];

    const _os = this.options.style;
    const _osa = _os.axes;
    const _osd = _os.dimension;
    const _dl = this._.dims.list;
    const _s = this._.styles;
    const _ixsa = this.ix.shared.action;
    const _ixsf = this.ix.shared.focus;
    const isActive = _ixsa.type !== t.ActionType.None;

    for (let i = 0; i < _dl.length; i++) {
      const key = this.dimensions[i].key;
      const filters = this.filters[key] || [];
      const isDimActive = _ixsa.type === t.ActionType.LabelMove && _ixsa.dimIndex === i;
      const isDimFocused = _ixsf?.type === t.FocusType.DimensionLabel && _ixsf?.dimIndex === i;
      const isAxisActive = [
        t.ActionType.FilterCreate,
        t.ActionType.FilterMove,
        t.ActionType.FilterResizeAfter,
        t.ActionType.FilterResizeBefore,
      ].includes(_ixsa.type) && _ixsa.dimIndex === i;
      const isAxisFocused = _ixsf?.type === t.FocusType.DimensionAxis && _ixsf?.dimIndex === i;

      _s[i] = _s[i] || {};
      _s[i].label = {
        ..._osd.label,
        ...(!isDimActive && isDimFocused && !isActive ? _osd.labelHover : {}),
        ...(isDimActive ? _osd.labelActive : {}),
      };

      _s[i].axis = {
        ..._osa.axis,
        ...(!isAxisActive && isAxisFocused && !isActive ? _osa.axisHover : {}),
        ...(isAxisActive ? _osa.axisActve : {}),
      };

      _s[i].tick = {
        ..._osa.tick,
        ...(!isAxisActive && isAxisFocused && !isActive ? _osa.tickHover : {}),
        ...(isAxisActive ? _osa.tickActive : {}),
      };

      _s[i].tickLabel = {
        ..._osa.label,
        ...(!isAxisActive && isAxisFocused && !isActive ? _osa.labelHover : {}),
        ...(isAxisActive ? _osa.labelActive : {}),
      };

      _s[i].filters = filters.map((filter, j) => {
        const isFilterFocused = (
          (_ixsf?.type === t.FocusType.Filter || _ixsf?.type === t.FocusType.FilterResize) &&
          _ixsf?.dimIndex === i &&
          _ixsf?.filterIndex === j
        );
        const isFilterActive = _ixsa.dimIndex === i && _ixsa.filterIndex === j;
        return {
          ..._osa.filter,
          ...(!isFilterActive && isFilterFocused && !isActive ? _osa.filterHover : {}),
          ...(isFilterActive ? _osa.filterActive : {}),
        };
      });
    }
  }

  private getFocusByPoint(point: t.Point): t.Focus | undefined {
    if (!this._) return;

    const _dsa = this._.dims.shared.axes;
    const isHorizontal = this.options.direction === t.Direction.Horizontal;
    const vKey = isHorizontal ? 'y' : 'x';
    const axisLength = this._.dims.shared.axes.length;
    for (let i = 0; i < this._.dims.list.length; i++) {
      const key = this.dimensions[i].key;
      const layout = this._.dims.list[i].layout;

      // Check to see if a dimension label was targeted.
      const labelBoundary = layout.labelBoundary;
      if (
        isPointInTriangle(point, labelBoundary[0], labelBoundary[1], labelBoundary[2]) ||
        isPointInTriangle(point, labelBoundary[2], labelBoundary[3], labelBoundary[0])
      ) {
        return { dimIndex: i, type: t.FocusType.DimensionLabel };
      }

      // Check to see if a dimension axis was targeted.
      const axisBoundary = layout.axisBoundary;
      if (
        isPointInTriangle(point, axisBoundary[0], axisBoundary[1], axisBoundary[2]) ||
        isPointInTriangle(point, axisBoundary[2], axisBoundary[3], axisBoundary[0])
      ) {
        const filters = this.filters[key] || [];
        const axisOffset = layout.bound[vKey] + layout.axisStart[vKey];
        const p = (point[vKey] - axisOffset) / axisLength;
        const filterIndex = filters.findIndex(filter => p >= filter.p0 && p <= filter.p1);

        let type = t.FocusType.DimensionAxis;
        if (filterIndex !== -1) {
          const threshold = ix.FILTER_RESIZE_THRESHOLD / _dsa.length;
          const filter = filters[filterIndex];
          const isResize = p <= filter.p0 + threshold || p >= filter.p1 - threshold;
          type = isResize ? t.FocusType.FilterResize : t.FocusType.Filter;
        }

        return { dimIndex: i, filterIndex, type };
      }
    }
  }

  private updateActiveLabel(): void {
    if (!this._ || this.ix.shared.action.type !== t.ActionType.LabelMove) return;

    const _dl = this._.dims.list;
    const _ix = this.ix;
    const _ixd = _ix.dimension;
    const _ixsa = _ix.shared.action;
    const isHorizontal = this.options.direction === t.Direction.Horizontal;
    const hKey = isHorizontal ? 'x' : 'y';

    _ixd.boundOffset = {
      x: isHorizontal ? _ixsa.p1.x - _ixsa.p0.x : 0,
      y: isHorizontal ? 0 : _ixsa.p1.y - _ixsa.p0.y,
    };

    for (let i = 0; i < _dl.length; i++) {
      const layout = _dl[i].layout;
      const bound = layout.bound;
      const axisStart = layout.axisStart;
      const axisDistance = (_ixd.axis + _ixd.boundOffset[hKey]) - (bound[hKey] + axisStart[hKey]);

      /**
       * Check that...
       * 1. dimension drag type is triggered by the label
       * 2. dimension being dragged isn't being the dimension getting compared to (i)
       * 3. dimension is within a distance threshold
       */
      if (_ixsa.dimIndex !== i && Math.abs(axisDistance) < ix.DIMENSION_SWAP_THRESHOLD) {
        // Swap dragging dimension with the dimension it intersects with.
        const tempDim = this.dimensions[_ixsa.dimIndex];
        this.dimensions[_ixsa.dimIndex] = this.dimensions[i];
        this.dimensions[i] = tempDim;

        // Update the drag dimension's index
        _ixsa.dimIndex = i;
      }
    }
  }

  private setActiveFilter(key: string, pos: number, value: t.Primitive): void {
    if (!this._) return;

    const _filters = this.filters;
    const _ix = this.ix;
    const _ixsa = _ix.shared.action;
    const _ixf = _ix.filters;
    const _dsa = this._.dims.shared.axes;

    // See if there is an existing matching filter based on % position.
    const index = (_filters[key] || []).findIndex(filter => pos >= filter.p0 && pos <= filter.p1);
    if (index !== -1) {
      _ixf.active = _filters[key][index];
      _ixf.active.startP0 = _ixf.active.p0;
      _ixf.active.startP1 = _ixf.active.p1;
      _ixsa.filterIndex = index;

      if (
        pos >= _ixf.active.p0 &&
        pos <= _ixf.active.p0 + (ix.FILTER_RESIZE_THRESHOLD / _dsa.length)
      ) {
        _ixsa.type = t.ActionType.FilterResizeBefore;
      } else if (
        pos >= _ixf.active.p1 - (ix.FILTER_RESIZE_THRESHOLD / _dsa.length) &&
        pos <= _ixf.active.p1
      ) {
        _ixsa.type = t.ActionType.FilterResizeAfter;
      } else {
        _ixsa.type = t.ActionType.FilterMove;
      }
    } else {
      _ixsa.type = t.ActionType.FilterCreate;
      _ixf.active = { p0: pos, p1: pos, value0: value, value1: value };

      // Store active filter into filter list.
      _filters[key] = _filters[key] || [];
      _filters[key].push(_ixf.active);
      _ixsa.filterIndex = _filters[key].length - 1;
    }
  }

  private updateActiveFilter(e: MouseEvent): void {
    if (!this._) return;

    const _dl = this._.dims.list;
    const _dsa = this._.dims.shared.axes;
    const _ix = this.ix;
    const _ixf = _ix.filters;
    const _ixs = _ix.shared;
    const _ixsa = _ixs.action;
    const _filters = this.filters;
    const index = _ixsa.dimIndex;
    const isHorizontal = this.options.direction === t.Direction.Horizontal;
    const filterKey = isHorizontal ? 'y' : 'x';
    const isFilterAction = [
      t.ActionType.FilterCreate,
      t.ActionType.FilterMove,
      t.ActionType.FilterResizeAfter,
      t.ActionType.FilterResizeBefore,
    ].includes(_ixsa.type);

    if (!isFilterAction || !_ixf.key) return;

    const bound = _dl[_ixsa.dimIndex].layout.bound;
    const axisStart = _dl[_ixsa.dimIndex].layout.axisStart[filterKey];

    /**
     * If the active filter previously exists, we want to drag it,
     * otherwise we want to change the size of the new one based on event position.
     */
    if (_ixsa.type === t.ActionType.FilterMove) {
      const startP0 = _ixf.active.startP0 ?? 0;
      const startP1 = _ixf.active.startP1 ?? 0;
      const startLength = startP1 - startP0;
      const shift = (_ixsa.p1[filterKey] - _ixsa.p0[filterKey]) / _dsa.length;

      _ixf.active.p0 = startP0 + shift;
      _ixf.active.p1 = startP1 + shift;

      // Cap the drag to the axis edges.
      if (_ixf.active.p0 < 0.0) {
        _ixf.active.p0 = 0;
        _ixf.active.p1 = startLength;
      } else if (_ixf.active.p1 > 1.0) {
        _ixf.active.p0 = 1.0 - startLength;
        _ixf.active.p1 = 1.0;
      }

      _ixf.active.value0 = this.dimensions[index].scale.percentToValue(_ixf.active.p0);
      _ixf.active.value1 = this.dimensions[index].scale.percentToValue(_ixf.active.p1);
    } else if (_ixsa.type === t.ActionType.FilterResizeBefore) {
      _ixf.active.p0 = (_ixsa.p1[filterKey] - bound[filterKey] - axisStart) / _dsa.length;
      _ixf.active.p0 = capDataRange(_ixf.active.p0, [ 0.0, 1.0 ]);
      _ixf.active.value0 = this.dimensions[index].scale.percentToValue(_ixf.active.p0);
    } else {
      _ixf.active.p1 = (_ixsa.p1[filterKey] - bound[filterKey] - axisStart) / _dsa.length;
      _ixf.active.p1 = capDataRange(_ixf.active.p1, [ 0.0, 1.0 ]);
      _ixf.active.value1 = this.dimensions[index].scale.percentToValue(_ixf.active.p1);
    }

    // Whether or not to finalize active filter and removing reference to it.
    if (e.type !== 'mouseup') return;

    /**
     * Check to see if the release event is near the starting event.
     * If so, remove the previously added filter and clear out the active filter.
     */
    if (distance(_ixsa.p0, _ixsa.p1) < ix.FILTER_REMOVE_THRESHOLD) {
      // Remove matching filter based on event position value.
      const filters = _filters[_ixf.key] || [];
      const pos = (_ixf.active.p1 - _ixf.active.p0) / 2 + _ixf.active.p0;
      const removeIndex = filters.findIndex(filter => pos >= filter.p0 && pos <= filter.p1);
      if (removeIndex !== -1) filters.splice(removeIndex, 1);
    }

    // Swap p0 and p1 if p1 is less than p0.
    if (_ixf.active.p1 < _ixf.active.p0) {
      const [ tempP, tempValue ] = [ _ixf.active.p1, _ixf.active.value1 ];
      [ _ixf.active.p1, _ixf.active.value1 ] = [ _ixf.active.p0, _ixf.active.value0 ];
      [ _ixf.active.p0, _ixf.active.value0 ] = [ tempP, tempValue ];
    }

    // Overwrite active filter to remove reference to filter in filters list.
    _ixf.active = { ...DEFAULT.FILTER };
    _ixf.key = undefined;

    this.cleanUpFilters();
  }

  private cleanUpFilters(): void {
    Object.keys(this.filters).forEach(key => {
      const filters = this.filters[key] || [];
      for (let i = 0; i < filters.length; i++) {
        // Remove invalid filters or filters that are sized 0.
        if (ix.isFilterInvalid(filters[i])) {
          filters[i] = { ...DEFAULT.FILTER };
          continue;
        }
        for (let j = i + 1; j < filters.length; j++) {
          if (ix.isFilterEmpty(filters[i]) || ix.isFilterEmpty(filters[j])) continue;
          /**
           * If overlap, merge into higher indexed filter and remove lower indexed
           * filter to avoid checking the removed filter during the loop.
           */
          if (ix.isIntersectingFilters(filters[i], filters[j])) {
            filters[j] = ix.mergeFilters(filters[i], filters[j]);
            filters[i] = { ...DEFAULT.FILTER };
          }
        }
      }
      this.filters[key] = filters.filter(filter => !ix.isFilterEmpty(filter));
    });
  }

  private updateCursor(): void {
    const _ix = this.ix;
    const _ixsa = _ix.shared.action;
    const _ixsf = _ix.shared.focus;
    const isHorizontal = this.options.direction === t.Direction.Horizontal;

    let cursor = 'default';
    if (_ixsa.type !== t.ActionType.None) {
      if ([ t.ActionType.FilterMove, t.ActionType.LabelMove ].includes(_ixsa.type)) {
        cursor = 'grabbing';
      } else if ([
        t.ActionType.FilterResizeAfter,
        t.ActionType.FilterResizeBefore,
      ].includes(_ixsa.type)) {
        cursor = isHorizontal ? 'ns-resize' : 'ew-resize';
      } else if (_ixsa.type === t.ActionType.FilterCreate) {
        cursor = 'crosshair';
      }
    } else if (_ixsf !== undefined) {
      if (_ixsf.type === t.FocusType.DimensionLabel) {
        cursor = 'grab';
      } else if (_ixsf.type === t.FocusType.DimensionAxis) {
        cursor = 'crosshair';
      } else if (_ixsf.type === t.FocusType.Filter) {
        cursor = 'grab';
      } else if (_ixsf.type === t.FocusType.FilterResize) {
        cursor = isHorizontal ? 'ns-resize' : 'ew-resize';
      }
    }
    this.canvas.style.cursor = cursor;
  }

  private draw(): void {
    if (!this._) return;

    const { h, w } = this.size;
    const _dl = this._.dims.list;
    const _dsa = this._.dims.shared.axes;
    const _dsl = this._.dims.shared.label;
    const _s = this._.styles;
    const _ix = this.ix;
    const _ixsf = this.ix.shared.focus;
    const _filters = this.filters;
    const isHorizontal = this.options.direction === t.Direction.Horizontal;
    const axesStyle = this.options.style.axes;
    const dataStyle = this.options.style.data;
    const dimStyle = this.options.style.dimension;
    const isLabelBefore = dimStyle.label.placement === t.LabelPlacement.Before;
    const isAxesBefore = axesStyle.label.placement === t.LabelPlacement.Before;

    // Clear previous canvas drawings.
    this.ctx.clearRect(0, 0, w, h);

    // Draw data lines.
    const dimColorKey = dataStyle.colorScale?.dimensionKey;
    for (let k = 0; k < this.dataCount; k++) {
      let dataDefaultStyle: t.StyleLine = dataStyle.default;
      let hasFilters = false;
      let isFilteredOut = false;

      const series = this.dimensions.map((dimension, i) => {
        const key = dimension.key;
        const layout = _dl[i].layout;
        const bound = ix.getDragBound(i, _ix, layout.bound);
        const value = this.data[key][k];
        const pos = dimension.scale?.valueToPos(value) ?? 0;
        const percent = dimension.scale?.valueToPercent(value) ?? 0;
        const x = bound.x + layout.axisStart.x + (isHorizontal ? 0 : pos);
        const y = bound.y + layout.axisStart.y + (isHorizontal ? pos : 0);

        if (dimColorKey === key) {
          const percent = dimension.scale?.valueToPercent(value) ?? 0;
          const scaleColor = scale2rgba(dataStyle.colorScale?.colors || [], percent);
          dataDefaultStyle.strokeStyle = scaleColor;
        }

        /**
         * Check for filters on this dimension and make the filtering
         * use AND behavior instead of OR between all the dimensions.
         */
        if (_filters[key] && _filters[key].length !== 0) {
          hasFilters = true;

          let hasMatchedFilter = false;
          for (let f = 0; f < _filters[key].length; f++) {
            const filter = _filters[key][f];
            const filterMin = Math.min(filter.p0, filter.p1);
            const filterMax = Math.max(filter.p0, filter.p1);
            if (percent >= filterMin && percent <= filterMax) {
              hasMatchedFilter = true;
              break;
            }
          }

          if (!hasMatchedFilter) isFilteredOut = true;
        }

        return { x, y };
      });

      if (hasFilters && isFilteredOut) dataDefaultStyle = dataStyle.filtered;

      canvas.drawData(this.ctx, series, isHorizontal, dataStyle.path, dataDefaultStyle);
    }

    // Draw dimension labels.
    const labelAdjust = dimStyle.label.angle == null && isHorizontal;
    const dimTextStyle: t.StyleText = {
      textAlign: labelAdjust ? 'center' : undefined,
      textBaseline: labelAdjust ? (isLabelBefore ? 'bottom' : 'top') : undefined,
    };
    this.dimensions.forEach((dimension, i) => {
      const bound = ix.getDragBound(i, _ix, _dl[i].layout.bound);
      const labelPoint = _dl[i].layout.labelPoint;
      const x = bound.x + labelPoint.x;
      const y = bound.y + labelPoint.y;
      const style = { ..._s[i].label, ...dimTextStyle };
      canvas.drawText(this.ctx, dimension.label, x, y, _dsl.rad ?? 0, style);
    });

    // Draw dimension axes.
    const tickAdjust = axesStyle.label.angle == null && isHorizontal;
    const tickTextStyle: t.StyleText = {
      textAlign: tickAdjust ? undefined : 'center',
      textBaseline: tickAdjust ? undefined : (isAxesBefore ? 'bottom' : 'top'),
    };
    _dl.forEach((dim, i) => {
      const key = this.dimensions[i].key;
      const bound = ix.getDragBound(i, _ix, dim.layout.bound);
      const axisStart = dim.layout.axisStart;
      const axisStop = dim.layout.axisStop;
      const tickLabels = dim.axes.tickLabels;
      const tickPos = dim.axes.tickPos;
      const tickLengthFactor = isAxesBefore ? -1 : 1;
      const filters = _filters[key] || [];

      canvas.drawLine(
        this.ctx,
        bound.x + axisStart.x,
        bound.y + axisStart.y,
        bound.x + axisStop.x,
        bound.y + axisStop.y,
        _s[i].axis,
      );

      for (let j = 0; j < tickLabels.length; j++) {
        let tickLabel = tickLabels[j];
        if (tickLabel[0] === '*') {
          if (_ixsf?.dimIndex === i && (
            _ixsf?.type === t.FocusType.DimensionAxis ||
            _ixsf?.type === t.FocusType.Filter ||
            _ixsf?.type === t.FocusType.FilterResize
          )) {
            tickLabel = tickLabel.substring(1);
          } else {
            continue;
          }
        }

        const xOffset = isHorizontal ? 0 : tickPos[j];
        const yOffset = isHorizontal ? tickPos[j] : 0;
        const xTickLength = isHorizontal ? tickLengthFactor * axesStyle.tick.length : 0;
        const yTickLength = isHorizontal ? 0 : tickLengthFactor * axesStyle.tick.length;
        const x0 = bound.x + axisStart.x + xOffset;
        const y0 = bound.y + axisStart.y + yOffset;
        const x1 = bound.x + axisStart.x + xOffset + xTickLength;
        const y1 = bound.y + axisStart.y + yOffset + yTickLength;
        canvas.drawLine(this.ctx, x0, y0, x1, y1, _s[i].tick);

        const cx = isHorizontal ? x1 + tickLengthFactor * axesStyle.label.offset : x0;
        const cy = isHorizontal ? y0 : y1 + tickLengthFactor * axesStyle.label.offset;
        const rad = axesStyle.label.angle != null
          ? axesStyle.label.angle
          : (isHorizontal && isAxesBefore ? Math.PI : 0);
        const style = { ..._s[i].tickLabel, ...tickTextStyle };
        canvas.drawText(this.ctx, tickLabel, cx, cy, rad, style);
      }

      filters.forEach((filter, j) => {
        const p0 = filter.p0 * _dsa.length;
        const p1 = filter.p1 * _dsa.length;
        const width = _s[i].filters[j].width;
        const halfWidth = width / 2;
        const x = bound.x + axisStart.x + (isHorizontal ? -halfWidth : p0);
        const y = bound.y + axisStart.y + (isHorizontal ? p0 : -halfWidth);
        const w = isHorizontal ? width : p1 - p0;
        const h = isHorizontal ? p1 - p0 : width;
        canvas.drawRect(this.ctx, x, y, w, h, _s[i].filters[j]);
      });
    });
  }

  private drawDebugOutline(): void {
    if (!this._) return;

    const { h, w } = this.size;
    const _l = this._.layout;
    const _dl = this._.dims.list;
    const _dsly = this._.dims.shared.layout;
    const isHorizontal = this.options.direction === t.Direction.Horizontal;

    // Draw the drawing area by outlining paddings.
    const paddingStyle = { strokeStyle: '#dddddd' };
    canvas.drawLine(this.ctx, 0, _l.padding[0], w, _l.padding[0], paddingStyle);
    canvas.drawLine(this.ctx, 0, h - _l.padding[2], w, h - _l.padding[2], paddingStyle);
    canvas.drawLine(this.ctx, _l.padding[3], 0, _l.padding[3], h, paddingStyle);
    canvas.drawLine(this.ctx, w - _l.padding[1], 0, w - _l.padding[1], h, paddingStyle);

    // Draw each dimension rough outline with bounding box.
    const dimStyle = { strokeStyle: '#999999' };
    const boundStyle = { strokeStyle: '#dddddd' };
    const axisBoundaryStyle = { fillStyle: '#eeeeee' };
    const labelPointStyle = { fillStyle: '#00ccff', strokeStyle: '#0099cc' };
    const labelBoundaryStyle = { fillStyle: '#ffcc00' };
    _dl.forEach((dim, i) => {
      const bound = dim.layout.bound;
      const axisBoundary = dim.layout.axisBoundary;
      const labelPoint = dim.layout.labelPoint;
      const labelBoundary = dim.layout.labelBoundary;

      canvas.drawRect(
        this.ctx,
        isHorizontal ? _l.padding[3] + i * _dsly.space : bound.x,
        isHorizontal ? bound.y : _l.padding[0] + i * _dsly.space,
        isHorizontal ? _dsly.space : bound.w,
        isHorizontal ? bound.h : _dsly.space,
        dimStyle,
      );
      canvas.drawRect(this.ctx, bound.x, bound.y, bound.w, bound.h, boundStyle);
      canvas.drawCircle(
        this.ctx,
        bound.x + labelPoint.x,
        bound.y + labelPoint.y,
        3,
        labelPointStyle,
      );
      canvas.drawBoundary(this.ctx, labelBoundary, labelBoundaryStyle);
      canvas.drawBoundary(this.ctx, axisBoundary, axisBoundaryStyle);
    });
  }

  private handleResize(entries: ResizeObserverEntry[]) {
    const { width: w1, height: h1 } = entries[0].contentRect;
    const { w: w0, h: h0 } = this.size;
    if (w0 === w1 && h0 === h1) return;

    this.setSize(w1, h1);
    this.calculate();
    this.draw();
  }

  private handleDoubleClick(): void {
    // Reset chart settings.
    this.dimensions = this.setDimensions(this.dimensionsOriginal);
    this.filters = {};
    this.ix = clone(DEFAULT.IX);

    this.calculate();
    this.draw();
  }

  private handleMouseDown(e: MouseEvent): void {
    if (!this._) return;

    const _ixs = this.ix.shared;
    const _ixsa = this.ix.shared.action;
    const _ixd = this.ix.dimension;
    const _ixf = this.ix.filters;
    const _dsa = this._.dims.shared.axes;
    const isHorizontal = this.options.direction === t.Direction.Horizontal;
    const hKey = isHorizontal ? 'x' : 'y';
    const vKey = isHorizontal ? 'y' : 'x';

    const point = { x: e.clientX, y: e.clientY };
    _ixsa.p0 = point;
    _ixsa.p1 = point;
    _ixsa.filterIndex = -1;
    _ixs.focus = this.getFocusByPoint(point);

    if (_ixs.focus) {
      const i = _ixs.focus.dimIndex;
      const layout = this._.dims.list[i].layout;
      const bound = layout.bound;
      const axisStart = layout.axisStart;
      if (_ixs.focus?.type === t.FocusType.DimensionLabel) {
        _ixsa.type = t.ActionType.LabelMove;
        _ixsa.dimIndex = i;
        _ixd.axis = bound[hKey] + axisStart[hKey];
        _ixd.bound = bound;
      } else if ([
        t.FocusType.DimensionAxis,
        t.FocusType.Filter,
        t.FocusType.FilterResize,
      ].includes(_ixs.focus?.type)) {
        _ixsa.type = t.ActionType.FilterCreate;
        _ixsa.dimIndex = i;
        _ixf.key = this.dimensions[i].key;

        const p0 = (_ixsa.p0[vKey] - bound[vKey] - axisStart[vKey]) / _dsa.length;
        const value0 = this.dimensions[i].scale.percentToValue(p0);

        this.setActiveFilter(_ixf.key, p0, value0);
      }
    }

    // Update cursor pointer based on type and position.
    this.updateCursor();

    this.calculate();
    this.draw();
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this._) return;

    const point = { x: e.clientX, y: e.clientY };
    const _ixs = this.ix.shared;
    _ixs.action.p1 = point;
    _ixs.focus = this.getFocusByPoint(point);

    // Update dimension dragging via label.
    this.updateActiveLabel();

    // Update dimension filter creating dragging data.
    this.updateActiveFilter(e);

    // Update cursor pointer based on type and position.
    this.updateCursor();

    this.calculate();
    this.draw();
  }

  private handleMouseUp(e: MouseEvent): void {
    if (!this._ || this.ix.shared.action.type === t.ActionType.None) return;

    const point = { x: e.clientX, y: e.clientY };
    this.ix.shared.action.p1 = point;

    // Update active filter upon release event.
    this.updateActiveFilter(e);

    // Reset drag info but preserve focus.
    this.ix = clone(DEFAULT.IX);
    this.ix.shared.focus = this.getFocusByPoint(point);

    // Update cursor pointer based on type and position.
    this.updateCursor();

    this.calculate();
    this.draw();
  }
}

export default Hermes;
