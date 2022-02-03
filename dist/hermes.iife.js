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
  const isNumber = (data) => typeof data === 'number';
  const isString = (data) => typeof data === 'string';
  const clone = (data) => {
      return JSON.parse(JSON.stringify(data));
  };
  const getDataRange = (data) => {
      return data.reduce((acc, x) => {
          if (isNumber(x)) {
              if (x > acc[1])
                  acc[1] = x;
              if (x < acc[0])
                  acc[0] = x;
          }
          return acc;
      }, [Infinity, -Infinity]);
  };

  const readableNumber = (num, precision = 6) => {
      let readable = num.toString();
      if (isNaN(num)) {
          readable = 'NaN';
      }
      else if (!Number.isFinite(num)) {
          readable = `${num < 0 ? '-' : ''}Infinity`;
      }
      else if (!Number.isInteger(num)) {
          readable = num.toFixed(precision);
          const absoluteNum = Math.abs(num);
          if (absoluteNum < 0.01 || absoluteNum > 999) {
              readable = num.toExponential(precision);
          }
      }
      return readable;
  };
  const readableTick = (num) => {
      let readable = readableNumber(num);
      readable = readable.replace(/(\.[0-9]+?)0+(e-?\d+)?$/, '$1$2'); // e.g. 0.750000 => 0.75
      readable = readable.replace(/\.(e)/, '$1'); // e.g. 2.e5 => 2e5
      return readable;
  };
  const value2str = (value) => {
      return isString(value) ? value : value.toString();
  };

  /**
   * NiceScale solves the problem of generating human friendly ticks for chart axes.
   * Normal generative tick techniques make tick marks that jarring for the human to read.
   *
   * https://stackoverflow.com/questions/8506881/nice-label-algorithm-for-charts-with-minimum-ticks
   */
  const MIN_TICK_DISTANCE = 50;
  class NiceScale {
      /**
       * Instantiates a new instance of the NiceScale class.
       *
       * @param minValue the minimum data point on the axis
       * @param maxValue the maximum data point on the axis
       * @param maxTicks the maximum number of tick marks for the axis
       */
      constructor(minValue, maxValue) {
          this.minValue = minValue;
          this.maxValue = maxValue;
          this.range = 0;
          this.tickLabels = [];
          this.tickPos = [];
          this.ticks = [];
          this.tickSpacing = 0;
          this.axisLength = 1;
          this.maxTicks = 1;
          this.minValue = minValue;
          this.maxValue = maxValue;
          this.max = maxValue;
          this.min = minValue;
      }
      setAxisLength(axisLength) {
          this.axisLength = axisLength;
          this.maxTicks = axisLength / MIN_TICK_DISTANCE;
          this.calculate();
      }
      setMinMaxValues(minValue, maxValue) {
          this.minValue = minValue;
          this.maxValue = maxValue;
          this.calculate();
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

  class CategoricalScale extends NiceScale {
      constructor(categories = []) {
          super(0, 0);
          this.categories = categories;
          this.tickLabels = this.categories.map(category => value2str(category));
      }
      posToValue(pos) {
          let distance = Infinity;
          let value = Number.NaN;
          for (let i = 0; i < this.tickPos.length; i++) {
              const tickPos = this.tickPos[i];
              const dp = Math.abs(pos - tickPos);
              if (dp < distance) {
                  distance = dp;
                  value = this.categories[i];
              }
          }
          return value;
      }
      valueToPos(value) {
          const stringValue = value2str(value);
          const index = this.tickLabels.findIndex(label => label === stringValue);
          if (index !== -1)
              return this.tickPos[index];
          return 0;
      }
      valueToPercent(value) {
          const stringValue = value2str(value);
          const index = this.tickLabels.findIndex(label => label === stringValue);
          if (index !== -1)
              return index / this.tickLabels.length;
          return 0;
      }
      calculate() {
          // Calculate tick positions based on axis length and ticks.
          let traversed = 0;
          this.tickSpacing = this.axisLength / this.tickLabels.length;
          this.tickPos = [];
          for (let i = 0; i < this.tickLabels.length; i++) {
              if (i === 0 || i === this.tickLabels.length) {
                  traversed += this.tickSpacing / 2;
              }
              else {
                  traversed += this.tickSpacing;
              }
              this.tickPos.push(traversed);
          }
      }
  }

  const MESSAGE_PREFIX = '[Hermes]';
  const DEFAULT_MESSAGE = 'Critical error encountered!';
  class HermesError extends Error {
      constructor(e) {
          const message = isError(e) ? e.message : (isString(e) ? e : DEFAULT_MESSAGE);
          super(`${MESSAGE_PREFIX} ${message}`);
      }
  }

  class LinearScale extends NiceScale {
      valueToPos(value) {
          return this.valueToPercent(value) * this.axisLength;
      }
      posToValue(pos) {
          const min = this.ticks[0];
          const max = this.ticks[this.ticks.length - 1];
          return (pos / this.axisLength) * (max - min) + min;
      }
      valueToPercent(value) {
          if (!isNumber(value))
              return 0;
          const min = this.ticks[0];
          const max = this.ticks[this.ticks.length - 1];
          return (value - min) / (max - min);
      }
      calculate() {
          this.range = this.niceNum(this.maxValue - this.minValue, false);
          this.tickSpacing = this.niceNum(this.range / this.maxTicks, true);
          this.min = Math.floor(this.minValue / this.tickSpacing) * this.tickSpacing;
          this.max = Math.ceil(this.maxValue / this.tickSpacing) * this.tickSpacing;
          /**
           * Generate ticks based on min, max and tick spacing.
           * Due to rounding errors, the final tick can get cut off if
           * traversing from `min` to `max` with fractional `tickSpacing`.
           * Instead pre-calculate number of ticks and calculate accordingly.
           */
          const count = Math.round((this.max - this.min) / this.tickSpacing);
          this.ticks = [];
          this.tickLabels = [];
          for (let i = 0; i <= count; i++) {
              const tick = i * this.tickSpacing + this.min;
              this.ticks.push(tick);
              this.tickLabels.push(readableTick(tick));
          }
          // Calculate tick positions based on axis length and ticks.
          const offset = this.axisLength / (this.ticks.length - 1);
          this.tickPos = [];
          for (let i = 0; i < this.ticks.length; i++) {
              this.tickPos.push(i * offset);
          }
      }
  }

  const DEFAULT_LOG_BASE = 10;
  class LogScale extends NiceScale {
      constructor(minValue, maxValue, logBase = DEFAULT_LOG_BASE) {
          super(minValue, maxValue);
          this.logBase = logBase;
          this.maxExp = Number.NaN;
          this.minExp = Number.NaN;
          this.denominator = 1;
          this.log = Math.log;
          this.logBase = logBase;
      }
      setMinMaxValues(minValue, maxValue, logBase = DEFAULT_LOG_BASE) {
          this.minValue = minValue;
          this.maxValue = maxValue;
          this.logBase = logBase;
          this.calculate();
      }
      posToValue(pos) {
          const exp = (pos / this.axisLength) * (this.maxExp - this.minExp);
          return this.logBase ** exp;
      }
      valueToPos(value) {
          return this.valueToPercent(value) * this.axisLength;
      }
      valueToPercent(value) {
          if (!isNumber(value))
              return 0;
          const exp = this.log(value) / this.denominator;
          return (exp - this.minExp) / (this.maxExp - this.minExp);
      }
      calculate() {
          this.log = this.logBase === 10 ? Math.log10 : this.logBase === 2 ? Math.log2 : Math.log;
          this.denominator = this.log === Math.log ? Math.log(this.logBase) : 1;
          this.minExp = Math.floor(this.log(this.minValue) / this.denominator);
          this.maxExp = Math.ceil(this.log(this.maxValue) / this.denominator);
          this.range = this.logBase ** this.maxExp - this.logBase ** this.minExp;
          this.tickSpacing = 1;
          /**
           * For log scale, tick spacing is exp based rather than actual log values.
           * Generate ticks based on `minExp`, `maxExp` and `tickSpacing`.
           * Due to rounding errors, the final tick can get cut off if
           * traversing from `minExp` to `maxExp` with fractional `tickSpacing`.
           * Instead pre-calculate number of ticks and calculate accordingly.
           */
          const count = Math.round((this.maxExp - this.minExp) / this.tickSpacing);
          this.ticks = [];
          this.tickLabels = [];
          for (let i = 0; i <= count; i++) {
              const tickExp = i * this.tickSpacing + this.minExp;
              const tickValue = this.logBase ** tickExp;
              this.ticks.push(tickValue);
              this.tickLabels.push(readableTick(tickValue));
          }
          // Calculate tick positions based on axis length and ticks.
          const offset = this.axisLength / (this.ticks.length - 1);
          this.tickPos = [];
          for (let i = 0; i < this.ticks.length; i++) {
              this.tickPos.push(i * offset);
          }
      }
  }

  /**
   * ENUMERABLES
   */
  var AxisType;
  (function (AxisType) {
      AxisType["Categorical"] = "categorical";
      AxisType["Linear"] = "linear";
      AxisType["Logarithmic"] = "logarithmic";
  })(AxisType || (AxisType = {}));
  var DimensionLayout;
  (function (DimensionLayout) {
      DimensionLayout["AxisEvenlySpaced"] = "axis-evenly-spaced";
      DimensionLayout["Equidistant"] = "equidistant";
      DimensionLayout["EvenlySpaced"] = "evenly-spaced";
  })(DimensionLayout || (DimensionLayout = {}));
  var Direction;
  (function (Direction) {
      Direction["Horizontal"] = "horizontal";
      Direction["Vertical"] = "vertical";
  })(Direction || (Direction = {}));
  var DragType;
  (function (DragType) {
      DragType["DimensionFilterCreate"] = "dimension-filter-create";
      DragType["DimensionFilterMove"] = "dimension-filter-move";
      DragType["DimensionFilterResizeAfter"] = "dimension-filter-resize-after";
      DragType["DimensionFilterResizeBefore"] = "dimension-filter-resize-before";
      DragType["DimensionLabel"] = "dimension-label";
      DragType["None"] = "none";
  })(DragType || (DragType = {}));
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
  var LabelPlacement;
  (function (LabelPlacement) {
      LabelPlacement["After"] = "after";
      LabelPlacement["Before"] = "before";
  })(LabelPlacement || (LabelPlacement = {}));
  var PathType;
  (function (PathType) {
      PathType["Bezier"] = "bezier";
      PathType["Straight"] = "straight";
  })(PathType || (PathType = {}));

  const BEZIER_FACTOR = 0.3;
  const DIRECTION = 'inherit';
  const FILL_STYLE = 'black';
  const FONT = 'normal 12px san-serif';
  const LINE_CAP = 'butt';
  const LINE_DASH_OFFSET = 0.0;
  const LINE_JOIN = 'round';
  const LINE_WIDTH = 1.0;
  const MITER_LIMIT = 10.0;
  const STROKE_STYLE = 'black';
  const TEXT_BASELINE = 'middle';
  const INVALID_VALUE = Number.NaN;
  const HERMES_OPTIONS = {
      direction: Direction.Horizontal,
      style: {
          axes: {
              axis: {
                  boundaryPadding: 15,
                  lineWidth: 1,
                  strokeStyle: 'rgba(147, 147, 147, 1.0)',
              },
              filter: {
                  fillStyle: 'rgba(0, 0, 0, 1.0)',
                  strokeStyle: 'rgba(255, 255, 255, 1.0)',
                  width: 4,
              },
              label: {
                  fillStyle: 'rgba(0, 0, 0, 1.0)',
                  font: 'normal 11px sans-serif',
                  lineWidth: 3,
                  offset: 4,
                  placement: LabelPlacement.Before,
                  strokeStyle: 'rgba(255, 255, 255, 1.0)',
              },
              tick: {
                  length: 4,
                  lineWidth: 1,
                  strokeStyle: 'rgba(147, 147, 147, 1.0)',
              },
          },
          data: {
              default: {
                  lineWidth: 1,
                  strokeStyle: 'rgba(82, 144, 244, 1.0)',
              },
              filtered: {
                  lineWidth: 1,
                  strokeStyle: 'rgba(82, 144, 244, 0.1)',
              },
              path: {
                  options: {},
                  type: PathType.Straight,
              },
          },
          dimension: {
              label: {
                  angle: Math.PI / 4,
                  boundaryPadding: 5,
                  fillStyle: 'rgba(0, 0, 0, 1.0)',
                  font: 'normal 11px sans-serif',
                  lineWidth: 3,
                  offset: 16,
                  placement: LabelPlacement.Before,
                  strokeStyle: 'rgba(255, 255, 255, 1.0)',
              },
              layout: DimensionLayout.AxisEvenlySpaced,
          },
          padding: [32, 16, 64, 16],
      },
  };
  const FILTER = {
      p0: Number.NaN,
      p1: Number.NaN,
      value0: Number.NaN,
      value1: Number.NaN,
  };
  const DRAG = {
      dimension: {
          bound0: undefined,
          bound1: undefined,
          offset: { x: 0, y: 0 },
      },
      filters: {
          active: FILTER,
          axes: {},
          key: undefined,
      },
      shared: {
          index: -1,
          p0: { x: Number.NaN, y: Number.NaN },
          p1: { x: Number.NaN, y: Number.NaN },
      },
      type: DragType.None,
  };

  const rotatePoint = (x, y, rad, px = 0, py = 0) => {
      const dx = (x - px);
      const dy = (y - py);
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      return {
          x: cos * dx - sin * dy + px,
          y: sin * dx + cos * dy + py,
      };
  };
  const dotProduct = (v0, v1) => {
      return v0.x * v1.x + v0.y * v1.y;
  };
  /**
   * Barycentric Technique on determining if a point is within a triangle.
   * https://blackpawn.com/texts/pointinpoly/default.html
   */
  const isPointInTriangle = (p, a, b, c) => {
      // Compute vectors.
      const v0 = { x: c.x - a.x, y: c.y - a.y };
      const v1 = { x: b.x - a.x, y: b.y - a.y };
      const v2 = { x: p.x - a.x, y: p.y - a.y };
      // Compute dot products.
      const dot00 = dotProduct(v0, v0);
      const dot01 = dotProduct(v0, v1);
      const dot02 = dotProduct(v0, v2);
      const dot11 = dotProduct(v1, v1);
      const dot12 = dotProduct(v1, v2);
      // Compute barycentric coordinates.
      const inverseDenominator = 1 / (dot00 * dot11 - dot01 * dot01);
      const u = (dot11 * dot02 - dot01 * dot12) * inverseDenominator;
      const v = (dot00 * dot12 - dot01 * dot02) * inverseDenominator;
      // Check if the point is in the triangle.
      return u >= 0 && v >= 0 && u + v < 1;
  };
  /**
   * Returns the percentage of intersection given two rectangles.
   * https://stackoverflow.com/a/9325084/5402432
   */
  const percentRectIntersection = (r0, r1) => {
      const [r0x0, r0x1, r0y0, r0y1] = [r0.x, r0.x + r0.w, r0.y, r0.y + r0.h];
      const [r1x0, r1x1, r1y0, r1y1] = [r1.x, r1.x + r1.w, r1.y, r1.y + r1.h];
      const intersectionArea = Math.max(0, Math.min(r0x1, r1x1) - Math.max(r0x0, r1x0)) *
          Math.max(0, Math.min(r0y1, r1y1) - Math.max(r0y0, r1y0));
      // const unionArea = (r0.w * r0.h) + (r1.w * r1.h) - intersectionArea;
      return intersectionArea / Math.min(r0.w * r0.h, r1.w * r1.h);
  };
  const shiftRect = (rect, shift) => {
      return { h: rect.h, w: rect.w, x: rect.x + shift.x, y: rect.y + shift.y };
  };

  const drawBoundary = (ctx, boundary, style = {}) => {
      ctx.save();
      if (ctx.fillStyle) {
          ctx.fillStyle = (style === null || style === void 0 ? void 0 : style.fillStyle) || '';
          ctx.beginPath();
          ctx.moveTo(boundary[0].x, boundary[0].y);
          for (let i = 1; i < boundary.length; i++) {
              ctx.lineTo(boundary[i].x, boundary[i].y);
          }
          ctx.closePath();
          ctx.fill();
      }
      if (ctx.strokeStyle) {
          ctx.lineCap = style.lineCap || LINE_CAP;
          ctx.lineDashOffset = style.lineDashOffset || LINE_DASH_OFFSET;
          ctx.lineJoin = style.lineJoin || LINE_JOIN;
          ctx.lineWidth = style.lineWidth || LINE_WIDTH;
          ctx.miterLimit = style.miterLimit || MITER_LIMIT;
          ctx.strokeStyle = style.strokeStyle || STROKE_STYLE;
          ctx.beginPath();
          ctx.moveTo(boundary[0].x, boundary[0].y);
          for (let i = 1; i < boundary.length; i++) {
              ctx.lineTo(boundary[i].x, boundary[i].y);
          }
          ctx.closePath();
          ctx.stroke();
      }
      ctx.restore();
  };
  const drawCircle = (ctx, x, y, radius, style = {}) => {
      ctx.save();
      if (ctx.fillStyle) {
          ctx.fillStyle = (style === null || style === void 0 ? void 0 : style.fillStyle) || '';
          ctx.moveTo(x + radius, y);
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.fill();
      }
      if (ctx.strokeStyle) {
          ctx.lineCap = style.lineCap || LINE_CAP;
          ctx.lineDashOffset = style.lineDashOffset || LINE_DASH_OFFSET;
          ctx.lineJoin = style.lineJoin || LINE_JOIN;
          ctx.lineWidth = style.lineWidth || LINE_WIDTH;
          ctx.miterLimit = style.miterLimit || MITER_LIMIT;
          ctx.strokeStyle = style.strokeStyle || STROKE_STYLE;
          ctx.moveTo(x + radius, y);
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.stroke();
      }
      ctx.restore();
  };
  const drawData = (ctx, data, isHorizontal, path, style = {}) => {
      var _a;
      if (data.length < 2)
          return;
      ctx.save();
      ctx.lineCap = style.lineCap || LINE_CAP;
      ctx.lineDashOffset = style.lineDashOffset || LINE_DASH_OFFSET;
      ctx.lineJoin = style.lineJoin || LINE_JOIN;
      ctx.lineWidth = style.lineWidth || LINE_WIDTH;
      ctx.miterLimit = style.miterLimit || MITER_LIMIT;
      ctx.strokeStyle = style.strokeStyle || STROKE_STYLE;
      ctx.beginPath();
      ctx.moveTo(data[0].x, data[0].y);
      const bezierFactor = (_a = path.options.bezierFactor) !== null && _a !== void 0 ? _a : BEZIER_FACTOR;
      for (let i = 1; i < data.length; i++) {
          const [x1, y1] = [data[i].x, data[i].y];
          if (path.type === PathType.Straight) {
              ctx.lineTo(x1, y1);
          }
          else if (path.type === PathType.Bezier) {
              const [x0, y0] = [data[i - 1].x, data[i - 1].y];
              const [cp0x, cp0y] = [
                  x0 + (isHorizontal ? (x1 - x0) * bezierFactor : 0),
                  y0 + (isHorizontal ? 0 : (y1 - y0) * bezierFactor),
              ];
              const [cp1x, cp1y] = [
                  x1 - (isHorizontal ? (x1 - x0) * bezierFactor : 0),
                  y1 - (isHorizontal ? 0 : (y1 - y0) * bezierFactor),
              ];
              ctx.bezierCurveTo(cp0x, cp0y, cp1x, cp1y, x1, y1);
          }
      }
      ctx.stroke();
      ctx.restore();
  };
  const drawLine = (ctx, x0, y0, x1, y1, style = {}) => {
      ctx.save();
      ctx.lineCap = style.lineCap || LINE_CAP;
      ctx.lineDashOffset = style.lineDashOffset || LINE_DASH_OFFSET;
      ctx.lineJoin = style.lineJoin || LINE_JOIN;
      ctx.lineWidth = style.lineWidth || LINE_WIDTH;
      ctx.miterLimit = style.miterLimit || MITER_LIMIT;
      ctx.strokeStyle = style.strokeStyle || STROKE_STYLE;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      ctx.restore();
  };
  const drawRect = (ctx, x, y, w, h, style = {}) => {
      ctx.save();
      if (style.fillStyle) {
          ctx.fillStyle = style.fillStyle || FILL_STYLE;
          ctx.fillRect(x, y, w, h);
      }
      if (style.strokeStyle) {
          ctx.lineCap = style.lineCap || LINE_CAP;
          ctx.lineDashOffset = style.lineDashOffset || LINE_DASH_OFFSET;
          ctx.lineJoin = style.lineJoin || LINE_JOIN;
          ctx.lineWidth = style.lineWidth || LINE_WIDTH;
          ctx.miterLimit = style.miterLimit || MITER_LIMIT;
          ctx.strokeStyle = style.strokeStyle || STROKE_STYLE;
          ctx.strokeRect(x, y, w, h);
      }
      ctx.restore();
  };
  const drawText = (ctx, text, x, y, rad, style = {}) => {
      const normalizedRad = normalizeRad(rad);
      const inwards = normalizedRad > Math.PI / 2 && normalizedRad <= 3 * Math.PI / 2;
      ctx.save();
      ctx.direction = style.direction || DIRECTION;
      ctx.font = style.font || FONT;
      ctx.textAlign = style.textAlign || (inwards ? 'right' : 'left');
      ctx.textBaseline = style.textBaseline || TEXT_BASELINE;
      ctx.translate(x, y);
      ctx.rotate(-rad - (inwards ? Math.PI : 0));
      ctx.translate(-x, -y);
      if (style.strokeStyle) {
          ctx.lineCap = style.lineCap || LINE_CAP;
          ctx.lineDashOffset = style.lineDashOffset || LINE_DASH_OFFSET;
          ctx.lineJoin = style.lineJoin || LINE_JOIN;
          ctx.lineWidth = style.lineWidth || LINE_WIDTH;
          ctx.miterLimit = style.miterLimit || MITER_LIMIT;
          ctx.strokeStyle = style.strokeStyle || STROKE_STYLE;
          ctx.strokeText(text, x, y);
      }
      if (style.fillStyle) {
          ctx.fillStyle = style.fillStyle || FILL_STYLE;
          ctx.fillText(text, x, y);
      }
      ctx.restore();
  };
  const getTextBoundary = (x, y, w, h, rad, offsetX = 0, offsetY = 0, padding = 0) => {
      const x0 = x + offsetX - padding;
      const y0 = y + offsetY - padding;
      const x1 = x + w + offsetX + padding;
      const y1 = y + h + offsetY + padding;
      const boundary = [
          { x: x0, y: y0 },
          { x: x1, y: y0 },
          { x: x1, y: y1 },
          { x: x0, y: y1 },
      ];
      if (rad != null) {
          const normalizedRad = normalizeRad(rad);
          return boundary.map(point => rotatePoint(point.x, point.y, -normalizedRad, x, y));
      }
      return boundary;
  };
  const getTextSize = (ctx, text, font = FONT) => {
      ctx.font = font;
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
  const normalizeRad = (rad) => {
      return (rad + 2 * Math.PI) % (2 * Math.PI);
  };

  const hex2rgb = (hex) => {
      const rgb = { b: 0, g: 0, r: 0 };
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (result && result.length > 3) {
          rgb.r = parseInt(result[1], 16);
          rgb.g = parseInt(result[2], 16);
          rgb.b = parseInt(result[3], 16);
      }
      return rgb;
  };
  const rgba2str = (rgba) => {
      if (rgba.a != null) {
          return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
      }
      return `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`;
  };
  const rgbaFromGradient = (rgba0, rgba1, percent) => {
      const r = Math.round((rgba1.r - rgba0.r) * percent + rgba0.r);
      const g = Math.round((rgba1.g - rgba0.g) * percent + rgba0.g);
      const b = Math.round((rgba1.b - rgba0.b) * percent + rgba0.b);
      if (rgba0.a != null && rgba1.a != null) {
          const a = (rgba1.a - rgba0.a) * percent + rgba0.a;
          return { a, b, g, r };
      }
      return { b, g, r };
  };
  const scale2rgba = (colors, percent) => {
      const count = colors.length;
      if (count < 1)
          return '#000000';
      if (count === 1)
          return colors[0];
      const index = percent * (count - 1);
      const i0 = Math.floor(index);
      const i1 = Math.ceil(index);
      const color0 = str2rgba(colors[i0]);
      const color1 = str2rgba(colors[i1]);
      const rgba = rgbaFromGradient(color0, color1, index - i0);
      return rgba2str(rgba);
  };
  const str2rgba = (str) => {
      if (/^#/.test(str))
          return hex2rgb(str);
      const regex = /^rgba?\(\s*?(\d+)\s*?,\s*?(\d+)\s*?,\s*?(\d+)\s*?(,\s*?([\d.]+)\s*?)?\)$/i;
      const result = regex.exec(str);
      if (result && result.length > 3) {
          const rgba = { a: 1.0, b: 0, g: 0, r: 0 };
          rgba.r = parseInt(result[1]);
          rgba.g = parseInt(result[2]);
          rgba.b = parseInt(result[3]);
          if (result.length > 5)
              rgba.a = parseFloat(result[5]);
          return rgba;
      }
      return { a: 0.0, b: 0, g: 0, r: 0 };
  };

  const getElement = (target) => {
      if (!isString(target))
          return target;
      return document.querySelector(target);
  };

  const getAxisPositionValue = (pos, range, scale) => {
      const posCapped = Math.min(range, Math.max(0, pos)) - 0;
      return scale.posToValue(posCapped);
  };
  const getDragBound = (index, drag, bound) => {
      const isLabelDrag = drag.type === DragType.DimensionLabel && drag.shared.index === index;
      return isLabelDrag && drag.dimension.bound1 ? drag.dimension.bound1 : bound;
  };
  const isFilterEmpty = (filter) => {
      return isNaN(filter.p0) && isNaN(filter.p1);
  };
  const isIntersectingFilters = (filter0, filter1) => {
      return filter0.p0 <= filter1.p1 && filter1.p0 <= filter0.p1;
  };
  const mergeFilters = (filter0, filter1) => {
      const newFilter = clone(FILTER);
      if (filter0.p0 < filter1.p0) {
          newFilter.p0 = filter0.p0;
          newFilter.value0 = filter0.value0;
      }
      else {
          newFilter.p0 = filter1.p0;
          newFilter.value0 = filter1.value0;
      }
      if (filter0.p1 > filter1.p1) {
          newFilter.p1 = filter0.p1;
          newFilter.value1 = filter0.value1;
      }
      else {
          newFilter.p1 = filter1.p1;
          newFilter.value1 = filter1.value1;
      }
      return newFilter;
  };

  const scale = new LinearScale(0, 100);
  const dimensionSamples = [
      {
          axis: { range: [0.2, 0.8], scale, type: AxisType.Linear },
          key: 'dropout',
          label: 'Dropout',
      },
      {
          axis: { range: [5, 30], scale, type: AxisType.Linear },
          key: 'global-batch-size',
          label: 'Global Batch Size',
      },
      {
          axis: { categories: [4, 8, 16, 32, 64], scale, type: AxisType.Categorical },
          key: 'layer-dense-size',
          label: 'Layer Dense Size',
      },
      {
          axis: { categories: [true, false], scale, type: AxisType.Categorical },
          key: 'layer-inverse',
          label: 'Layer Inverse',
      },
      {
          axis: { logBase: 10, range: [0.0001, 0.1], scale, type: AxisType.Logarithmic },
          key: 'learning-rate',
          label: 'Learning Rate',
      },
      {
          axis: { logBase: 10, range: [0.000001, 0.001], scale, type: AxisType.Logarithmic },
          key: 'learning-rate-decay',
          label: 'Learning Rate Decay',
      },
      {
          axis: { logBase: 2, range: [1, 16], scale, type: AxisType.Logarithmic },
          key: 'layer-split-factor',
          label: 'Layer Split Factor',
      },
      {
          axis: { range: [0.5, 0.9], scale, type: AxisType.Linear },
          key: 'metrics-base',
          label: 'Metrics Base',
      },
      {
          axis: { range: [8, 64], scale, type: AxisType.Linear },
          key: 'n-filters',
          label: 'N Filters',
      },
  ];
  const metricDimensionSamples = [
      {
          axis: { range: [0.55, 0.99], scale, type: AxisType.Linear },
          key: 'accuracy',
          label: 'Accuracy',
      },
      {
          axis: { range: [1.7, 2.4], scale, type: AxisType.Linear },
          key: 'loss',
          label: 'Loss',
      },
  ];
  const generateData = (dimensions, count) => {
      return dimensions.reduce((acc, dimension) => {
          const axis = dimension.axis;
          acc[dimension.key] = new Array(count).fill(null).map(() => {
              if (axis.type === AxisType.Categorical) {
                  return axis.categories ? randomItem(axis.categories) : INVALID_VALUE;
              }
              else if (axis.type === AxisType.Linear) {
                  return axis.range ? randomNumber(axis.range[1], axis.range[0]) : INVALID_VALUE;
              }
              else if (axis.type === AxisType.Logarithmic) {
                  return axis.range && axis.logBase
                      ? randomLogNumber(axis.logBase, axis.range[1], axis.range[0]) : INVALID_VALUE;
              }
              return INVALID_VALUE;
          });
          return acc;
      }, {});
  };
  const generateDimensions = (dimCount = 10, random = true) => {
      // Generate the dimensions based on config.
      const dims = new Array(dimCount - 1).fill(null).map((_, index) => {
          if (random)
              return randomItem(dimensionSamples);
          return dimensionSamples[index % dimensionSamples.length];
      });
      // Add a metric dimension to the end.
      dims.push(randomItem(metricDimensionSamples));
      return dims;
  };
  const randomInt = (max, min = 0) => {
      return Math.floor(Math.random() * (max - min)) + min;
  };
  const randomItem = (list) => {
      return list[randomInt(list.length)];
  };
  const randomLogNumber = (base, max, min) => {
      const log = base === 10 ? Math.log10 : base === 2 ? Math.log2 : Math.log;
      const denominator = log === Math.log ? Math.log(base) : 1;
      const maxExp = log(max) / denominator;
      const minExp = log(min) / denominator;
      return base ** randomNumber(maxExp, minExp);
  };
  const randomNumber = (max, min) => {
      return Math.random() * (max - min) + min;
  };

  var tester = /*#__PURE__*/Object.freeze({
    __proto__: null,
    generateData: generateData,
    generateDimensions: generateDimensions,
    randomInt: randomInt,
    randomItem: randomItem,
    randomLogNumber: randomLogNumber,
    randomNumber: randomNumber
  });

  class Hermes {
      constructor(target, data, dimensions, options = {}) {
          this.size = { h: 0, w: 0 };
          this.drag = clone(DRAG);
          this.filters = {};
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
          // Must have at least one dimension data available.
          if (Object.keys(data).length === 0)
              throw new HermesError('Need at least one dimension data record.');
          // All the dimension data should be equal in size.
          this.dataCount = 0;
          Object.values(data).forEach((dimData, i) => {
              if (i === 0) {
                  this.dataCount = dimData.length;
              }
              else if (this.dataCount !== dimData.length) {
                  throw new HermesError('The dimension data are not all identical in size.');
              }
          });
          this.data = data;
          if (dimensions.length === 0)
              throw new HermesError('Need at least one dimension defined.');
          this.dimensions = dimensions;
          this.options = deepmerge(HERMES_OPTIONS, options);
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
      static getTester() {
          return tester;
      }
      destroy() {
          this.resizeObserver.unobserve(this.element);
      }
      setSize(w, h) {
          this.canvas.width = w;
          this.canvas.height = h;
          this.size = { h, w };
      }
      calculate() {
          this.calculateScales();
          this.calculateLayout();
          this.draw();
      }
      calculateScales() {
          this.dimensions.forEach(dimension => {
              const _da = dimension.axis;
              const key = dimension.key;
              const data = this.data[key] || [];
              if ([AxisType.Linear, AxisType.Logarithmic].includes(_da.type)) {
                  _da.range = getDataRange(data);
                  if (_da.type === AxisType.Linear) {
                      _da.scale = new LinearScale(_da.range[0], _da.range[1]);
                  }
                  else if (_da.type === AxisType.Logarithmic) {
                      _da.scale = new LogScale(_da.range[0], _da.range[1], _da.logBase);
                  }
              }
              else if (_da.type === AxisType.Categorical) {
                  _da.scale = new CategoricalScale(_da.categories);
              }
          });
      }
      calculateLayout() {
          var _a, _b;
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
          const { h, w } = this.size;
          const _l = _.layout;
          const _dsa = _.dims.shared.axes;
          const _dsl = _.dims.shared.label;
          const _dsly = _.dims.shared.layout;
          const dimCount = this.dimensions.length;
          const isHorizontal = this.options.direction === Direction.Horizontal;
          const dimLabelStyle = this.options.style.dimension.label;
          const dimLabelBoundaryPadding = this.options.style.dimension.label.boundaryPadding;
          const dimLayout = this.options.style.dimension.layout;
          const axesLabelStyle = this.options.style.axes.label;
          const axisBoundaryPadding = this.options.style.axes.axis.boundaryPadding;
          const isLabelBefore = dimLabelStyle.placement === LabelPlacement.Before;
          const isLabelAngled = dimLabelStyle.angle != null;
          const isAxesBefore = axesLabelStyle.placement === LabelPlacement.Before;
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
          _dsl.cos = isLabelAngled ? Math.cos((_a = dimLabelStyle.angle) !== null && _a !== void 0 ? _a : 0) : undefined;
          _dsl.sin = isLabelAngled ? Math.sin((_b = dimLabelStyle.angle) !== null && _b !== void 0 ? _b : 0) : undefined;
          _dsl.rad = dimLabelStyle.angle || (isHorizontal ? undefined : (isLabelBefore ? -Math.PI : 0));
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
              }
              else {
                  const labelOffset = isLabelAngled ? Math.max(0, -_dsl.maxLengthSin) : _dsl.maxLengthSin;
                  _dsa.start = _l.padding[0];
                  _dsa.stop = h - _l.padding[2] - labelOffset - dimLabelStyle.offset;
              }
          }
          else {
              if (isLabelBefore) {
                  const labelOffset = isLabelAngled ? Math.max(0, -_dsl.maxLengthCos) : _dsl.maxLengthCos;
                  _dsa.start = _l.padding[3] + labelOffset + dimLabelStyle.offset;
                  _dsa.stop = w - _l.padding[1];
              }
              else {
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
              const scale = dimension.axis.scale;
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
              if (isAxesBefore) {
                  _dlily.spaceBefore = Math.max(_dlily.spaceBefore, _dlia.maxLength);
              }
              else {
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
              }
              else {
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
          }
          else {
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
                  if (dimLayout === DimensionLayout.AxisEvenlySpaced) {
                      _dlily.bound.x = _dsly.offset + i * _dsly.space + _dsly.space / 2 - _dlily.spaceBefore;
                  }
                  else if (dimLayout === DimensionLayout.Equidistant) {
                      _dlily.bound.x = _dsly.offset + i * _dsly.space + (_dsly.space - _dlily.bound.w) / 2;
                  }
                  else if (dimLayout === DimensionLayout.EvenlySpaced) {
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
              }
              else {
                  if (dimLayout === DimensionLayout.AxisEvenlySpaced) {
                      _dlily.bound.y = _dsly.offset + i * _dsly.space + _dsly.space / 2 - _dlily.spaceBefore;
                  }
                  else if (dimLayout === DimensionLayout.Equidistant) {
                      _dlily.bound.y = _dsly.offset + i * _dsly.space + (_dsly.space - _dlily.bound.h) / 2;
                  }
                  else if (dimLayout === DimensionLayout.EvenlySpaced) {
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
              _dlily.labelBoundary = getTextBoundary(_dlily.bound.x + _dlily.labelPoint.x, _dlily.bound.y + _dlily.labelPoint.y, _dlil.w, _dlil.h, _dsl.rad, isLabelAngled ? 0 : offsetX, isLabelAngled ? -_dlil.h / 2 : offsetY, dimLabelBoundaryPadding);
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
      mergeFilters() {
          Object.keys(this.filters).forEach(key => {
              const filters = this.filters[key] || [];
              for (let i = 0; i < filters.length - 1; i++) {
                  for (let j = i + 1; j < filters.length; j++) {
                      if (isFilterEmpty(filters[i]) || isFilterEmpty(filters[j]))
                          continue;
                      /**
                       * If overlap, merge into higher indexed filter and remove lower indexed
                       * filter to avoid checking the removed filter during the loop.
                       */
                      if (isIntersectingFilters(filters[i], filters[j])) {
                          filters[j] = mergeFilters(filters[i], filters[j]);
                          filters[i] = { ...FILTER };
                      }
                  }
              }
              this.filters[key] = filters.filter(filter => !isFilterEmpty(filter));
          });
      }
      draw() {
          var _a;
          if (!this._)
              return;
          // console.time('render time');
          const { h, w } = this.size;
          const _dl = this._.dims.list;
          const _dsl = this._.dims.shared.label;
          const _drag = this.drag;
          const _filters = this.filters;
          const isHorizontal = this.options.direction === Direction.Horizontal;
          const axesStyle = this.options.style.axes;
          const dataStyle = this.options.style.data;
          const dimStyle = this.options.style.dimension;
          const isLabelBefore = dimStyle.label.placement === LabelPlacement.Before;
          const isAxesBefore = axesStyle.label.placement === LabelPlacement.Before;
          // Clear previous canvas drawings.
          this.ctx.clearRect(0, 0, w, h);
          // Draw data lines.
          const dimColorKey = (_a = dataStyle.colorScale) === null || _a === void 0 ? void 0 : _a.dimensionKey;
          for (let k = 0; k < this.dataCount; k++) {
              let dataDefaultStyle = dataStyle.default;
              let hasFilters = false;
              let isFilteredOut = false;
              const series = this.dimensions.map((dimension, i) => {
                  var _a, _b, _c, _d, _e;
                  const key = dimension.key;
                  const layout = _dl[i].layout;
                  const bound = getDragBound(i, _drag, layout.bound);
                  const value = this.data[key][k];
                  const pos = (_b = (_a = dimension.axis.scale) === null || _a === void 0 ? void 0 : _a.valueToPos(value)) !== null && _b !== void 0 ? _b : 0;
                  const x = bound.x + layout.axisStart.x + (isHorizontal ? 0 : pos);
                  const y = bound.y + layout.axisStart.y + (isHorizontal ? pos : 0);
                  if (dimColorKey === key) {
                      const percent = (_d = (_c = dimension.axis.scale) === null || _c === void 0 ? void 0 : _c.valueToPercent(value)) !== null && _d !== void 0 ? _d : 0;
                      const scaleColor = scale2rgba(((_e = dataStyle.colorScale) === null || _e === void 0 ? void 0 : _e.colors) || [], percent);
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
                          if (pos >= filterMin && pos <= filterMax) {
                              hasMatchedFilter = true;
                              break;
                          }
                      }
                      if (!hasMatchedFilter)
                          isFilteredOut = true;
                  }
                  return { x, y };
              });
              if (hasFilters && isFilteredOut)
                  dataDefaultStyle = dataStyle.filtered;
              drawData(this.ctx, series, isHorizontal, dataStyle.path, dataDefaultStyle);
          }
          // Draw dimension labels.
          const dimTextStyle = dimStyle.label;
          if (dimStyle.label.angle == null) {
              dimTextStyle.textAlign = isHorizontal ? 'center' : undefined;
              dimTextStyle.textBaseline = isHorizontal ? (isLabelBefore ? 'bottom' : 'top') : undefined;
          }
          this.dimensions.forEach((dimension, i) => {
              var _a;
              const bound = getDragBound(i, _drag, _dl[i].layout.bound);
              const labelPoint = _dl[i].layout.labelPoint;
              const x = bound.x + labelPoint.x;
              const y = bound.y + labelPoint.y;
              drawText(this.ctx, dimension.label, x, y, (_a = _dsl.rad) !== null && _a !== void 0 ? _a : 0, dimTextStyle);
          });
          // Draw dimension axes.
          const drawTickTextStyle = axesStyle.label;
          if (axesStyle.label.angle == null) {
              drawTickTextStyle.textAlign = isHorizontal ? undefined : 'center';
              drawTickTextStyle.textBaseline = isHorizontal ? undefined : (isAxesBefore ? 'bottom' : 'top');
          }
          _dl.forEach((dim, i) => {
              const key = this.dimensions[i].key;
              const bound = getDragBound(i, _drag, dim.layout.bound);
              const axisStart = dim.layout.axisStart;
              const axisStop = dim.layout.axisStop;
              const tickLabels = dim.axes.tickLabels;
              const tickPos = dim.axes.tickPos;
              const tickLengthFactor = isAxesBefore ? -1 : 1;
              const filters = _filters[key] || [];
              drawLine(this.ctx, bound.x + axisStart.x, bound.y + axisStart.y, bound.x + axisStop.x, bound.y + axisStop.y, axesStyle.axis);
              for (let i = 0; i < tickLabels.length; i++) {
                  const xOffset = isHorizontal ? 0 : tickPos[i];
                  const yOffset = isHorizontal ? tickPos[i] : 0;
                  const xTickLength = isHorizontal ? tickLengthFactor * axesStyle.tick.length : 0;
                  const yTickLength = isHorizontal ? 0 : tickLengthFactor * axesStyle.tick.length;
                  const x0 = bound.x + axisStart.x + xOffset;
                  const y0 = bound.y + axisStart.y + yOffset;
                  const x1 = bound.x + axisStart.x + xOffset + xTickLength;
                  const y1 = bound.y + axisStart.y + yOffset + yTickLength;
                  drawLine(this.ctx, x0, y0, x1, y1, axesStyle.tick);
                  const cx = isHorizontal ? x1 + tickLengthFactor * axesStyle.label.offset : x0;
                  const cy = isHorizontal ? y0 : y1 + tickLengthFactor * axesStyle.label.offset;
                  const rad = axesStyle.label.angle != null
                      ? axesStyle.label.angle
                      : (isHorizontal && isAxesBefore ? Math.PI : 0);
                  const tickLabel = tickLabels[i];
                  drawText(this.ctx, tickLabel, cx, cy, rad, drawTickTextStyle);
              }
              filters.forEach(filter => {
                  const halfWidth = axesStyle.filter.width / 2;
                  const x = bound.x + axisStart.x + (isHorizontal ? -halfWidth : filter.p0);
                  const y = bound.y + axisStart.y + (isHorizontal ? filter.p0 : -halfWidth);
                  const w = isHorizontal ? axesStyle.filter.width : filter.p1 - filter.p0;
                  const h = isHorizontal ? filter.p1 - filter.p0 : axesStyle.filter.width;
                  drawRect(this.ctx, x, y, w, h, axesStyle.filter);
              });
          });
          // console.timeEnd('render time');
      }
      drawDebugOutline() {
          if (!this._)
              return;
          const { h, w } = this.size;
          const _l = this._.layout;
          const _dl = this._.dims.list;
          const _dsly = this._.dims.shared.layout;
          const isHorizontal = this.options.direction === Direction.Horizontal;
          // Draw the drawing area by outlining paddings.
          const paddingStyle = { strokeStyle: '#dddddd' };
          drawLine(this.ctx, 0, _l.padding[0], w, _l.padding[0], paddingStyle);
          drawLine(this.ctx, 0, h - _l.padding[2], w, h - _l.padding[2], paddingStyle);
          drawLine(this.ctx, _l.padding[3], 0, _l.padding[3], h, paddingStyle);
          drawLine(this.ctx, w - _l.padding[1], 0, w - _l.padding[1], h, paddingStyle);
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
              drawRect(this.ctx, isHorizontal ? _l.padding[3] + i * _dsly.space : bound.x, isHorizontal ? bound.y : _l.padding[0] + i * _dsly.space, isHorizontal ? _dsly.space : bound.w, isHorizontal ? bound.h : _dsly.space, dimStyle);
              drawRect(this.ctx, bound.x, bound.y, bound.w, bound.h, boundStyle);
              drawCircle(this.ctx, bound.x + labelPoint.x, bound.y + labelPoint.y, 3, labelPointStyle);
              drawBoundary(this.ctx, labelBoundary, labelBoundaryStyle);
              drawBoundary(this.ctx, axisBoundary, axisBoundaryStyle);
          });
      }
      handleMouseDown(e) {
          if (!this._)
              return;
          const [x, y] = [e.clientX, e.clientY];
          const _drag = this.drag;
          const _filter = this.filters;
          const _drs = this.drag.shared;
          const _drd = this.drag.dimension;
          const _drf = this.drag.filters;
          const _dl = this._.dims.list;
          const isHorizontal = this.options.direction === Direction.Horizontal;
          const filterKey = isHorizontal ? 'y' : 'x';
          this._.dims.list.forEach((dim, i) => {
              // Check to see if a dimension label was targeted.
              const labelBoundary = dim.layout.labelBoundary;
              if (isPointInTriangle({ x, y }, labelBoundary[0], labelBoundary[1], labelBoundary[2]) ||
                  isPointInTriangle({ x, y }, labelBoundary[2], labelBoundary[3], labelBoundary[0])) {
                  _drag.type = DragType.DimensionLabel;
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
              if (isPointInTriangle({ x, y }, axisBoundary[0], axisBoundary[1], axisBoundary[2]) ||
                  isPointInTriangle({ x, y }, axisBoundary[2], axisBoundary[3], axisBoundary[0])) {
                  _drag.type = DragType.DimensionFilterCreate;
                  _drs.index = i;
                  _drs.p0 = { x, y };
                  _drs.p1 = { x, y };
                  _drf.key = this.dimensions[i].key;
                  const p0 = _drs.p0[filterKey] - bound[filterKey] - axisStart[filterKey];
                  const value0 = getAxisPositionValue(p0, axisStop[filterKey] - axisStart[filterKey], this.dimensions[i].axis.scale);
                  _drf.active = { p0, p1: p0, value0, value1: value0 };
                  // Store active filter into filter list.
                  _filter[_drf.key] = _filter[_drf.key] || [];
                  _filter[_drf.key].push(_drf.active);
              }
          });
      }
      handleMouseMove(e) {
          if (!this._)
              return;
          const [x, y] = [e.clientX, e.clientY];
          const _drag = this.drag;
          const _drs = this.drag.shared;
          const _drd = this.drag.dimension;
          const _drf = this.drag.filters;
          const _dl = this._.dims.list;
          const isHorizontal = this.options.direction === Direction.Horizontal;
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
              if (_drag.type === DragType.DimensionLabel &&
                  _drs.index !== i && _drd.bound1 &&
                  percentRectIntersection(_drd.bound1, layout.bound) > 0.4) {
                  // Swap dragging dimension with the dimension it intersects with.
                  const tempDim = this.dimensions[_drs.index];
                  this.dimensions[_drs.index] = this.dimensions[i];
                  this.dimensions[i] = tempDim;
                  // Update the drag dimension shared..
                  _drs.index = i;
              }
          }
          // Update dimension filter creating dragging data.
          if (_drag.type === DragType.DimensionFilterCreate && _drf.key) {
              const bound = _dl[_drs.index].layout.bound;
              const axisStart = _dl[_drs.index].layout.axisStart;
              const axisStop = _dl[_drs.index].layout.axisStop;
              _drf.active.p1 = _drs.p1[filterKey] - bound[filterKey] - axisStart[filterKey];
              _drf.active.value1 = getAxisPositionValue(_drf.active.p1, axisStop[filterKey] - axisStart[filterKey], this.dimensions[_drs.index].axis.scale);
          }
          this.calculate();
      }
      handleMouseUp(e) {
          if (!this._ || this.drag.type === DragType.None)
              return;
          const [x, y] = [e.clientX, e.clientY];
          const _drag = this.drag;
          const _drs = this.drag.shared;
          const _drf = this.drag.filters;
          const _dl = this._.dims.list;
          const isHorizontal = this.options.direction === Direction.Horizontal;
          const filterKey = isHorizontal ? 'y' : 'x';
          _drs.p1 = { x, y };
          if (_drag.type === DragType.DimensionFilterCreate && _drf.key) {
              // Update filter data before removing reference.
              const bound = _dl[_drs.index].layout.bound;
              const axisStart = _dl[_drs.index].layout.axisStart;
              const axisStop = _dl[_drs.index].layout.axisStop;
              _drf.active.p1 = _drs.p1[filterKey] - bound[filterKey] - axisStart[filterKey];
              _drf.active.value1 = getAxisPositionValue(_drf.active.p1, axisStop[filterKey] - axisStart[filterKey], this.dimensions[_drs.index].axis.scale);
              // Swap p0 and p1 if p1 is less than p0.
              if (_drf.active.p1 < _drf.active.p0) {
                  const [tempP, tempValue] = [_drf.active.p1, _drf.active.value1];
                  [_drf.active.p1, _drf.active.value1] = [_drf.active.p0, _drf.active.value0];
                  [_drf.active.p0, _drf.active.value0] = [tempP, tempValue];
              }
              // Overwrite active filter to remove reference to filter in filters list.
              _drf.active = FILTER;
              _drf.key = undefined;
          }
          // Reset drag info.
          this.drag = clone(DRAG);
          this.mergeFilters();
          this.calculate();
      }
  }

  return Hermes;

})();
