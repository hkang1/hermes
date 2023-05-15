import CategoricalScale from './classes/CategoricalScale';
import HermesError from './classes/HermesError';
import LinearScale from './classes/LinearScale';
import LogScale from './classes/LogScale';
import NiceScale from './classes/NiceScale';
import * as DEFAULT from './defaults';
import * as t from './types';
import * as canvas from './utils/canvas';
import { scale2rgba } from './utils/color';
import * as d from './utils/data';
import { getElement, getMousePoint } from './utils/dom';
import { throttle } from './utils/event';
import * as ix from './utils/interaction';
import { distance, isPointInTriangle } from './utils/math';
import { truncate } from './utils/string';
import * as tester from './utils/tester';

export * from './types';

class Hermes {
  protected element: HTMLElement;
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected config: t.Config = DEFAULT.HERMES_CONFIG;
  protected data: t.Data = {};
  protected dataInfo: t.InternalDataInfo = {
    hasInfinity: false,
    hasNaN: false,
    seriesCount: 0,
  };
  protected dimensions: t.InternalDimension[] = [];
  protected dimensionsOriginal: t.Dimension[] = [];
  protected filters: t.Filters = {};
  protected resizeObserver: ResizeObserver | undefined;
  protected size: t.Size = { h: 0, w: 0 };
  protected ix: t.IX = d.clone(DEFAULT.IX);
  protected listeners: t.InternalListeners;
  protected _?: t.Internal = undefined;

  constructor(
    target: HTMLElement | string,
    dimensions?: t.Dimension[],
    config?: t.RecursivePartial<t.Config>,
    data?: t.DataRaw,
  ) {
    const element = getElement(target);
    if (!element) throw new HermesError('Target element selector did not match anything.');
    this.element = element;

    const rect = this.element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      throw new HermesError('Target element width and height must both be greater than 0px.');
    }

    // Create a canvas and append it to the target element. Only if there isn't an existing one.
    const canvases = this.element.querySelectorAll('canvas');
    if (canvases.length === 0) {
      this.canvas = document.createElement('canvas');
      this.element.appendChild(this.canvas);
    } else {
      this.canvas = canvases[0];
    }

    // Get canvas context.
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new HermesError('Unable to get context from target element.');
    this.ctx = ctx;

    if (dimensions) this.setDimensions(dimensions, false);
    if (config) this.setConfig(config, false);
    if (data) this.setData(data, false);
    if (dimensions || config || data) this.redraw();

    // Define listeners up front, but don't start listening yet.
    this.listeners = {
      dblclick: this.handleDoubleClick.bind(this),
      mousedown: this.handleMouseDown.bind(this),
      mousemove: this.config.interactions.throttleDelayMouseMove === 0
        ? this.handleMouseMove.bind(this)
        : throttle(
          (e) => this.handleMouseMove.bind(this)(e as MouseEvent),
          this.config.interactions.throttleDelayMouseMove,
        ),
      mouseup: this.handleMouseUp.bind(this),
    };

