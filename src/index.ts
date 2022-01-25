import { deepmerge } from 'deepmerge-ts';
import CategoricalScale from './classes/CategoricalScale';
import HermesError from './classes/HermesError';
import LinearScale from './classes/LinearScale';
import LogScale from './classes/LogScale';
import NiceScale from './classes/NiceScale';
import * as DEFAULT from './defaults';
import * as t from './types';
import {
  drawCircle, drawData, drawLine, drawRect, drawText, getFont, getTextSize, normalizePadding,
} from './utils/canvas';
import { rgba2str, rgbaFromGradient, str2rgba } from './utils/color';
import { getDataRange } from './utils/data';
import { getElement } from './utils/dom';
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
        padding: normalizePadding(this.options.style.padding),
      },
    };

    const { h, w } = this.size;
    const isHorizontal = this.options.direction === t.Direction.Horizontal;
    const dimLabelStyle = this.options.style.dimension.label;
    const dimLayout = this.options.style.dimension.layout;
    const axesLabelStyle = this.options.style.axes.label;
    const isLabelBefore = dimLabelStyle.placement === t.LabelPlacement.Before;
    const isLabelAngled = dimLabelStyle.angle != null;
    const isAxesBefore = axesLabelStyle.placement === t.LabelPlacement.Before;
    const dimCount = this.dimensions.length;

    const _l = _.layout;
    const _dsa = _.dims.shared.axes;
    const _dsl = _.dims.shared.label;
    const _dsly = _.dims.shared.layout;

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
    _dsl.maxLengthCos = 0;
    _dsl.maxLengthSin = 0;
    this.dimensions.forEach((dimension, i) => {
      const textSize = getTextSize(this.ctx, dimension.label, dimLabelStyle.font);
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
          const size = getTextSize(this.ctx, tickLabel, axesLabelStyle.font);
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
      _dlily.spaceOffset = _dlily.spaceAfter - _dlily.spaceBefore;

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
    for (let i = 0; i < dimCount; i++) {
      const _dlily = _.dims.list[i].layout;

      if (isHorizontal) {
        if (dimLayout === t.DimensionLayout.AxisEvenlySpaced) {
          _dlily.bound.x = _dsly.offset + i * _dsly.space + _dsly.space / 2 - _dlily.spaceBefore;
        } else if (dimLayout === t.DimensionLayout.Equidistant) {
          _dlily.bound.x = _dsly.offset + i * _dsly.space + (_dsly.space - _dlily.bound.w) / 2;
        } else if (dimLayout === t.DimensionLayout.EvenlySpaced) {
          _dlily.bound.x = traversed;
        }
        _dlily.axisStart = { x: _dlily.spaceBefore, y: _dsa.start - _l.padding[0] };
        _dlily.axisStop = { x: _dlily.spaceBefore, y: _dsa.stop - _l.padding[0] };
        _dlily.labelPoint = {
          x: _dlily.spaceBefore,
          y: isLabelBefore
            ? _dsa.start - dimLabelStyle.offset - _l.padding[0]
            : _dsa.stop + dimLabelStyle.offset - _l.padding[0],
        };
        traversed += _dsly.gap + _dlily.bound.w;
      } else {
        if (dimLayout === t.DimensionLayout.AxisEvenlySpaced) {
          _dlily.bound.y = _dsly.offset + i * _dsly.space + _dsly.space / 2 - _dlily.spaceBefore;
        } else if (dimLayout === t.DimensionLayout.Equidistant) {
          _dlily.bound.y = _dsly.offset + i * _dsly.space + (_dsly.space - _dlily.bound.h) / 2;
        } else if (dimLayout === t.DimensionLayout.EvenlySpaced) {
          _dlily.bound.y = traversed;
        }
        _dlily.axisStart = { x: _dsa.start - _l.padding[3], y: _dlily.spaceBefore };
        _dlily.axisStop = { x: _dsa.stop - _l.padding[3], y: _dlily.spaceBefore };
        _dlily.labelPoint = {
          x: isLabelBefore
            ? _dsa.start - dimLabelStyle.offset - _l.padding[1]
            : _dsa.stop + dimLabelStyle.offset - _l.padding[1],
          y: _dlily.spaceBefore,
        };
        traversed += _dsly.gap + _dlily.bound.h;
      }
    }

    this._ = _;

    this.drawDebugOutline();
    this.draw();
  }

  private draw(): void {
    if (!this._) return;

    const { h, w } = this.size;
    const _l = this._.layout;
    const _dl = this._.dims.list;
    const isHorizontal = this.options.direction === t.Direction.Horizontal;
    const axesStyle = this.options.style.axes;
    const dataStyle = this.options.style.data;
    const dimStyle = this.options.style.dimension;
    const isDimBefore = dimStyle.label.placement === t.LabelPlacement.Before;
    const isAxesBefore = axesStyle.label.placement === t.LabelPlacement.Before;

    // Draw data lines.
    const dataLineStyle: t.StyleLine = {
      strokeStyle: dataStyle.color || DEFAULT.STROKE_STYLE,
      lineWidth: dataStyle.width,
    };
    const dimColorKey = dataStyle.colorScale?.dimensionKey;
    const maxColor = str2rgba(dataStyle.colorScale?.maxColor || DEFAULT.STROKE_STYLE);
    const minColor = str2rgba(dataStyle.colorScale?.minColor || DEFAULT.STROKE_STYLE);
    for (let i = 0; i < this.dataCount; i++) {
      const series = this.dimensions.map((dimension, j) => {
        const key = dimension.key;
        const layout = _dl[j].layout;
        const value = this.data[key][i];
        const pos = dimension.axis.scale?.valueToPos(value) || 0;
        const x = layout.bound.x + layout.axisStart.x;
        const y = layout.bound.y + layout.axisStart.y + pos;

        if (dimColorKey === key) {
          const percent = dimension.axis.scale?.valueToPercent(value) || 0;
          const scaleColor = rgbaFromGradient(minColor, maxColor, percent);
          dataLineStyle.strokeStyle = rgba2str(scaleColor);
        }

        return { x, y };
      });

      drawData(this.ctx, series, dataLineStyle);
    }

    // Draw dimension labels.
    const dimTextStyle: t.StyleText = {
      fillStyle: dimStyle.label.color,
      font: getFont(dimStyle.label.font),
    };
    if (dimStyle.label.angle == null) {
      dimTextStyle.textAlign = isHorizontal ? 'center' : undefined;
      dimTextStyle.textBaseline = isHorizontal ? (isDimBefore ? 'bottom' : 'top') : undefined;
    }
    const rad = dimStyle.label.angle || (isHorizontal ? 0 : (isDimBefore ? -Math.PI : 0));
    this.dimensions.forEach((dimension, i) => {
      const bound = _dl[i].layout.bound;
      const labelPoint = _dl[i].layout.labelPoint;
      const x = bound.x + labelPoint.x;
      const y = bound.y + labelPoint.y;
      drawText(this.ctx, dimension.label, x, y, rad, dimTextStyle);
    });

    // Draw dimension axes.
    const drawAxesStyle: t.StyleLine = {
      lineWidth: axesStyle.axis.width,
      strokeStyle: axesStyle.axis.color,
    };
    const drawTickStyle: t.StyleLine = {
      lineWidth: axesStyle.tick.width,
      strokeStyle: axesStyle.tick.color,
    };
    const drawTickTextStyle: t.StyleText = {
      fillStyle: axesStyle.label.color,
      font: getFont(axesStyle.label.font),
    };
    if (axesStyle.label.angle == null) {
      drawTickTextStyle.textAlign = isHorizontal ? undefined : 'center';
      drawTickTextStyle.textBaseline = isHorizontal ? undefined : (isAxesBefore ? 'bottom' : 'top');
    }
    _dl.forEach(dim => {
      const bound = dim.layout.bound;
      const axisStart = dim.layout.axisStart;
      const axisStop = dim.layout.axisStop;
      const tickLabels = dim.axes.tickLabels;
      const tickPos = dim.axes.tickPos;
      const tickLengthFactor = isAxesBefore ? -1 : 1;

      drawLine(
        this.ctx,
        bound.x + axisStart.x,
        bound.y + axisStart.y,
        bound.x + axisStop.x,
        bound.y + axisStop.y,
        drawAxesStyle,
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
        drawLine(this.ctx, x0, y0, x1, y1, drawTickStyle);

        const cx = isHorizontal ? x1 + tickLengthFactor * axesStyle.label.offset : x0;
        const cy = isHorizontal ? y0 : y1 + tickLengthFactor * axesStyle.label.offset;
        const rad = axesStyle.label.angle != null
          ? axesStyle.label.angle
          : (isHorizontal && isAxesBefore ? Math.PI : 0);
        const tickLabel = tickLabels[i];
        drawText(this.ctx, tickLabel, cx, cy, rad, drawTickTextStyle);
      }
    });
  }

  private drawDebugOutline(): void {
    if (!this._) return;

    const { h, w } = this.size;
    const _l = this._.layout;
    const _dl = this._.dims.list;
    const _dsl = this._.dims.shared.layout;
    const isHorizontal = this.options.direction === t.Direction.Horizontal;

    // Draw the drawing area by outlining paddings.
    const paddingStyle = { strokeStyle: '#dddddd' };
    drawLine(this.ctx, 0, _l.padding[0], w, _l.padding[0], paddingStyle);
    drawLine(this.ctx, 0, h - _l.padding[2], w, h - _l.padding[2], paddingStyle);
    drawLine(this.ctx, _l.padding[3], 0, _l.padding[3], h, paddingStyle);
    drawLine(this.ctx, w - _l.padding[1], 0, w - _l.padding[1], h, paddingStyle);

    // Draw each dimension rough outline with bounding box.
    _dl.forEach((dim, i) => {
      const bound = dim.layout.bound;
      const labelPoint = dim.layout.labelPoint;
      const dimStyle = { strokeStyle: '#999999' };
      const boundStyle = { strokeStyle: '#dddddd' };
      const labelPointStyle = { fillStyle: '#00ccff', strokeStyle: '#0099cc' };

      drawRect(
        this.ctx,
        isHorizontal ? _l.padding[3] + i * _dsl.space : bound.x,
        isHorizontal ? bound.y : _l.padding[0] + i * _dsl.space,
        isHorizontal ? _dsl.space : bound.w,
        isHorizontal ? bound.h : _dsl.space,
        dimStyle,
      );
      drawRect(this.ctx, bound.x, bound.y, bound.w, bound.h, boundStyle);
      drawCircle(this.ctx, bound.x + labelPoint.x, bound.y + labelPoint.y, 3, labelPointStyle);
    });
  }
}

export default Hermes;
