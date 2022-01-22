var Hermes = (function () {
  'use strict';

  /*!
   * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
   *
   * Copyright (c) 2014-2017, Jon Schlinkert.
   * Released under the MIT License.
   */

  function isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]';
  }

  function isPlainObject(o) {
    var ctor,prot;

    if (isObject(o) === false) return false;

    // If has modified constructor
    ctor = o.constructor;
    if (ctor === undefined) return true;

    // If has modified prototype
    prot = ctor.prototype;
    if (isObject(prot) === false) return false;

    // If constructor does not have an Object-specific method
    if (prot.hasOwnProperty('isPrototypeOf') === false) {
      return false;
    }

    // Most likely a plain Object
    return true;
  }

  /**
   * Get the type of the given object.
   *
   * @param object - The object to get the type of.
   * @returns The type of the given object.
   */
  function getObjectType(object) {
      if (typeof object !== "object" || object === null) {
          return 0 /* NOT */;
      }
      if (Array.isArray(object)) {
          return 2 /* ARRAY */;
      }
      if (isPlainObject(object)) {
          return 1 /* RECORD */;
      }
      if (object instanceof Set) {
          return 3 /* SET */;
      }
      if (object instanceof Map) {
          return 4 /* MAP */;
      }
      return 5 /* OTHER */;
  }
  /**
   * Get the keys of the given objects including symbol keys.
   *
   * Note: Only keys to enumerable properties are returned.
   *
   * @param objects - An array of objects to get the keys of.
   * @returns A set containing all the keys of all the given objects.
   */
  function getKeys(objects) {
      const keys = new Set();
      /* eslint-disable functional/no-loop-statement -- using a loop here is more efficient. */
      for (const object of objects) {
          for (const key of [
              ...Object.keys(object),
              ...Object.getOwnPropertySymbols(object),
          ]) {
              keys.add(key);
          }
      }
      /* eslint-enable functional/no-loop-statement */
      return keys;
  }
  /**
   * Does the given object have the given property.
   *
   * @param object - The object to test.
   * @param property - The property to test.
   * @returns Whether the object has the property.
   */
  function objectHasProperty(object, property) {
      return (typeof object === "object" &&
          Object.prototype.propertyIsEnumerable.call(object, property));
  }
  /**
   * Get an iterable object that iterates over the given iterables.
   */
  function getIterableOfIterables(iterables) {
      return {
          *[Symbol.iterator]() {
              // eslint-disable-next-line functional/no-loop-statement
              for (const iterable of iterables) {
                  // eslint-disable-next-line functional/no-loop-statement
                  for (const value of iterable) {
                      yield value;
                  }
              }
          },
      };
  }

  const defaultOptions = {
      mergeMaps,
      mergeSets,
      mergeArrays,
      mergeRecords,
      mergeOthers: leaf,
  };
  /**
   * Deeply merge objects.
   *
   * @param objects - The objects to merge.
   */
  function deepmerge(...objects) {
      return deepmergeCustom({})(...objects);
  }
  /**
   * Deeply merge two or more objects using the given options.
   *
   * @param options - The options on how to customize the merge function.
   */
  function deepmergeCustom(options) {
      const utils = getUtils(options, customizedDeepmerge);
      /**
       * The customized deepmerge function.
       */
      function customizedDeepmerge(...objects) {
          if (objects.length === 0) {
              return undefined;
          }
          if (objects.length === 1) {
              return objects[0];
          }
          return mergeUnknowns(objects, utils);
      }
      return customizedDeepmerge;
  }
  /**
   * The the full options with defaults apply.
   *
   * @param options - The options the user specified
   */
  function getUtils(options, customizedDeepmerge) {
      return {
          defaultMergeFunctions: defaultOptions,
          mergeFunctions: {
              ...defaultOptions,
              ...Object.fromEntries(Object.entries(options).map(([key, option]) => option === false ? [key, leaf] : [key, option])),
          },
          deepmerge: customizedDeepmerge,
      };
  }
  /**
   * Merge unknown things.
   *
   * @param values - The values.
   */
  function mergeUnknowns(values, utils) {
      const type = getObjectType(values[0]);
      // eslint-disable-next-line functional/no-conditional-statement -- add an early escape for better performance.
      if (type !== 0 /* NOT */ && type !== 5 /* OTHER */) {
          // eslint-disable-next-line functional/no-loop-statement -- using a loop here is more performant than mapping every value and then testing every value.
          for (let mutableIndex = 1; mutableIndex < values.length; mutableIndex++) {
              if (getObjectType(values[mutableIndex]) === type) {
                  continue;
              }
              return utils.mergeFunctions.mergeOthers(values, utils);
          }
      }
      switch (type) {
          case 1 /* RECORD */:
              return utils.mergeFunctions.mergeRecords(values, utils);
          case 2 /* ARRAY */:
              return utils.mergeFunctions.mergeArrays(values, utils);
          case 3 /* SET */:
              return utils.mergeFunctions.mergeSets(values, utils);
          case 4 /* MAP */:
              return utils.mergeFunctions.mergeMaps(values, utils);
          default:
              return utils.mergeFunctions.mergeOthers(values, utils);
      }
  }
  /**
   * Merge records.
   *
   * @param values - The records.
   */
  function mergeRecords(values, utils) {
      const result = {};
      /* eslint-disable functional/no-loop-statement, functional/no-conditional-statement -- using a loop here is more performant. */
      for (const key of getKeys(values)) {
          const propValues = [];
          for (const value of values) {
              if (objectHasProperty(value, key)) {
                  propValues.push(value[key]);
              }
          }
          // assert(propValues.length > 0);
          result[key] =
              propValues.length === 1
                  ? propValues[0]
                  : mergeUnknowns(propValues, utils);
      }
      /* eslint-enable functional/no-loop-statement, functional/no-conditional-statement */
      return result;
  }
  /**
   * Merge arrays.
   *
   * @param values - The arrays.
   */
  function mergeArrays(values, utils) {
      return values.flat();
  }
  /**
   * Merge sets.
   *
   * @param values - The sets.
   */
  function mergeSets(values, utils) {
      return new Set(getIterableOfIterables(values));
  }
  /**
   * Merge maps.
   *
   * @param values - The maps.
   */
  function mergeMaps(values, utils) {
      return new Map(getIterableOfIterables(values));
  }
  /**
   * Merge "other" things.
   *
   * @param values - The values.
   */
  function leaf(values, utils) {
      return values[values.length - 1];
  }

  const isError = (data) => data instanceof Error;
  const isString = (data) => typeof data === 'string';

  const MESSAGE_PREFIX = '[Hermes]';
  const DEFAULT_MESSAGE = 'Critical error encountered!';
  class HermesError extends Error {
      constructor(e) {
          const message = isError(e) ? e.message : (isString(e) ? e : DEFAULT_MESSAGE);
          super(`${MESSAGE_PREFIX} ${message}`);
      }
  }

  /**
   * NiceScale solves the problem of generating human friendly ticks for chart axes.
   * Normal generative tick techniques make tick marks that jarring for the human to read.
   *
   * https://stackoverflow.com/questions/8506881/nice-label-algorithm-for-charts-with-minimum-ticks
   */
  const DEFAULT_MAX_TICKS = 10;
  class NiceScale {
      /**
       * Instantiates a new instance of the NiceScale class.
       *
       * @param minValue the minimum data point on the axis
       * @param maxValue the maximum data point on the axis
       * @param maxTicks the maximum number of tick marks for the axis
       */
      constructor(maxTicks = DEFAULT_MAX_TICKS) {
          this.maxValue = Number.POSITIVE_INFINITY;
          this.minValue = Number.NEGATIVE_INFINITY;
          this.maxTicks = maxTicks;
          this.max = 100;
          this.min = 0;
          this.range = 100;
          this.ticks = [];
          this.tickSpacing = 10;
      }
      /**
       * Sets the minimum and maximum data points for the axis.
       *
       * @param minPoint the minimum data point on the axis
       * @param maxPoint the maximum data point on the axis
       */
      setMinMaxValues(minValue, maxValue) {
          this.minValue = minValue;
          this.maxValue = maxValue;
          this.calculate();
      }
      /**
       * Sets maximum number of tick marks we're comfortable with
       *
       * @param maxTicks the maximum number of tick marks for the axis
       */
      setMaxTicks(maxTicks) {
          this.maxTicks = maxTicks;
          this.calculate();
      }
      /**
       * Calculate and update values for tick spacing and nice
       * minimum and maximum data points on the axis.
       */
      calculate() {
          this.range = this.niceNum(this.maxValue - this.minValue, false);
          this.tickSpacing = this.niceNum(this.range / (this.maxTicks - 1), true);
          this.min = Math.floor(this.minValue / this.tickSpacing) * this.tickSpacing;
          this.max = Math.ceil(this.maxValue / this.tickSpacing) * this.tickSpacing;
          // Generate ticks based on min, max and tick spacing.
          this.ticks = [];
          for (let i = this.min; i <= this.max; i += this.tickSpacing)
              this.ticks.push(i);
      }
      /**
       * Returns a "nice" number approximately equal to range.
       * Rounds the number if round = true
       * Takes the ceiling if round = false.
       *
       * @param range the data range
       * @param round whether to round the result
       * @return a "nice" number to be used for the data range
       */
      niceNum(range, round) {
          const exponent = Math.floor(Math.log10(range)); // Exponent of range.
          const fraction = range / 10 ** exponent; // Fractional part of range.
          let niceFraction; // Nice, rounded fraction.
          if (round) {
              if (fraction < 1.5)
                  niceFraction = 1;
              else if (fraction < 3)
                  niceFraction = 2;
              else if (fraction < 7)
                  niceFraction = 5;
              else
                  niceFraction = 10;
          }
          else {
              if (fraction <= 1)
                  niceFraction = 1;
              else if (fraction <= 2)
                  niceFraction = 2;
              else if (fraction <= 5)
                  niceFraction = 5;
              else
                  niceFraction = 10;
          }
          return niceFraction * 10 ** exponent;
      }
  }

  /*
   * Chart Option Types
   */
  var LabelPlacement;
  (function (LabelPlacement) {
      LabelPlacement["After"] = "after";
      LabelPlacement["Before"] = "before";
  })(LabelPlacement || (LabelPlacement = {}));
  var AxesLabelLayout;
  (function (AxesLabelLayout) {
      AxesLabelLayout["After"] = "after";
      AxesLabelLayout["Before"] = "before";
  })(AxesLabelLayout || (AxesLabelLayout = {}));
  var AxisType;
  (function (AxisType) {
      AxisType["Categorical"] = "categorical";
      AxisType["Linear"] = "linear";
      AxisType["Logarithmic"] = "logarithmic";
  })(AxisType || (AxisType = {}));
  var DimensionLabelLayout;
  (function (DimensionLabelLayout) {
      DimensionLabelLayout["End"] = "end";
      DimensionLabelLayout["Start"] = "start";
  })(DimensionLabelLayout || (DimensionLabelLayout = {}));
  var Direction;
  (function (Direction) {
      Direction["Horizontal"] = "horizontal";
      Direction["Vertical"] = "vertical";
  })(Direction || (Direction = {}));
  var FontWeight;
  (function (FontWeight) {
      FontWeight["Bold"] = "bold";
      FontWeight["Bolder"] = "bolder";
      FontWeight["Lighter"] = "lighter";
      FontWeight["Normal"] = "normal";
  })(FontWeight || (FontWeight = {}));
  var FontStyle;
  (function (FontStyle) {
      FontStyle["Italic"] = "italic";
      FontStyle["Normal"] = "normal";
      FontStyle["Oblique"] = "oblique";
  })(FontStyle || (FontStyle = {}));

  const DEFAULT_FILL_STYLE = 'black';
  const DEFAULT_LINE_WIDTH = 1;
  const DEFAULT_STROKE_STYLE = 'black';
  const drawCircle = (ctx, x, y, radius, style) => {
      ctx.fillStyle = (style === null || style === void 0 ? void 0 : style.fillStyle) || '';
      ctx.lineWidth = (style === null || style === void 0 ? void 0 : style.lineWidth) || DEFAULT_LINE_WIDTH;
      ctx.strokeStyle = (style === null || style === void 0 ? void 0 : style.strokeStyle) || DEFAULT_STROKE_STYLE;
      ctx.moveTo(x + radius, y);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.stroke();
  };
  const drawLine = (ctx, x0, y0, x1, y1, style) => {
      ctx.lineWidth = (style === null || style === void 0 ? void 0 : style.lineWidth) || DEFAULT_LINE_WIDTH;
      ctx.strokeStyle = (style === null || style === void 0 ? void 0 : style.strokeStyle) || DEFAULT_STROKE_STYLE;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
  };
  const drawRect = (ctx, x, y, w, h, style) => {
      ctx.fillStyle = (style === null || style === void 0 ? void 0 : style.fillStyle) || '';
      ctx.lineWidth = (style === null || style === void 0 ? void 0 : style.lineWidth) || DEFAULT_LINE_WIDTH;
      ctx.strokeStyle = (style === null || style === void 0 ? void 0 : style.strokeStyle) || DEFAULT_STROKE_STYLE;
      ctx.strokeRect(x, y, w, h);
  };
  const drawTextAngled = (ctx, text, font, x, y, rad, style) => {
      const normalizedRad = (rad + 2 * Math.PI) % (2 * Math.PI);
      const inwards = normalizedRad > Math.PI / 2 && normalizedRad <= 3 * Math.PI / 4;
      // const inwards = false;
      console.log('normalizedRad', normalizedRad);
      console.log('inwards', inwards);
      ctx.save();
      ctx.font = font;
      ctx.textAlign = inwards ? 'right' : 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = (style === null || style === void 0 ? void 0 : style.fillStyle) || DEFAULT_FILL_STYLE;
      ctx.translate(x, y);
      ctx.rotate(-rad - (inwards ? Math.PI : 0));
      ctx.translate(-x, -y);
      ctx.fillText(text, x, y);
      ctx.restore();
      return { h: 0, w: 0, x: 0, y: 0 };
  };
  const getFont = (font) => {
      const style = font.style || FontStyle.Normal;
      const weight = font.weight || FontWeight.Normal;
      const size = `${font.size || 14}px`;
      const family = font.family || 'sans-serif';
      return [style, weight, size, family].join(' ');
  };
  /*
   * The setting of context font is expected to be done outside of this function.
   */
  const getTextSize = (ctx, text, font) => {
      ctx.font = getFont(font);
      const metrics = ctx.measureText(text);
      const w = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
      const h = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      return { h, w };
  };
  const normalizePadding = (padding) => {
      if (!Array.isArray(padding))
          return [padding, padding, padding, padding];
      if (padding.length === 2)
          return [padding[0], padding[1], padding[0], padding[1]];
      return padding;
  };

  const getElement = (target) => {
      if (!isString(target))
          return target;
      return document.querySelector(target);
  };

  const CONFIG = { TICK_DISTANCE: 5 };
  const DEFAULT_OPTIONS = {
      direction: Direction.Horizontal,
      style: {
          axes: {
              axis: {
                  color: 'grey',
                  width: 1,
              },
              label: {
                  color: 'blue',
                  font: { size: 12 },
                  offset: 10,
                  placement: LabelPlacement.After,
              },
              tick: {
                  color: 'red',
                  length: 10,
                  width: 1,
              },
          },
          dimension: {
              label: {
                  angle: 3 * Math.PI / 4,
                  color: 'black',
                  font: { size: 14 },
                  offset: 10,
                  placement: LabelPlacement.Before,
              },
          },
          padding: 25,
      },
  };
  class Hermes {
      constructor(target, dimensions, options = {}) {
          this.size = { h: 0, w: 0 };
          this._ = undefined;
          const element = getElement(target);
          if (!element)
              throw new HermesError('Target element selector did not match anything.');
          this.element = element;
          // Create a canvas and append it to the target element.
          this.canvas = document.createElement('canvas');
          this.element.appendChild(this.canvas);
          // Setup initial canvas size.
          const rect = this.element.getBoundingClientRect();
          this.setSize(rect.width, rect.height);
          // Get canvas context.
          const ctx = this.canvas.getContext('2d');
          if (!ctx)
              throw new HermesError('Unable to get context from target element.');
          this.ctx = ctx;
          this.dimensions = dimensions;
          this.options = deepmerge(DEFAULT_OPTIONS, options);
          // Add resize observer to detect target element resizing.
          this.resizeObserver = new ResizeObserver(entries => {
              const rect = entries[0].contentRect;
              this.setSize(rect.width, rect.height);
              this.calculate();
          });
          this.resizeObserver.observe(this.element);
      }
      destroy() {
          this.resizeObserver.unobserve(this.element);
      }
      draw() {
          // Set line width
          this.ctx.lineWidth = 1;
          this.ctx.fillStyle = 'black';
          // calculate dimension labels
          // calculate axis labels
          // this.drawDimensions();
          // this.ctx.fillRect(100, 100, 100, 100);
          // Wall
          // this.ctx.strokeRect(0, 0, 100, 100);
          // // Door
          // this.ctx.fillRect(130, 190, 40, 60);
          // // Roof
          // this.ctx.beginPath();
          // this.ctx.moveTo(50, 140);
          // this.ctx.lineTo(150, 60);
          // this.ctx.lineTo(250, 140);
          // this.ctx.closePath();
          // this.ctx.stroke();
      }
      calculate() {
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          const _ = {
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
          const isHorizontal = this.options.direction === Direction.Horizontal;
          const dimLabelStyle = this.options.style.dimension.label;
          const axesLabelStyle = this.options.style.axes.label;
          const placement = dimLabelStyle.placement;
          const dimCount = this.dimensions.length;
          const _l = _.layout;
          const _dsa = _.dims.shared.axes;
          const _dsl = _.dims.shared.label;
          const _dsly = _.dims.shared.layout;
          /**
           * Calculate actual render area (canvas minus padding).
           */
          _l.drawRect = {
              h: this.size.h - _l.padding[0] - _l.padding[2],
              w: this.size.w - _l.padding[1] - _l.padding[3],
              x: _l.padding[3],
              y: _l.padding[0],
          };
          /**
           * Go through each of the dimension labels and calculate the size
           * of each one and figure out how much space is needed for them.
           */
          _dsl.cos = dimLabelStyle.angle != null ? Math.cos(dimLabelStyle.angle) : undefined;
          _dsl.sin = dimLabelStyle.angle != null ? Math.sin(dimLabelStyle.angle) : undefined;
          _dsl.maxLengthCos = 0;
          _dsl.maxLengthSin = 0;
          this.dimensions.forEach((dimension, index) => {
              const textSize = getTextSize(this.ctx, dimension.label, dimLabelStyle.font);
              const _dlil = _.dims.list[index].label;
              _dlil.w = textSize.w;
              _dlil.h = textSize.h;
              _dlil.lengthCos = _dsl.cos != null ? textSize.w * _dsl.cos : textSize.w;
              _dlil.lengthSin = _dsl.sin != null ? textSize.w * _dsl.sin : textSize.h;
              if (_dlil.lengthCos > _dsl.maxLengthCos)
                  _dsl.maxLengthCos = _dlil.lengthCos;
              if (_dlil.lengthSin > _dsl.maxLengthSin)
                  _dsl.maxLengthSin = _dlil.lengthSin;
          });
          /**
           * Figure out the max axis pixel range after dimension labels are calculated.
           */
          _dsa.start = 0;
          _dsa.stop = 0;
          if (isHorizontal) {
              if (placement === LabelPlacement.Before) {
                  _dsa.start = _l.padding[0] + _dsl.maxLengthSin + dimLabelStyle.offset;
                  _dsa.stop = this.size.h - _l.padding[2];
              }
              else {
                  _dsa.start = _l.padding[0];
                  _dsa.stop = this.size.h - _l.padding[2] - _dsl.maxLengthSin - dimLabelStyle.offset;
              }
          }
          else {
              if (placement === LabelPlacement.Before) {
                  _dsa.start = _l.padding[3] + _dsl.maxLengthCos + dimLabelStyle.offset;
                  _dsa.stop = this.size.w - _l.padding[1];
              }
              else {
                  _dsa.start = _l.padding[3];
                  _dsa.stop = this.size.w - _l.padding[1] - _dsl.maxLengthCos - dimLabelStyle.offset;
              }
          }
          /**
           * Go through each axis and figure out the sizes of each axis labels.
           */
          _dsa.maxTicks = (_dsa.stop - _dsa.start) / CONFIG.TICK_DISTANCE;
          _dsa.scale = new NiceScale(_dsa.maxTicks);
          _dsa.labelFactor = axesLabelStyle.placement === LabelPlacement.Before ? -1 : 1;
          _dsly.totalBoundSpace = 0;
          for (let i = 0; i < dimCount; i++) {
              const _dlia = _.dims.list[i].axes;
              const _dlil = _.dims.list[i].label;
              const _dlily = _.dims.list[i].layout;
              /**
               * Save scale info for each axis.
               */
              _dsa.scale.setMinMaxValues(-100, 100);
              _dlia.scale = {
                  max: _dsa.scale.max,
                  min: _dsa.scale.min,
                  range: _dsa.scale.range,
                  ticks: _dsa.scale.ticks.slice(),
                  tickSpacing: _dsa.scale.tickSpacing,
              };
              /**
               * Find the longest axis label.
               */
              _dlia.maxLength = _dsa.scale.ticks.reduce((acc, tick) => {
                  const size = getTextSize(this.ctx, tick.toString(), axesLabelStyle.font);
                  return Math.max(size.w, acc);
              }, 0);
              /**
               * Figure out where the axis alignment center should be.
               * First, base it on the direction and dimension label placement.
               */
              if (_dlil.lengthCos == null) {
                  _dlily.spaceBefore = (isHorizontal ? _dlil.w : _dlil.h) / 2;
                  _dlily.spaceAfter = _dlily.spaceBefore;
              }
              else if (isHorizontal) {
                  _dlily.spaceBefore = _dlil.lengthCos < 0 ? -_dlil.lengthCos : 0;
                  _dlily.spaceAfter = _dlil.lengthCos > 0 ? _dlil.lengthCos : 0;
              }
              else {
                  _dlily.spaceBefore = _dlil.lengthSin > 0 ? _dlil.lengthSin : 0;
                  _dlily.spaceAfter = _dlil.lengthSin < 0 ? -_dlil.lengthSin : 0;
              }
              /**
               * See if axes labels are long enough to shift the axis center.
               */
              if (axesLabelStyle.placement === LabelPlacement.Before) {
                  _dlily.spaceBefore = Math.max(_dlily.spaceBefore, _dlia.maxLength);
              }
              else {
                  _dlily.spaceAfter = Math.max(_dlily.spaceAfter, _dlia.maxLength);
              }
              _dlily.spaceOffset = _dlily.spaceAfter - _dlily.spaceBefore;
              /**
               * Caclulate the layout positions.
               */
              if (isHorizontal) {
                  _dlily.bound = {
                      h: this.size.h - _l.padding[0] - _l.padding[2],
                      w: _dlily.spaceBefore + _dlily.spaceAfter,
                      x: 0,
                      y: _l.padding[0],
                  };
                  _dsly.totalBoundSpace += _dlily.bound.w;
              }
              else {
                  _dlily.bound = {
                      h: _dlily.spaceBefore + _dlily.spaceAfter,
                      w: this.size.w - _l.padding[1] - _l.padding[3],
                      x: _l.padding[3],
                      y: 0,
                  };
                  _dsly.totalBoundSpace += _dlily.bound.h;
              }
          }
          /**
           * Calculate the gap spacing between the dimensions.
           */
          if (isHorizontal) {
              _dsly.gap = dimCount > 1 ? (_l.drawRect.w - _dsly.totalBoundSpace) / (dimCount - 1) : 0;
          }
          else {
              _dsly.gap = dimCount > 1 ? (_l.drawRect.h - _dsly.totalBoundSpace) / (dimCount - 1) : 0;
          }
          /**
           * Update the dimension bounding position.
           */
          let traversed = isHorizontal ? _l.padding[3] : _l.padding[0];
          for (let i = 0; i < dimCount; i++) {
              const _dlily = _.dims.list[i].layout;
              if (isHorizontal) {
                  _dlily.bound.x = traversed;
                  _dlily.axisStart = { x: _dlily.spaceBefore, y: _dsa.start - _l.padding[0] };
                  _dlily.axisStop = { x: _dlily.spaceBefore, y: _dsa.stop - _l.padding[0] };
                  _dlily.labelPoint = {
                      x: _dlily.spaceBefore,
                      y: placement === LabelPlacement.Before
                          ? _dsa.start - dimLabelStyle.offset - _l.padding[0]
                          : _dsa.stop + dimLabelStyle.offset - _l.padding[0],
                  };
                  traversed += _dsly.gap + _dlily.bound.w;
              }
              else {
                  _dlily.bound.y = traversed;
                  _dlily.axisStart = { x: _dsa.start - _l.padding[3], y: _dlily.spaceBefore };
                  _dlily.axisStop = { x: _dsa.stop - _l.padding[3], y: _dlily.spaceBefore };
                  _dlily.labelPoint = {
                      x: placement === LabelPlacement.Before
                          ? _dsa.start - dimLabelStyle.offset - _l.padding[1]
                          : _dsa.stop + dimLabelStyle.offset - _l.padding[1],
                      y: _dlily.spaceBefore,
                  };
                  traversed += _dsly.gap + _dlily.bound.h;
              }
          }
          this._ = _;
          console.log(this._);
          drawLine(this.ctx, 0, _l.padding[0], this.size.w, _l.padding[0]);
          drawLine(this.ctx, 0, this.size.h - _l.padding[2], this.size.w, this.size.h - _l.padding[2]);
          drawLine(this.ctx, _l.padding[3], 0, _l.padding[3], this.size.h);
          drawLine(this.ctx, this.size.w - _l.padding[1], 0, this.size.w - _l.padding[1], this.size.h);
          _.dims.list.forEach((dim) => {
              const bound = dim.layout.bound;
              const axisStart = dim.layout.axisStart;
              const axisStop = dim.layout.axisStop;
              const labelPoint = dim.layout.labelPoint;
              drawRect(this.ctx, bound.x, bound.y, bound.w, bound.h);
              drawCircle(this.ctx, bound.x + labelPoint.x, bound.y + labelPoint.y, 3);
              drawLine(this.ctx, bound.x + axisStart.x, bound.y + axisStart.y, bound.x + axisStop.x, bound.y + axisStop.y, { strokeStyle: 'purple' });
          });
          const font = getFont(this.options.style.dimension.label.font);
          const rad = this.options.style.dimension.label.angle || 0;
          this.dimensions.forEach((dimension, index) => {
              const bound = _.dims.list[index].layout.bound;
              const labelPoint = _.dims.list[index].layout.labelPoint;
              const x = bound.x + labelPoint.x;
              const y = bound.y + labelPoint.y;
              drawTextAngled(this.ctx, dimension.label, font, x, y, rad);
          });
      }
      setSize(w, h) {
          this.canvas.width = w;
          this.canvas.height = h;
          this.size = { h, w };
      }
  }

  return Hermes;

})();