    // Enable chart
    this.enable();
  }

  static deepMerge<T extends t.NestedObject>(...objects: T[]): T {
    return d.deepMerge(...objects);
  }

  static getTester(): tester.Tester {
    return tester;
  }

  static validateData(data: t.DataRaw, dimensions: t.Dimension[]): t.ValidationData {
    const validation = { count: 0, message: '', valid: true };
    const keys = Object.keys(data);
    const values = Object.values(data);

    for (let i = 0; i < values.length; i++) {
      const value = values[i];

      // All the dimension data should be equal in size.
      if (i === 0) {
        validation.count = value.length;
      } else if (value.length !== validation.count) {
        validation.message = 'The dimension data are not uniform in size.';
        validation.valid = false;
        return validation;
      }

      // Data should not contain null or undefined.
      if (value.findIndex(data => data == null) !== -1) {
        const isNull = value === null;
        validation.message = `Data for "${keys[i]}" has ${isNull ? 'null' : 'undefined'}`;
        validation.valid = false;
        return validation;
      }
    }

    // Check that the data as all of the dimension keys.
    const dataKeys = Object.keys(data);
    for (let j = 0; j < dimensions.length; j++) {
      const dimensionKey = dimensions[j].key;
      if (!dataKeys.includes(dimensionKey)) {
        validation.message = `Data for "${dimensionKey} is missing.`;
        validation.valid = false;
        return validation;
      }
    }

    return validation;
  }

  static validateDimension(dimension: t.Dimension): t.Validation {
    if (dimension.type === t.DimensionType.Categorical) {
      if (!dimension.categories || dimension.categories.length === 0) return {
        message: `Categorical dimension "${dimension.key}" is missing "categories".`,
        valid: false,
      };
    } else if (dimension.type === t.DimensionType.Logarithmic) {
      if (dimension.logBase == null || dimension.logBase === 0) return {
        message: `Logarithmic dimension "${dimension.key}" is missing "logBase".`,
        valid: false,
      };
    }
    return { message: '', valid: true };
  }

  static validateDimensions(dimensions: t.Dimension[]): t.Validation {
    if (dimensions.length === 0) {
      return { message: 'Need at least one dimension defined.', valid: false };
    }

    for (let i = 0; i < dimensions.length; i++) {
      const { message, valid } = Hermes.validateDimension(dimensions[i]);
      if (!valid) return { message, valid };
    }

    return { message: '', valid: true };
  }

  public setConfig(config: t.RecursivePartial<t.Config> = {}, redraw = true): void {
    // Set config early as setSize references it early.
    this.config = d.deepMerge(DEFAULT.HERMES_CONFIG, config) as t.Config;

    // Re-add observers as config impacts the throttling of the observer handlers.
    this.addObservers();

    if (redraw) this.redraw();
  }

  public setData(data: t.DataRaw, redraw = true): void {
    const dataValidation = Hermes.validateData(data, this.dimensionsOriginal);
    if (!dataValidation.valid) throw new HermesError(dataValidation.message);

    this.data = data as t.Data;
    this.dataInfo = d.processData(this.data);
    this.setDimensions(this.dimensionsOriginal, false);

    if (redraw) this.redraw();
  }

  public setDimensions(dimensions: t.Dimension[], redraw = true): void {
    // Validate that the dimensions are set properly.
    const dimValidation = Hermes.validateDimensions(dimensions);
    if (!dimValidation.valid) throw new HermesError(dimValidation.message);

    const direction = this.config.direction === t.Direction.Horizontal
      ? t.Direction.Vertical
      : t.Direction.Horizontal;
    this.dimensionsOriginal = dimensions;
    this.dimensions = d.clone(dimensions).map(dimension => {
      const key = dimension.key;
      const data = this.data[key] || [];
      const internal: t.InternalDimension = {
        ...dimension,
        labelTruncated: truncate(
          dimension.label,
          { size: this.config.style.dimension.label.truncate },
        ),
        rangeActual: undefined,
        rangeFinite: undefined,
        scale: new LinearScale(direction, 0, 100, 0, 100),
      };

      if (
        dimension.type === t.DimensionType.Linear ||
        dimension.type === t.DimensionType.Logarithmic
      ) {
        const range = d.getDataRange(data, dimension.type);
        if (dimension.type === t.DimensionType.Linear) {
          internal.scale = new LinearScale(
            direction,
            range.finite[0],
            range.finite[1],
            range.actual[0],
            range.actual[1],
            dimension,
          );
        } else if (dimension.type === t.DimensionType.Logarithmic) {
          internal.scale = new LogScale(
            direction,
            range.finite[0],
            range.finite[1],
            range.actual[0],
            range.actual[1],
            dimension.logBase,
            dimension,
          );
        }
      } else if (dimension.type === t.DimensionType.Categorical) {
        internal.scale = new CategoricalScale(
          direction,
          dimension.categories,
          dimension,
        );
      }

      return internal;
    });

    if (redraw) this.redraw();
  }

  public setSize(w: number, h: number, redraw = true): void {
    const oldSize = { h: this.size.h, w: this.size.w };
    const width = Math.round(w * devicePixelRatio);
    const height = Math.round(h * devicePixelRatio);

    // Increase actual canvas size.
    this.canvas.width = width;
    this.canvas.height = height;

    // Scale everything down using CSS.
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    // Update record of size.
    this.size = { h: height, w: width };

    // Make hook callback.
    this.config.hooks.onResize?.(d.clone(this.size), oldSize);

    if (redraw) this.redraw();
  }

  public disable(): void {
    this.removeListeners();
    this.removeObservers();

    // Clear out any intermediate focus or interactive states.
    this.ix = d.clone(DEFAULT.IX);
    this.updateCursor();
    this.redraw();
  }

  public enable(): void {
    this.addListeners();
    this.addObservers();
  }

  public redraw(): void {
    if (this.size.w === 0 && this.size.h === 0) return;
    this.calculate();
    this.clear();
    if (this.config.debug) this.drawDebugOutline();
    this.draw();
  }

  public destroy(): void {
    this.removeListeners();
    this.removeObservers();

    if (this.canvas && this.element.contains(this.canvas)) {
      this.element.removeChild(this.canvas);
    }
  }

  protected addListeners(): void {
    this.element.addEventListener('dblclick', this.listeners.dblclick);
    this.element.addEventListener('mousedown', this.listeners.mousedown);
    window.addEventListener('mousemove', this.listeners.mousemove);
    window.addEventListener('mouseup', this.listeners.mouseup);
  }

  protected addObservers(): void {
    // Clear out previously setup resize observer.
    if (this.resizeObserver) {
      this.resizeObserver.unobserve(this.element);
      this.resizeObserver = undefined;
    }

    // Define and add resize observer.
    this.resizeObserver = new ResizeObserver(
      this.config.interactions.throttleDelayResize === 0
        ? this.handleResize.bind(this)
        : throttle(
          entries => this.handleResize.bind(this)(entries as ResizeObserverEntry[]),
          this.config.interactions.throttleDelayResize,
        ),
    );
    this.resizeObserver.observe(this.element);
  }

  protected removeListeners(): void {
    this.element.removeEventListener('dblclick', this.listeners.dblclick);
    this.element.removeEventListener('mousedown', this.listeners.mousedown);
    window.removeEventListener('mousemove', this.listeners.mousemove);
    window.removeEventListener('mouseup', this.listeners.mouseup);
  }

  protected removeObservers(): void {
    this.resizeObserver?.unobserve(this.element);
    this.resizeObserver = undefined;
  }

  protected calculate(): void {
    this.calculateLayout();
    this.calculateStyles();
  }

  protected calculateLayout(): void {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const _: any = {
      dims: {
        list: new Array(this.dimensions.length)
          .fill(undefined)
          .map(() => ({ axes: {}, label: {}, layout: {} })),
        map: this.dimensions.reduce((acc, dimension, index) => {
          acc[dimension.key] = index;
          return acc;
        }, {} as Record<t.DimensionKey, number>),
        shared: { axes: {}, label: {}, layout: {} },
      },
      layout: {
        drawRect: {},
        padding: canvas.normalizePadding(this.config.style.padding),
      },
    };

    const { h, w } = this.size;
    const _l = _.layout;
    const _dsa = _.dims.shared.axes;
    const _dsl = _.dims.shared.label;
    const _dsly = _.dims.shared.layout;
    const dimCount = this.dimensions.length;
    const isHorizontal = this.config.direction === t.Direction.Horizontal;
    const dimLabelStyle = this.config.style.dimension.label;
    const dimLabelBoundaryPadding = this.config.style.dimension.label.boundaryPadding;
    const dimLayout = this.config.style.dimension.layout;
    const axesLabelStyle = this.config.style.axes.label;
    const axisStyle = this.config.style.axes.axis;
    const axisBoundaryPadding = this.config.style.axes.axis.boundaryPadding;
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
      const textSize = canvas.getTextSize(this.ctx, dimension.labelTruncated, dimLabelStyle.font);
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
    _dsa.start = _dsa.stop = 0;
    _dsa.startInfinity = _dsa.stopInfinity = _dsa.startNaN = _dsa.stopNaN = undefined;
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
      _dsa.stopNaN = this.dataInfo.hasNaN ? _dsa.stop : undefined;
      _dsa.startInfinity = _dsa.start;
      _dsa.stopInfinity = _dsa.stop - (this.dataInfo.hasNaN ? axisStyle.nanGap : 0);
      _dsa.startData = _dsa.startInfinity + (this.dataInfo.hasInfinity ? axisStyle.infOffset : 0);
      _dsa.stopData = _dsa.stopInfinity - (this.dataInfo.hasInfinity ? axisStyle.infOffset : 0);
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
      _dsa.startNaN = this.dataInfo.hasNaN ? _dsa.start : undefined;
      _dsa.startInfinity = _dsa.start + (this.dataInfo.hasNaN ? axisStyle.nanGap : 0);
      _dsa.stopInfinity = _dsa.stop;
      _dsa.startData = _dsa.startInfinity + (this.dataInfo.hasInfinity ? axisStyle.infOffset : 0);
      _dsa.stopData = _dsa.stopInfinity - (this.dataInfo.hasInfinity ? axisStyle.infOffset : 0);
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
        scale.setAxisLength(_dsa.stopData - _dsa.startData);

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
      if (isLabelAngled) {
        _dlily.spaceBefore = isHorizontal
          ? (_dlil.lengthCos < 0 ? -_dlil.lengthCos : 0)
          : (_dlil.lengthSin > 0 ? _dlil.lengthSin : 0);
        _dlily.spaceAfter = isHorizontal
          ? (_dlil.lengthCos > 0 ? _dlil.lengthCos : 0)
          : (_dlil.lengthSin < 0 ? -_dlil.lengthSin : 0);
      } else {
        _dlily.spaceBefore = (isHorizontal ? _dlil.lengthCos : _dlil.lengthSin) / 2;
        _dlily.spaceAfter = (isHorizontal ? _dlil.lengthCos : _dlil.lengthSin) / 2;
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
      const totalGapWidth = _l.drawRect.w - _dsly.totalBoundSpace;
      _dsly.gap = dimCount > 1 ? Math.max(totalGapWidth, 0) / (dimCount - 1) : 0;
      _dsly.offset = _l.padding[3];
      _dsly.space = dimCount > 1 ? _l.drawRect.w / (dimCount - 1) : 0;
    } else {
      const totalGapHeight = _l.drawRect.h - _dsly.totalBoundSpace;
      _dsly.gap = dimCount > 1 ? Math.max(totalGapHeight, 0) / (dimCount - 1) : 0;
      _dsly.offset = _l.padding[0];
      _dsly.space = dimCount > 1 ? _l.drawRect.h / (dimCount - 1) : 0;
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
          _dlily.bound.x = traversed - _dlily.spaceBefore;
          traversed += _dsly.space;
        } else if (dimLayout === t.DimensionLayout.Equidistant) {
          _dlily.bound.x = traversed;
          traversed += _dsly.gap + _dlily.bound.w;
        }
        _dlily.axisBoundaryStart = { x: _dlily.spaceBefore, y: _dsa.start - _l.padding[0] };
        _dlily.axisBoundaryStop = { x: _dlily.spaceBefore, y: _dsa.stop - _l.padding[0] };
        _dlily.axisInfinityStart = { x: _dlily.spaceBefore, y: _dsa.startInfinity - _l.padding[0] };
        _dlily.axisInfinityStop = { x: _dlily.spaceBefore, y: _dsa.stopInfinity - _l.padding[0] };
        _dlily.axisDataStart = { x: _dlily.spaceBefore, y: _dsa.startData - _l.padding[0] };
        _dlily.axisDataStop = { x: _dlily.spaceBefore, y: _dsa.stopData - _l.padding[0] };
        _dlily.labelPoint = {
          x: _dlily.spaceBefore,
          y: isLabelBefore
            ? _dsa.start - dimLabelStyle.offset - _l.padding[0]
            : _dsa.stop + dimLabelStyle.offset - _l.padding[0],
        };
      } else {
        if (dimLayout === t.DimensionLayout.AxisEvenlySpaced) {
          _dlily.bound.y = traversed - _dlily.spaceBefore;
          traversed += _dsly.space;
        } else if (dimLayout === t.DimensionLayout.Equidistant) {
          _dlily.bound.y = traversed;
          traversed += _dsly.gap + _dlily.bound.h;
        }
        _dlily.axisBoundaryStart = { x: _dsa.start - _l.padding[3], y: _dlily.spaceBefore };
        _dlily.axisBoundaryStop = { x: _dsa.stop - _l.padding[3], y: _dlily.spaceBefore };
        _dlily.axisInfinityStart = { x: _dsa.startInfinity - _l.padding[3], y: _dlily.spaceBefore };
        _dlily.axisInfinityStop = { x: _dsa.stopInfinity - _l.padding[3], y: _dlily.spaceBefore };
        _dlily.axisDataStart = { x: _dsa.startData - _l.padding[3], y: _dlily.spaceBefore };
        _dlily.axisDataStop = { x: _dsa.stopData - _l.padding[3], y: _dlily.spaceBefore };
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
          x: _dlily.bound.x + _dlily.axisBoundaryStart.x - (isHorizontal ? axisBoundaryPadding : 0),
          y: _dlily.bound.y + _dlily.axisBoundaryStart.y - (isHorizontal ? 0 : axisBoundaryPadding),
        },
        {
          x: _dlily.bound.x + _dlily.axisBoundaryStart.x + (isHorizontal ? axisBoundaryPadding : 0),
          y: _dlily.bound.y + _dlily.axisBoundaryStart.y + (isHorizontal ? 0 : axisBoundaryPadding),
        },
        {
          x: _dlily.bound.x + _dlily.axisBoundaryStop.x + (isHorizontal ? axisBoundaryPadding : 0),
          y: _dlily.bound.y + _dlily.axisBoundaryStop.y + (isHorizontal ? 0 : axisBoundaryPadding),
        },
        {
          x: _dlily.bound.x + _dlily.axisBoundaryStop.x - (isHorizontal ? axisBoundaryPadding : 0),
          y: _dlily.bound.y + _dlily.axisBoundaryStop.y - (isHorizontal ? 0 : axisBoundaryPadding),
        },
      ];
    }

    this._ = _;
  }

  protected calculateStyles(): void {
    if (!this._) return;

    this._.styles = this._.styles || [];

    const _os = this.config.style;
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
      const isAxisActive = (
        _ixsa.type === t.ActionType.FilterCreate ||
        _ixsa.type === t.ActionType.FilterMove ||
        _ixsa.type === t.ActionType.FilterResizeAfter ||
        _ixsa.type === t.ActionType.FilterResizeBefore
      ) && _ixsa.dimIndex === i;
      const isAxisFocused = (
        _ixsf?.type === t.FocusType.DimensionAxis ||
        _ixsf?.type === t.FocusType.Filter ||
        _ixsf?.type === t.FocusType.FilterResize
      ) && _ixsf?.dimIndex === i;

      _s[i] = _s[i] || {};
      _s[i].label = {
        ..._osd.label,
        ...(!isDimActive && isDimFocused && !isActive ? _osd.labelHover : {}),
        ...(isDimActive ? _osd.labelActive : {}),
      };

      _s[i].axis = {
        ..._osa.axis,
        ...(!isAxisActive && isAxisFocused && !isActive ? _osa.axisHover : {}),
        ...(isAxisActive ? _osa.axisActive : {}),
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
        const isFilterAxisHover = isAxisActive || (isAxisFocused && !isFilterFocused);
        const isFilterHover = isFilterFocused && _ixsa.filterIndex === undefined;
        const isFilterActive = _ixsa.dimIndex === i && _ixsa.filterIndex === j;
        return {
          ..._osa.filter,
          ...(isFilterAxisHover ? _osa.filterAxisHover : {}),
          ...(isFilterHover ? _osa.filterHover : {}),
          ...(isFilterActive ? _osa.filterActive : {}),
        };
      });
    }
  }

  protected getFocusByPoint(point: t.Point): t.Focus | undefined {
    if (!this._) return;

    const _dsa = this._.dims.shared.axes;
    const isHorizontal = this.config.direction === t.Direction.Horizontal;
    const vKey = isHorizontal ? 'y' : 'x';
    const axisLength = this._.dims.shared.axes.length;
    for (let i = 0; i < this._.dims.list.length; i++) {
      const key = this.dimensions[i].key;
      const layout = this._.dims.list[i].layout;

      // Check to see if a dimension label was targeted and that it is draggable.
      const labelBoundary = layout.labelBoundary;
      if ((
        isPointInTriangle(point, labelBoundary[0], labelBoundary[1], labelBoundary[2]) ||
        isPointInTriangle(point, labelBoundary[2], labelBoundary[3], labelBoundary[0])
      ) && !this.dimensions[i].disableDrag) {
        return { dimIndex: i, type: t.FocusType.DimensionLabel };
      }

      // Check to see if a dimension axis was targeted.
      const axisBoundary = layout.axisBoundary;
      if (
        isPointInTriangle(point, axisBoundary[0], axisBoundary[1], axisBoundary[2]) ||
        isPointInTriangle(point, axisBoundary[2], axisBoundary[3], axisBoundary[0])
      ) {
        const filters = this.filters[key] || [];
        const axisOffset = layout.bound[vKey] + layout.axisBoundaryStart[vKey];
        const p = (point[vKey] - axisOffset) / axisLength;
        const filterIndex = filters.findIndex(filter => p >= filter.p0 && p <= filter.p1);

        let type: t.EFocusType = t.FocusType.DimensionAxis;
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

  protected updateActiveLabel(): void {
    if (!this._ || this.ix.shared.action.type !== t.ActionType.LabelMove) return;

    const _dl = this._.dims.list;
    const _ix = this.ix;
    const _ixd = _ix.dimension;
    const _ixsa = _ix.shared.action;
    const isHorizontal = this.config.direction === t.Direction.Horizontal;
    const hKey = isHorizontal ? 'x' : 'y';

    _ixd.boundOffset = {
      x: isHorizontal ? _ixsa.p1.x - _ixsa.p0.x : 0,
      y: isHorizontal ? 0 : _ixsa.p1.y - _ixsa.p0.y,
    };

    let newIndex = -1;
    const dragPosition = _ixd.axis + _ixd.boundOffset[hKey];
    for (let i = 0; i < _dl.length; i++) {
      if (_ixsa.dimIndex === i || this.dimensions[i].disableDrag) continue;

      const layout = _dl[i].layout;
      const axisPosition = layout.bound[hKey] + layout.axisBoundaryStart[hKey];
      const axisDistance = Math.abs(dragPosition - axisPosition);
      const isNearAxis = axisDistance < ix.DIMENSION_SWAP_THRESHOLD;

      // Drag dimension came before the i-th dimension before drag started.
      if (_ixsa.dimIndex < i) {
        if (dragPosition < axisPosition && !isNearAxis) break;
        else newIndex = i;
      }

      // Drag dimension came after the i-th dimension before drag started.
      if (_ixsa.dimIndex > i) {
        if (dragPosition < axisPosition || isNearAxis) {
          newIndex = i;
          break;
        }
      }
    }

    // Take out drag dimension and insert into new order position.
    if (newIndex !== -1) {
      const oldIndex = _ixsa.dimIndex;
      const dragDimension = this.dimensions.splice(_ixsa.dimIndex, 1);
      if (dragDimension.length === 0) return;

      // Insert the extracted drag dimension into the dimensions list.
      this.dimensions.splice(newIndex, 0, dragDimension[0]);

      // Update the drag dimension's index
      _ixsa.dimIndex = newIndex;

      // Make hook callback.
      this.config.hooks.onDimensionMove?.(d.clone(dragDimension[0]), newIndex, oldIndex);
    }
  }

  protected setConfigFilters(filters: t.RecursivePartial<t.Filters> = {}): void {
    this.calculate();

    if (!this._) return;

    const dimensionIndexMap = this._.dims.map;

    // Read `filters` and convert it to internal filters.
    Object.keys(filters).forEach((dimensionKey) => {
      this.filters[dimensionKey] = this.config.filters[dimensionKey]
        .map((filter) => this.processConfigFilter(filter, dimensionIndexMap[dimensionKey]))
        .filter((filter) => filter != null) as t.Filter[];
    });

    // Redraw the chart with the newly initialized filters.
    this.redraw();
  }

  protected setActiveFilter(key: string, pos: number): void {
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
      _ixf.active = {
        ...DEFAULT.FILTER,
        p0: pos,
        p1: pos,
      };

      // Store active filter into filter list.
      _filters[key] = _filters[key] || [];
      _filters[key].push(_ixf.active);
      _ixsa.filterIndex = _filters[key].length - 1;
    }
  }

  protected updateActiveFilter(e: MouseEvent): void {
    if (!this._) return;

    const _dl = this._.dims.list;
    const _dsa = this._.dims.shared.axes;
    const _ix = this.ix;
    const _ixf = _ix.filters;
    const _ixs = _ix.shared;
    const _ixsa = _ixs.action;
    const _filters = this.filters;
    const index = _ixsa.dimIndex;
    const isHorizontal = this.config.direction === t.Direction.Horizontal;
    const filterKey = isHorizontal ? 'y' : 'x';
    const isFilterAction = (
      _ixsa.type === t.ActionType.FilterCreate ||
      _ixsa.type === t.ActionType.FilterMove ||
      _ixsa.type === t.ActionType.FilterResizeAfter ||
      _ixsa.type === t.ActionType.FilterResizeBefore
    );

    if (!isFilterAction || !_ixf.key) return;

    const dimensionKey = this.dimensions[_ixsa.dimIndex].key;
    const bound = _dl[_ixsa.dimIndex].layout.bound;
    const axisBoundaryStart = _dl[_ixsa.dimIndex].layout.axisBoundaryStart[filterKey];

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
      if (_ixf.active.p0 <= 0.0) {
        _ixf.active.p0 = 0;
        _ixf.active.p1 = startLength;
      } else if (_ixf.active.p1 >= 1.0) {
        _ixf.active.p0 = 1.0 - startLength;
        _ixf.active.p1 = 1.0;
      }
    } else if (_ixsa.type === t.ActionType.FilterResizeBefore) {
      _ixf.active.p0 = (_ixsa.p1[filterKey] - bound[filterKey] - axisBoundaryStart) / _dsa.length;
      _ixf.active.p0 = d.capDataRange(_ixf.active.p0, [ 0.0, 1.0 ]);
    } else {
      _ixf.active.p1 = (_ixsa.p1[filterKey] - bound[filterKey] - axisBoundaryStart) / _dsa.length;
      _ixf.active.p1 = d.capDataRange(_ixf.active.p1, [ 0.0, 1.0 ]);
    }

    this.processFilter(_ixf.active, index);

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
      if (removeIndex !== -1) {
        // Make hook callback.
        const filter = d.clone(filters[removeIndex]);
        this.config.hooks.onFilterRemove?.({ [dimensionKey]: [ filter ] });

        // Remove filter.
        filters.splice(removeIndex, 1);
      }
    } else {
      // Swap p0 and p1 if p1 is less than p0.
      if (_ixf.active.p1 < _ixf.active.p0) {
        const tempP = _ixf.active.p1;
        _ixf.active.p1 = _ixf.active.p0;
        _ixf.active.p0 = tempP;

        this.processFilter(_ixf.active, index);
      }

      const filters = { [dimensionKey]: [ d.clone(_ixf.active) ] };

      // Make corresponding filter hook callback.
      switch (_ixsa.type) {
        case t.ActionType.FilterCreate:
          this.config.hooks.onFilterCreate?.(filters);
          break;
        case t.ActionType.FilterMove:
          this.config.hooks.onFilterMove?.(filters);
          break;
        case t.ActionType.FilterResizeAfter:
        case t.ActionType.FilterResizeBefore:
          this.config.hooks.onFilterResize?.(filters);
          break;
      }
    }

    // Overwrite active filter to remove reference to filter in filters list.
    _ixf.active = { ...DEFAULT.FILTER };
    _ixf.key = undefined;

    this.cleanUpFilters();

    // Make hook call back with all of the filter changes.
    this.config.hooks?.onFilterChange?.(d.clone(this.filters));
  }

  protected getDimensionLayoutInfo(dimIndex: number): t.InternalDimensionLayoutInfo | undefined {
    if (!this._ || !this.dataInfo) return;

    const layout = this._.dims.list[dimIndex].layout;
    const isHorizontal = this.config.direction === t.Direction.Horizontal;
    const xLength = layout.axisBoundaryStop.x - layout.axisBoundaryStart.x;
    const yLength = layout.axisBoundaryStop.y - layout.axisBoundaryStart.y;
    const pStart = isHorizontal
      ? (layout.axisDataStart.y - layout.axisBoundaryStart.y) / yLength
      : (layout.axisDataStart.x - layout.axisBoundaryStart.x) / xLength;
    const pStop = isHorizontal
      ? (layout.axisDataStop.y - layout.axisBoundaryStart.y) / yLength
      : (layout.axisDataStop.x - layout.axisBoundaryStart.x) / xLength;
    const pLength = pStop - pStart;

    return {
      hasInfinity: this.dataInfo.hasInfinity,
      hasNaN: this.dataInfo.hasNaN,
      isHorizontal,
      layout,
      pLength,
      pStart,
      pStop,
      xLength,
      yLength,
    };
  }

  protected processFilter(filter: t.Filter, dimIndex: number): void {
    const i = this.getDimensionLayoutInfo(dimIndex);
    if (!i) return;

    const p0 = Math.min(filter.p0, filter.p1);
    const p1 = Math.max(filter.p0, filter.p1);

    if (i.hasInfinity) {
      if (i.isHorizontal) {
        const pi = (i.layout.axisInfinityStop.y - i.layout.axisBoundaryStart.y) / i.yLength;
        filter.hasPositiveInfinity = p0 === 0.0;
        filter.hasNegativeInfinity = p0 <= pi && p1 >= pi;
      } else {
        const pi = (i.layout.axisInfinityStart.x - i.layout.axisBoundaryStart.x) / i.xLength;
        filter.hasNegativeInfinity = p0 <= pi && p1 >= pi;
        filter.hasPositiveInfinity = p1 === 1.0;
      }
    }
    if (i.hasNaN) {
      filter.hasNaN = (i.isHorizontal && p1 === 1.0) || (!i.isHorizontal && p0 === 0.0);
    }

    if (p0 <= i.pStart) {
      filter.percent0 = 0.0;
    } else if (p0 > i.pStart && p0 <= i.pStop) {
      filter.percent0 = (p0 - i.pStart) / i.pLength;
    }
    if (p1 >= i.pStop) {
      filter.percent1 = 1.0;
    } else if (p1 >= i.pStart && p1 < i.pStop) {
      filter.percent1 = (p1 - i.pStart) / i.pLength;
    }

    if (!isNaN(filter.percent0)) {
      filter.value0 = this.dimensions[dimIndex].scale.percentToValue(filter.percent0);
    }
    if (!isNaN(filter.percent1)) {
      filter.value1 = this.dimensions[dimIndex].scale.percentToValue(filter.percent1);
    }
  }

  protected processConfigFilter(filter: t.ConfigFilter, dimIndex: number): t.Filter | undefined {
    const i = this.getDimensionLayoutInfo(dimIndex);
    if (!i) return;

    const newFilter = { ...DEFAULT.FILTER, ...filter };

    if (filter.p0 != null && filter.p1 != null) {
      this.processFilter(newFilter, dimIndex);
    } else {
      const possibleP0 = [];
      const possibleP1 = [];

      if (filter.value0 != null && filter.value1 != null) {
        newFilter.percent0 = this.dimensions[dimIndex].scale.valueToPercent(filter.value0);
        newFilter.percent1 = this.dimensions[dimIndex].scale.valueToPercent(filter.value1);
        possibleP0.push(newFilter.percent0 * i.pLength + i.pStart);
        possibleP1.push(newFilter.percent1 * i.pLength + i.pStart);
      }

      if (i.hasInfinity) {
        if (i.isHorizontal) {
          if (filter.hasPositiveInfinity) {
            possibleP0.push(0.0);
            possibleP1.push(0.0 + DEFAULT.FILTER_EPSILON);
          } else if (filter.hasNegativeInfinity) {
            const pi = (i.layout.axisInfinityStop.y - i.layout.axisBoundaryStart.y) / i.yLength;
            possibleP0.push(pi - DEFAULT.FILTER_EPSILON);
            possibleP1.push(pi + DEFAULT.FILTER_EPSILON);
          }
        } else {
          if (filter.hasPositiveInfinity) {
            possibleP0.push(1.0 - DEFAULT.FILTER_EPSILON);
            possibleP1.push(1.0);
          } else if (filter.hasNegativeInfinity) {
            const pi = (i.layout.axisInfinityStart.x - i.layout.axisBoundaryStart.x) / i.xLength;
            possibleP0.push(pi - DEFAULT.FILTER_EPSILON);
            possibleP1.push(pi + DEFAULT.FILTER_EPSILON);
          }
        }
      }
      if (i.hasNaN && filter.hasNaN) {
        if (i.isHorizontal) {
          possibleP0.push(1.0 - DEFAULT.FILTER_EPSILON);
          possibleP1.push(1.0);
        } else {
          possibleP0.push(0.0);
          possibleP1.push(0.0 + DEFAULT.FILTER_EPSILON);
        }
      }

      newFilter.p0 = Math.min(...possibleP0);
      newFilter.p1 = Math.max(...possibleP1);
    }

    return newFilter;
  }

  protected cleanUpFilters(): void {
    Object.keys(this.filters).forEach(key => {
      const filters = this.filters[key] || [];
      for (let i = 0; i < filters.length; i++) {
        // Remove invalid filters.
        if (ix.isFilterInvalid(filters[i])) {
          filters[i] = { ...DEFAULT.FILTER };
          continue;
        }

        // Remove filters that are sized 0.
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

  protected updateCursor(): void {
    const _ix = this.ix;
    const _ixsa = _ix.shared.action;
    const _ixsf = _ix.shared.focus;
    const isHorizontal = this.config.direction === t.Direction.Horizontal;

    let cursor = 'default';
    if (_ixsa.type !== t.ActionType.None) {
      if (_ixsa.type === t.ActionType.FilterMove || _ixsa.type === t.ActionType.LabelMove) {
        cursor = 'grabbing';
      } else if (
        _ixsa.type === t.ActionType.FilterResizeAfter ||
        _ixsa.type === t.ActionType.FilterResizeBefore
      ) {
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

  protected clear(): void {
    const { h, w } = this.size;
    this.ctx.clearRect(0, 0, w, h);
  }

  protected draw(): void {
    if (!this._) return;

    const _dl = this._.dims.list;
    const _dsa = this._.dims.shared.axes;
    const _dsl = this._.dims.shared.label;
    const _s = this._.styles;
    const _ix = this.ix;
    const _ixsf = this.ix.shared.focus;
    const _filters = this.filters;
    const isHorizontal = this.config.direction === t.Direction.Horizontal;
    const axesStyle = this.config.style.axes;
    const dataStyle = this.config.style.data;
    const dimStyle = this.config.style.dimension;
    const isLabelBefore = dimStyle.label.placement === t.LabelPlacement.Before;
    const isAxesBefore = axesStyle.label.placement === t.LabelPlacement.Before;

    // Draw data lines.
    for (let k = 0; k < this.dataInfo.seriesCount; k++) {
      let dataDefaultStyle: t.StyleLine = dataStyle.default;
      let hasFilters = false;
      let hasNaN = false;
      let hasNegativeInfinity = false;
      let hasPositiveInfinity = false;
      let isFilteredOut = false;

      if (dataStyle.series?.[k]) dataDefaultStyle = dataStyle.series?.[k];

      const series = this.dimensions.map((dimension, i) => {
        const key = dimension.key;
        const layout = _dl[i].layout;
        const bound = ix.getDragBound(i, _ix, layout.bound);
        const value = this.data[key][k];
        const valueIsNumber = d.isNumber(value);
        const valueIsNaN = valueIsNumber && isNaN(value);
        const valueIsInfinity = valueIsNumber && !valueIsNaN && !isFinite(value);
        const valueIsNegativeInfinity = valueIsInfinity && value === -Infinity;
        const valueIsPositiveInfinity = valueIsInfinity && value === Infinity;
        const percent = valueIsNaN || valueIsInfinity
          ? 0 : dimension.scale?.valueToPercent(value) ?? 0;
        let x = bound.x;
        let y = bound.y;

        if (valueIsNaN) {
          x += isHorizontal ? layout.axisDataStart.x : layout.axisBoundaryStart.x;
          y += isHorizontal ? layout.axisBoundaryStop.y : layout.axisDataStart.y;
        } else if (valueIsInfinity) {
          const dx = valueIsNegativeInfinity
            ? layout.axisInfinityStart.x : layout.axisInfinityStop.x;
          const dy = valueIsPositiveInfinity
            ? layout.axisInfinityStop.y : layout.axisInfinityStart.y;
          x += isHorizontal ? layout.axisDataStart.x : dx;
          y += isHorizontal ? dy : layout.axisDataStart.y;
        } else {
          const pos = dimension.scale?.valueToPos(value) ?? 0;
          x += layout.axisDataStart.x + (isHorizontal ? 0 : pos);
          y += layout.axisDataStart.y + (isHorizontal ? pos : 0);
        }

        if (key === dataStyle.targetDimensionKey) {
          const reverse = dimension.scale?.reverse ?? false;
          const colors = dataStyle.targetColorScale || [];
          const scaleColor = scale2rgba(reverse ? colors.slice().reverse() : colors, percent);
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
            if (valueIsNaN && filter.hasNaN) {
              hasMatchedFilter = true;
              hasNaN = true;
            } else if (valueIsNegativeInfinity && filter.hasNegativeInfinity) {
              hasMatchedFilter = true;
              hasNegativeInfinity = true;
            } else if (valueIsPositiveInfinity && filter.hasPositiveInfinity) {
              hasMatchedFilter = true;
              hasPositiveInfinity = true;
            }
            if (!valueIsNaN && !valueIsInfinity &&
                !isNaN(filter.percent0) && !isNaN(filter.percent1) &&
                percent >= filter.percent0 && percent <= filter.percent1) {
              hasMatchedFilter = true;
            }
          }

          if (!hasMatchedFilter) isFilteredOut = true;
        } else {
          if (valueIsNaN) {
            hasNaN = true;
          } else if (valueIsNegativeInfinity) {
            hasNegativeInfinity = true;
          } else if (valueIsPositiveInfinity) {
            hasPositiveInfinity = true;
          }
        }

        return { x, y };
      });

      if (hasFilters && isFilteredOut) {
        dataDefaultStyle = dataStyle.filtered;
      } else if (hasNaN && dataStyle.overrideNaN) {
        dataDefaultStyle = dataStyle.overrideNaN;
      } else if (hasNegativeInfinity && dataStyle.overrideNegativeInfinity) {
        dataDefaultStyle = dataStyle.overrideNegativeInfinity;
      } else if (hasPositiveInfinity && dataStyle.overridePositiveInfinity) {
        dataDefaultStyle = dataStyle.overridePositiveInfinity;
      }

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
      canvas.drawText(this.ctx, dimension.labelTruncated, x, y, _dsl.rad ?? 0, style);
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
      const axisBoundaryStart = dim.layout.axisBoundaryStart;
      const axisBoundaryStop = dim.layout.axisBoundaryStop;
      const axisInfinityStart = dim.layout.axisInfinityStart;
      const axisInfinityStop = dim.layout.axisInfinityStop;
      const axisDataStart = dim.layout.axisDataStart;
      const axisDataStop = dim.layout.axisDataStop;
      const tickLabels = dim.axes.tickLabels;
      const tickPos = dim.axes.tickPos;
      const tickLengthFactor = isAxesBefore ? -1 : 1;
      const tickLabelStyle = { ..._s[i].tickLabel, ...tickTextStyle };
      const xTickLength = isHorizontal ? tickLengthFactor * axesStyle.tick.length : 0;
      const yTickLength = isHorizontal ? 0 : tickLengthFactor * axesStyle.tick.length;
      const filters = _filters[key] || [];

      // Draw axis line.
      canvas.drawLine(
        this.ctx,
        bound.x + axisDataStart.x,
        bound.y + axisDataStart.y,
        bound.x + axisDataStop.x,
        bound.y + axisDataStop.y,
        _s[i].axis,
      );

      // Draw dashed lines to Infinity markers if applicable.
      if (this.dataInfo.hasInfinity) {

        // Draw dashed line.
        canvas.drawLine(
          this.ctx,
          bound.x + axisInfinityStart.x,
          bound.y + axisInfinityStart.y,
          bound.x + axisDataStart.x,
          bound.y + axisDataStart.y,
          { ..._s[i].axis, lineDash: axesStyle.axis.infLineDash },
        );

        // Draw lower/right Infinity dashed line.
        canvas.drawLine(
          this.ctx,
          bound.x + axisDataStop.x,
          bound.y + axisDataStop.y,
          bound.x + axisInfinityStop.x,
          bound.y + axisInfinityStop.y,
          {
            ..._s[i].axis,
            lineDash: axesStyle.axis.infLineDash,
            /**
             * Adding an offset to introduce a dash offset first before
             * to create a gap on the tail end of the axis.
             */
            lineDashOffset: axesStyle.axis.infLineDash[0] ?? 0,
          },
        );

        // Draw ticks.
        const aX0 = bound.x + axisInfinityStart.x;
        const aY0 = bound.y + axisInfinityStart.y;
        const aX1 = aX0 + xTickLength;
        const aY1 = aY0 + yTickLength;
        canvas.drawLine(this.ctx, aX0, aY0, aX1, aY1, _s[i].tick);

        const bX0 = bound.x + axisInfinityStop.x;
        const bY0 = bound.y + axisInfinityStop.y;
        const bX1 = bX0 + xTickLength;
        const bY1 = bY0 + yTickLength;
        canvas.drawLine(this.ctx, bX0, bY0, bX1, bY1, _s[i].tick);

        // Draw tick labels.
        const aCx = isHorizontal ? aX1 + tickLengthFactor * axesStyle.label.offset : aX0;
        const aCy = isHorizontal ? aY0 : aY1 + tickLengthFactor * axesStyle.label.offset;
        const aRad = axesStyle.label.angle != null
          ? axesStyle.label.angle
          : (isHorizontal && isAxesBefore ? Math.PI : 0);
        const aLabel = isHorizontal ? '+Ꝏ' : '-Ꝏ';
        canvas.drawText(this.ctx, aLabel, aCx, aCy, aRad, tickLabelStyle);

        const bCx = isHorizontal ? bX1 + tickLengthFactor * axesStyle.label.offset : bX0;
        const bCy = isHorizontal ? bY0 : bY1 + tickLengthFactor * axesStyle.label.offset;
        const bRad = axesStyle.label.angle != null
          ? axesStyle.label.angle
          : (isHorizontal && isAxesBefore ? Math.PI : 0);
        const bLabel = isHorizontal ? '-Ꝏ' : '+Ꝏ';
        canvas.drawText(this.ctx, bLabel, bCx, bCy, bRad, tickLabelStyle);
      }

      if (this.dataInfo.hasNaN) {
        // Draw tick.
        const x0 = bound.x + (isHorizontal ? axisBoundaryStop.x : axisBoundaryStart.x);
        const y0 = bound.y + (isHorizontal ? axisBoundaryStop.y : axisBoundaryStart.y);
        const x1 = x0 + xTickLength;
        const y1 = y0 + yTickLength;
        canvas.drawLine(this.ctx, x0, y0, x1, y1, _s[i].tick);

        // Draw tick label.
        const cx = isHorizontal ? x1 + tickLengthFactor * axesStyle.label.offset : x0;
        const cy = isHorizontal ? y0 : y1 + tickLengthFactor * axesStyle.label.offset;
        const rad = axesStyle.label.angle != null
          ? axesStyle.label.angle
          : (isHorizontal && isAxesBefore ? Math.PI : 0);
        canvas.drawText(this.ctx, 'NaN', cx, cy, rad, tickLabelStyle);
      }

      for (let j = 0; j < tickLabels.length; j++) {
        let tickLabel = tickLabels[j];

        /**
         * If the tick label starts with '*', it already contains the final label value.
         * For example '*123' will render '123'. This is useful for tick marks on the edge
         * of the dimension axis that require the value to be interpolated.
         */
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

        // Draw tick line.
        const xOffset = isHorizontal ? 0 : tickPos[j];
        const yOffset = isHorizontal ? tickPos[j] : 0;
        const xTickLength = isHorizontal ? tickLengthFactor * axesStyle.tick.length : 0;
        const yTickLength = isHorizontal ? 0 : tickLengthFactor * axesStyle.tick.length;
        const x0 = bound.x + axisDataStart.x + xOffset;
        const y0 = bound.y + axisDataStart.y + yOffset;
        const x1 = bound.x + axisDataStart.x + xOffset + xTickLength;
        const y1 = bound.y + axisDataStart.y + yOffset + yTickLength;
        canvas.drawLine(this.ctx, x0, y0, x1, y1, _s[i].tick);

        // Draw tick label.
        const cx = isHorizontal ? x1 + tickLengthFactor * axesStyle.label.offset : x0;
        const cy = isHorizontal ? y0 : y1 + tickLengthFactor * axesStyle.label.offset;
        const rad = axesStyle.label.angle != null
          ? axesStyle.label.angle
          : (isHorizontal && isAxesBefore ? Math.PI : 0);
        const style = { ..._s[i].tickLabel, ...tickTextStyle };
        canvas.drawText(this.ctx, tickLabel, cx, cy, rad, style);
      }

      // Draw axis filter bars.
      filters.forEach((filter, j) => {
        const p0 = filter.p0 * _dsa.length;
        const p1 = filter.p1 * _dsa.length;
        const width = _s[i].filters[j].width;
        const halfWidth = width / 2;
        const x = bound.x + axisBoundaryStart.x + (isHorizontal ? -halfWidth : p0);
        const y = bound.y + axisBoundaryStart.y + (isHorizontal ? p0 : -halfWidth);
        const w = isHorizontal ? width : p1 - p0;
        const h = isHorizontal ? p1 - p0 : width;
        canvas.drawRect(this.ctx, x, y, w, h, _s[i].filters[j]);
      });
    });
  }

  protected drawDebugOutline(): void {
    if (!this._) return;

    const { h, w } = this.size;
    const _l = this._.layout;
    const _dl = this._.dims.list;
    const _dsly = this._.dims.shared.layout;
    const isHorizontal = this.config.direction === t.Direction.Horizontal;

    // Draw the drawing area by outlining paddings.
    const paddingStyle = { strokeStyle: '#dddddd' };
    canvas.drawLine(this.ctx, 0, _l.padding[0], w, _l.padding[0], paddingStyle);
    canvas.drawLine(this.ctx, 0, h - _l.padding[2], w, h - _l.padding[2], paddingStyle);
    canvas.drawLine(this.ctx, _l.padding[3], 0, _l.padding[3], h, paddingStyle);
    canvas.drawLine(this.ctx, w - _l.padding[1], 0, w - _l.padding[1], h, paddingStyle);

    // Draw each dimension rough outline with bounding box.
    const dimStyle = { strokeStyle: '#999999' };
    const boundStyle = { strokeStyle: '#ff0000' };
    const axisBoundaryStyle = { strokeStyle: '#eeeeee' };
    const labelPointStyle = { strokeStyle: '#0099cc' };
    const labelBoundaryStyle = { strokeStyle: '#ffcc00' };
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

  protected handleResize(entries: ResizeObserverEntry[]): void {
    const entry = entries.find(entry => entry.target === this.element);
    if (!entry) return;

    const { width: w, height: h } = entry.contentRect;

    if (this.size.w === 0 && this.size.h === 0 && w !== 0 && h !== 0) {
      this.setSize(w, h);
      this.setConfigFilters(this.config.filters);
    } else {
      this.setSize(w, h);
    }
  }

  protected handleDoubleClick(): void {
    // Reset chart settings.
    this.setDimensions(this.dimensionsOriginal, false);
    this.filters = {};
    this.ix = d.clone(DEFAULT.IX);

    this.redraw();

    // Make hook callback.
    this.config.hooks.onReset?.();
  }

  protected handleMouseDown(e: MouseEvent): void {
    if (!this._) return;

    const _ixs = this.ix.shared;
    const _ixsa = this.ix.shared.action;
    const _ixd = this.ix.dimension;
    const _ixf = this.ix.filters;
    const _dsa = this._.dims.shared.axes;
    const isHorizontal = this.config.direction === t.Direction.Horizontal;
    const hKey = isHorizontal ? 'x' : 'y';
    const vKey = isHorizontal ? 'y' : 'x';

    const point = getMousePoint(e, this.element);
    _ixsa.p0 = point;
    _ixsa.p1 = point;
    _ixsa.filterIndex = -1;
    _ixs.focus = this.getFocusByPoint(point);

    if (_ixs.focus) {
      const i = _ixs.focus.dimIndex;
      const layout = this._.dims.list[i].layout;
      const bound = layout.bound;
      const axisBoundaryStart = layout.axisBoundaryStart;
      if (_ixs.focus?.type === t.FocusType.DimensionLabel) {
        _ixsa.type = t.ActionType.LabelMove;
        _ixsa.dimIndex = i;
        _ixd.axis = bound[hKey] + axisBoundaryStart[hKey];
        _ixd.bound = bound;
      } else if ([
        t.FocusType.DimensionAxis,
        t.FocusType.Filter,
        t.FocusType.FilterResize,
      ].includes(_ixs.focus?.type)) {
        _ixsa.type = t.ActionType.FilterCreate;
        _ixsa.dimIndex = i;
        _ixf.key = this.dimensions[i].key;

        const p0 = (_ixsa.p0[vKey] - bound[vKey] - axisBoundaryStart[vKey]) / _dsa.length;
        this.setActiveFilter(_ixf.key, p0);
        this.processFilter(_ixf.active, i);
      }
    }

    // Update cursor pointer based on type and position.
    this.updateCursor();

    this.redraw();
  }

  protected handleMouseMove(e: MouseEvent): void {
    if (!this._) return;

    const point = getMousePoint(e, this.element);
    this.ix.shared.action.p1 = point;
    this.ix.shared.focus = this.getFocusByPoint(point);

    // Update dimension dragging via label.
    this.updateActiveLabel();

    // Update dimension filter creating dragging data.
    this.updateActiveFilter(e);

    // Update cursor pointer based on type and position.
    this.updateCursor();

    this.redraw();
  }

  protected handleMouseUp(e: MouseEvent): void {
    if (!this._) return;

    const point = getMousePoint(e, this.element);
    this.ix.shared.action.p1 = point;

    // Update dimension dragging via label.
    this.updateActiveLabel();

    // Update active filter upon release event.
    this.updateActiveFilter(e);

    // Reset drag info but preserve focus.
    this.ix = d.clone(DEFAULT.IX);
    this.ix.shared.focus = this.getFocusByPoint(point);

    // Update cursor pointer based on type and position.
    this.updateCursor();

    this.redraw();
  }
}

export default Hermes;
