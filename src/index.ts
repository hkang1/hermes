import { deepmerge } from 'deepmerge-ts';

import CategoricalScale from './classes/CategoricalScale';
import HermesError from './classes/HermesError';
import LinearScale from './classes/LinearScale';
import LogScale from './classes/LogScale';
import NiceScale from './classes/NiceScale';
import * as DEFAULT from './defaults';
import * as t from './types';
import * as canvas from './utils/canvas';
import { scale2rgba } from './utils/color';
import { clone, getDataRange } from './utils/data';
import { getElement } from './utils/dom';
import * as ix from './utils/interaction';
import { isPointInTriangle, percentRectIntersection, shiftRect } from './utils/math';
import * as tester from './utils/test';

class Hermes {
  private element: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private resizeObserver: ResizeObserver;
  private data: t.HermesData;
  private dataCount: number;
  private dimensions: t.Dimension[];
  private options: t.HermesOptions;
  private size: t.Size = { h: 0, w: 0 };
  private drag: t.Drag = clone(DEFAULT.DRAG);
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
    this.dimensions = dimensions;
    this.options = deepmerge(DEFAULT.HERMES_OPTIONS, options) as t.HermesOptions;

    // Add resize observer to detect target element resizing.
    this.resizeObserver = new ResizeObserver(entries => {
      const rect = entries[0].contentRect;
      this.setSize(rect.width, rect.height);
      this.calculate();
    });
    this.resizeObserver.observe(this.element);

    // Add mouse event handlers.
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    window.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // Enable draw animation frames.
    this.calculate();
    // window.requestAnimationFrame(this.draw.bind(this));
  }

  static getTester(): any {
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

  private calculate(): void {
    this.calculateScales();
    this.calculateLayout();
    this.draw();
  }

  private calculateScales(): void {
    this.dimensions.forEach(dimension => {
      const _da = dimension.axis;
      const key = dimension.key;
      const data = this.data[key] || [];
      if ([ t.AxisType.Linear, t.AxisType.Logarithmic ].includes(_da.type)) {
        _da.range = getDataRange(data);
        if (_da.type === t.AxisType.Linear) {
          _da.scale = new LinearScale(_da.range[0], _da.range[1]);
        } else if (_da.type === t.AxisType.Logarithmic) {
          _da.scale = new LogScale(_da.range[0], _da.range[1], _da.logBase);
        }
      } else if (_da.type === t.AxisType.Categorical) {
        _da.scale = new CategoricalScale(_da.categories);
      }
    });
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
    const axisLength = _dsa.stop - _dsa.start;
    _dsa.labelFactor = isAxesBefore ? -1 : 1;
    _dsly.totalBoundSpace = 0;
    this.dimensions.forEach((dimension, i) => {
      const _dlia = _.dims.list[i].axes;
      const _dlil = _.dims.list[i].label;
      const _dlily = _.dims.list[i].layout;
      const scale: NiceScale | undefined = dimension.axis.scale;

      /**
       * Update the scale info based on ticks and find the longest tick label.
       */
      _dlia.tickLabels = [];
      _dlia.tickPos = [];
      _dlia.maxLength = 0;
      if (scale) {
        scale.setAxisLength(axisLength);

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

  private mergeFilters(): void {
    Object.keys(this.filters).forEach(key => {
      const filters = this.filters[key] || [];
      for (let i = 0; i < filters.length - 1; i++) {
        for (let j = i + 1; j < filters.length; j++) {
          if (ix.isFilterEmpty(filters[i]) || ix.isFilterEmpty(filters[j])) continue;
          /**
           * If overlap, merge into higher indexed filter and remove lower indexed
           * filter to avoid checking the removed filter during the loop.
           */
          if (ix.isIntersectingFilters(filters[i], filters[j])) {
            filters[j] = ix.mergeFilters(filters[i], filters[j]);
            filters[i] = clone(DEFAULT.FILTER);
          }
        }
      }
      this.filters[key] = filters.filter(filter => !ix.isFilterEmpty(filter));
    });
  }

  private draw(): void {
    if (!this._) return;

    // console.time('render time');

    const { h, w } = this.size;
    const _dl = this._.dims.list;
    const _dsl = this._.dims.shared.label;
    const _drag = this.drag;
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
        const bound = ix.getDragBound(i, _drag, layout.bound);
        const value = this.data[key][k];
        const pos = dimension.axis.scale?.valueToPos(value) ?? 0;
        const x = bound.x + layout.axisStart.x + (isHorizontal ? 0 : pos);
        const y = bound.y + layout.axisStart.y + (isHorizontal ? pos : 0);

        if (dimColorKey === key) {
          const percent = dimension.axis.scale?.valueToPercent(value) ?? 0;
          const scaleColor = scale2rgba(dataStyle.colorScale?.colors || [], percent);
          dataDefaultStyle.strokeStyle = scaleColor;
        }

        if (_filters[key] && _filters[key].length !== 0) {
          hasFilters = true;
          for (let f = 0; f < _filters[key].length; f++) {
            const filter = _filters[key][f];
            if (pos >= filter.p0 && pos <= filter.p1) {
              isFilteredOut = true;
              break;
            }
          }
        }

        return { x, y };
      });

      if (hasFilters && !isFilteredOut) dataDefaultStyle = dataStyle.filtered;

      canvas.drawData(this.ctx, series, isHorizontal, dataStyle.path, dataDefaultStyle);
    }

    // Draw dimension labels.
    const dimTextStyle: t.StyleText = dimStyle.label;
    if (dimStyle.label.angle == null) {
      dimTextStyle.textAlign = isHorizontal ? 'center' : undefined;
      dimTextStyle.textBaseline = isHorizontal ? (isLabelBefore ? 'bottom' : 'top') : undefined;
    }
    this.dimensions.forEach((dimension, i) => {
      const bound = ix.getDragBound(i, _drag, _dl[i].layout.bound);
      const labelPoint = _dl[i].layout.labelPoint;
      const x = bound.x + labelPoint.x;
      const y = bound.y + labelPoint.y;
      canvas.drawText(this.ctx, dimension.label, x, y, _dsl.rad ?? 0, dimTextStyle);
    });

    // Draw dimension axes.
    const drawTickTextStyle: t.StyleText = axesStyle.label;
    if (axesStyle.label.angle == null) {
      drawTickTextStyle.textAlign = isHorizontal ? undefined : 'center';
      drawTickTextStyle.textBaseline = isHorizontal ? undefined : (isAxesBefore ? 'bottom' : 'top');
    }
    _dl.forEach((dim, i) => {
      const key = this.dimensions[i].key;
      const bound = ix.getDragBound(i, _drag, dim.layout.bound);
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
        axesStyle.axis,
      );

      for (let i = 0; i < tickLabels.length; i++) {
        const xOffset = isHorizontal ? 0 : tickPos[i];
        const yOffset = isHorizontal ? tickPos[i] : 0;
        const xTickLength = isHorizontal ? tickLengthFactor * axesStyle.tick.length : 0;
        const yTickLength = isHorizontal ? 0 : tickLengthFactor * axesStyle.tick.length;
        const x0 = bound.x + axisStart.x + xOffset;
        const y0 = bound.y + axisStart.y + yOffset;
        const x1 = bound.x + axisStart.x + xOffset + xTickLength;
        const y1 = bound.y + axisStart.y + yOffset + yTickLength;
        canvas.drawLine(this.ctx, x0, y0, x1, y1, axesStyle.tick);

        const cx = isHorizontal ? x1 + tickLengthFactor * axesStyle.label.offset : x0;
        const cy = isHorizontal ? y0 : y1 + tickLengthFactor * axesStyle.label.offset;
        const rad = axesStyle.label.angle != null
          ? axesStyle.label.angle
          : (isHorizontal && isAxesBefore ? Math.PI : 0);
        const tickLabel = tickLabels[i];
        canvas.drawText(this.ctx, tickLabel, cx, cy, rad, drawTickTextStyle);
      }

      filters.forEach(filter => {
        const halfWidth = axesStyle.filter.width / 2;
        const x = bound.x + axisStart.x + (isHorizontal ? -halfWidth : filter.p0);
        const y = bound.y + axisStart.y + (isHorizontal ? filter.p0 : -halfWidth);
        const w = isHorizontal ? axesStyle.filter.width : filter.p1 - filter.p0;
        const h = isHorizontal ? filter.p1 - filter.p0 : axesStyle.filter.width;
        canvas.drawRect(this.ctx, x, y, w, h, axesStyle.filter);
      });
    });

    // console.timeEnd('render time');
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

  private handleMouseDown(e: MouseEvent): void {
    if (!this._) return;

    const [ x, y ] = [ e.clientX, e.clientY ];
    const _drag = this.drag;
    const _filter = this.filters;
    const _drs = this.drag.shared;
    const _drd = this.drag.dimension;
    const _drf = this.drag.filters;
    const _dl = this._.dims.list;
    const isHorizontal = this.options.direction === t.Direction.Horizontal;
    const filterKey = isHorizontal ? 'y' : 'x';

    this._.dims.list.forEach((dim, i) => {
      // Check to see if a dimension label was targeted.
      const labelBoundary = dim.layout.labelBoundary;
      if (
        isPointInTriangle({ x, y }, labelBoundary[0], labelBoundary[1], labelBoundary[2]) ||
        isPointInTriangle({ x, y }, labelBoundary[2], labelBoundary[3], labelBoundary[0])
      ) {
        _drag.type = t.DragType.DimensionLabel;
        _drd.bound0 = _dl[i].layout.bound;
        _drs.index = i;
        _drs.p0 = { x, y };
        _drs.p1 = { x, y };
      }

      // Check to see if a dimension axis was targeted.
      const bound = dim.layout.bound;
      const axisStart = dim.layout.axisStart;
      const axisStop = dim.layout.axisStop;
      const axisBoundary = dim.layout.axisBoundary;
      if (
        isPointInTriangle({ x, y }, axisBoundary[0], axisBoundary[1], axisBoundary[2]) ||
        isPointInTriangle({ x, y }, axisBoundary[2], axisBoundary[3], axisBoundary[0])
      ) {
        _drag.type = t.DragType.DimensionFilterCreate;
        _drs.index = i;
        _drs.p0 = { x, y };
        _drs.p1 = { x, y };
        _drf.key = this.dimensions[i].key;

        const p0 = _drs.p0[filterKey] - bound[filterKey] - axisStart[filterKey];
        const value0 = ix.getAxisPositionValue(
          p0,
          axisStop[filterKey] - axisStart[filterKey],
          this.dimensions[i].axis.scale,
        );
        _drf.active = { p0, p1: p0, value0, value1: value0 };

        // Store active filter into filter list.
        _filter[_drf.key] = _filter[_drf.key] || [];
        _filter[_drf.key].push(_drf.active);
      }
    });
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this._) return;

    const [ x, y ] = [ e.clientX, e.clientY ];
    const _drag = this.drag;
    const _drs = this.drag.shared;
    const _drd = this.drag.dimension;
    const _drf = this.drag.filters;
    const _dl = this._.dims.list;
    const isHorizontal = this.options.direction === t.Direction.Horizontal;
    const filterKey = isHorizontal ? 'y' : 'x';

    _drs.p1 = { x, y };
    _drd.offset = {
      x: isHorizontal ? _drs.p1.x - _drs.p0.x : 0,
      y: isHorizontal ? 0 : _drs.p1.y - _drs.p0.y,
    };
    _drd.bound1 = _drd.bound0 ? shiftRect(_drd.bound0, _drd.offset) : undefined;

    for (let i = 0; i < _dl.length; i++) {
      const layout = _dl[i].layout;

      /**
       * Check that...
       * 1. dimension drag type is triggered by the label
       * 2. dimension being dragged isn't being the dimension getting compared to (i)
       * 3. dimension doesn't intersect
       */
      if (
        _drag.type === t.DragType.DimensionLabel &&
        _drs.index !== i && _drd.bound1 &&
        percentRectIntersection(_drd.bound1, layout.bound) > 0.4
      ) {
        // Swap dragging dimension with the dimension it intersects with.
        const tempDim = this.dimensions[_drs.index];
        this.dimensions[_drs.index] = this.dimensions[i];
        this.dimensions[i] = tempDim;

        // Update the drag dimension shared..
        _drs.index = i;
      }
    }

    // Update dimension filter creating dragging data.
    if (_drag.type === t.DragType.DimensionFilterCreate && _drf.key) {
      const bound = _dl[_drs.index].layout.bound;
      const axisStart = _dl[_drs.index].layout.axisStart;
      const axisStop = _dl[_drs.index].layout.axisStop;
      _drf.active.p1 = _drs.p1[filterKey] - bound[filterKey] - axisStart[filterKey];
      _drf.active.value1 = ix.getAxisPositionValue(
        _drf.active.p1,
        axisStop[filterKey] - axisStart[filterKey],
        this.dimensions[_drs.index].axis.scale,
      );
    }

    this.calculate();
  }

  private handleMouseUp(e: MouseEvent): void {
    if (!this._ || this.drag.type === t.DragType.None) return;

    const [ x, y ] = [ e.clientX, e.clientY ];
    const _drag = this.drag;
    const _drs = this.drag.shared;
    const _drf = this.drag.filters;
    const _dl = this._.dims.list;
    const isHorizontal = this.options.direction === t.Direction.Horizontal;
    const filterKey = isHorizontal ? 'y' : 'x';

    _drs.p1 = { x, y };

    if (_drag.type === t.DragType.DimensionFilterCreate && _drf.key) {
      // Update filter data before removing reference.
      const bound = _dl[_drs.index].layout.bound;
      const axisStart = _dl[_drs.index].layout.axisStart;
      const axisStop = _dl[_drs.index].layout.axisStop;
      _drf.active.p1 = _drs.p1[filterKey] - bound[filterKey] - axisStart[filterKey];
      _drf.active.value1 = ix.getAxisPositionValue(
        _drf.active.p1,
        axisStop[filterKey] - axisStart[filterKey],
        this.dimensions[_drs.index].axis.scale,
      );

      // Swap p0 and p1 if p1 is less than p0.
      if (_drf.active.p1 < _drf.active.p0) {
        const [ tempP, tempValue ] = [ _drf.active.p1, _drf.active.value1 ];
        [ _drf.active.p1, _drf.active.value1 ] = [ _drf.active.p0, _drf.active.value0 ];
        [ _drf.active.p0, _drf.active.value0 ] = [ tempP, tempValue ];
      }

      // Overwrite active filter to remove reference to filter in filters list.
      _drf.active = DEFAULT.FILTER;
      _drf.key = undefined;
    }

    // Reset drag info.
    this.drag = clone(DEFAULT.DRAG);

    this.mergeFilters();
    this.calculate();
  }
}

export default Hermes;
