const ActionType = {
    FilterCreate: 'filter-create',
    FilterMove: 'filter-move',
    FilterResizeAfter: 'filter-resize-after',
    FilterResizeBefore: 'filter-resize-before',
    LabelMove: 'label-move',
    None: 'none',
};
const DimensionLayout = {
    AxisEvenlySpaced: 'axis-evenly-spaced',
    Equidistant: 'equidistant',
};
const DimensionType = {
    Categorical: 'categorical',
    Linear: 'linear',
    Logarithmic: 'logarithmic',
};
const Direction = {
    Horizontal: 'horizontal',
    Vertical: 'vertical',
};
const FocusType = {
    DimensionAxis: 'dimension-axis',
    DimensionLabel: 'dimension-label',
    Filter: 'filter',
    FilterResize: 'filter-resize',
};
const LabelPlacement = {
    After: 'after',
    Before: 'before',
};
const PathType = {
    Bezier: 'bezier',
    Straight: 'straight',
};

/**
 * Invalid defaults.
 */
const INVALID_VALUE = Number.NaN;
const INVALID_POINT = { x: Number.NaN, y: Number.NaN };
const INVALID_RECT = { h: Number.NaN, w: Number.NaN, x: Number.NaN, y: Number.NaN };
const INVALID_ACTION = {
    dimIndex: -1,
    p0: INVALID_POINT,
    p1: INVALID_POINT,
    type: ActionType.None,
};
/**
 * Style defaults.
 */
const BEZIER_FACTOR = 0.3;
const DIRECTION = 'inherit';
const FONT = 'normal 12px san-serif';
const LINE_CAP = 'butt';
const LINE_DASH_OFFSET = 0.0;
const LINE_JOIN = 'round';
const LINE_WIDTH = 1.0;
const MITER_LIMIT = 10.0;
const STROKE_STYLE = 'black';
const TEXT_BASELINE = 'middle';
const TRUNCATE_SIZE = 24;
const TRUNCATE_SUFFIX = '...';
/**
 * Framework options defaults.
 */
const HERMES_CONFIG = {
    debug: false,
    direction: Direction.Horizontal,
    hooks: {},
    interactions: {
        throttleDelayMouseMove: 50,
        throttleDelayResize: 50,
    },
    style: {
        axes: {
            axis: {
                boundaryPadding: 15,
                lineWidth: 1,
                strokeStyle: 'rgba(147, 147, 147, 1.0)',
            },
            axisActve: {
                lineWidth: 3,
                strokeStyle: 'rgba(99, 200, 255, 1.0)',
            },
            axisHover: {
                lineWidth: 3,
                strokeStyle: 'rgba(79, 180, 246, 1.0)',
            },
            filter: {
                cornerRadius: 2,
                fillStyle: 'rgba(235, 100, 200, 1.0)',
                strokeStyle: 'rgba(255, 255, 255, 1.0)',
                width: 4,
            },
            filterActive: {
                cornerRadius: 3,
                fillStyle: 'rgba(255, 120, 220, 1.0)',
                width: 8,
            },
            filterAxisHover: {
                cornerRadius: 2,
                fillStyle: 'rgba(235, 100, 200, 1.0)',
                width: 6,
            },
            filterHover: {
                cornerRadius: 2,
                fillStyle: 'rgba(235, 100, 200, 1.0)',
                width: 8,
            },
            label: {
                fillStyle: 'rgba(0, 0, 0, 1.0)',
                font: 'normal 11px sans-serif',
                lineWidth: 3,
                offset: 4,
                placement: LabelPlacement.After,
                strokeStyle: 'rgba(255, 255, 255, 1.0)',
            },
            labelActive: { fillStyle: 'rgba(0, 0, 0, 1.0)' },
            labelHover: { fillStyle: 'rgba(0, 0, 0, 1.0)' },
            tick: {
                length: 4,
                lineWidth: 1,
                strokeStyle: 'rgba(147, 147, 147, 1.0)',
            },
            tickActive: { strokeStyle: 'rgba(99, 200, 255, 1.0)' },
            tickHover: { strokeStyle: 'rgba(79, 180, 246, 1.0)' },
        },
        data: {
            default: {
                lineWidth: 1,
                strokeStyle: 'rgba(82, 144, 244, 1.0)',
            },
            filtered: {
                lineWidth: 1,
                strokeStyle: 'rgba(0, 0, 0, 0.05)',
            },
            path: {
                options: {},
                type: PathType.Straight,
            },
        },
        dimension: {
            label: {
                angle: undefined,
                boundaryPadding: 5,
                fillStyle: 'rgba(0, 0, 0, 1.0)',
                font: 'normal 11px sans-serif',
                lineWidth: 3,
                offset: 16,
                placement: LabelPlacement.Before,
                strokeStyle: 'rgba(255, 255, 255, 1.0)',
            },
            labelActive: { fillStyle: 'rgba(99, 200, 255, 1.0)' },
            labelHover: { fillStyle: 'rgba(79, 180, 246, 1.0)' },
            layout: DimensionLayout.AxisEvenlySpaced,
        },
        padding: [32, 64],
    },
};
const FILTER = {
    p0: Number.NaN,
    p1: Number.NaN,
    value0: Number.NaN,
    value1: Number.NaN,
};
const IX = {
    dimension: {
        axis: 0,
        bound: undefined,
        boundOffset: undefined,
        offset: 0,
    },
    filters: {
        active: FILTER,
        key: undefined,
    },
    shared: {
        action: INVALID_ACTION,
        focus: undefined,
    },
};

const isError = (data) => data instanceof Error;
const isNumber = (data) => typeof data === 'number';
const isMap = (data) => data instanceof Map;
const isObject = (data) => {
    return typeof data === 'object' && data != null
        && Object.getPrototypeOf(data) === Object.prototype
        && !Array.isArray(data) && !isMap(data) && !isSet(data);
};
const isSet = (data) => data instanceof Set;
const isString = (data) => typeof data === 'string';
const clone = (data) => {
    return JSON.parse(JSON.stringify(data));
};
const capDataRange = (data, range) => {
    return Math.min(range[1], Math.max(range[0], data));
};
const comparePrimitive = (a, b) => {
    if (isString(a) && isString(b))
        return a.localeCompare(b);
    if (a === b)
        return 0;
    return a > b ? 1 : -1;
};
const deepMerge = (...objects) => {
    return objects.reduce((acc, object) => {
        Object.keys(object).forEach((key) => {
            if (isObject(acc[key]) && isObject(object[key])) {
                acc[key] = deepMerge(acc[key], object[key]);
            }
            else if (Array.isArray(acc[key]) && Array.isArray(object[key])) {
                acc[key] = object[key];
                /**
                 * If we wanted to merge the arrays as well, we can use the following line,
                 * maybe rewrite this function as a configurable function.
                 * acc[key] = Array.from(new Set((acc[key] as unknown[]).concat(acc[key])));
                 */
            }
            else {
                acc[key] = object[key];
            }
        });
        return acc;
    }, {});
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
const idempotentItem = (list, index) => {
    return list[index % list.length];
};
const idempotentLogNumber = (base, max, min, count, index) => {
    const log = base === 10 ? Math.log10 : base === 2 ? Math.log2 : Math.log;
    const denominator = log === Math.log ? Math.log(base) : 1;
    const maxExp = log(max) / denominator;
    const minExp = log(min) / denominator;
    return base ** idempotentNumber(maxExp, minExp, count, index);
};
const idempotentNumber = (max, min, count, index) => {
    const adjustedCount = count > 1 ? count - 1 : 1;
    const inc = (max - min) / adjustedCount;
    return (index % (adjustedCount + 1)) * inc + min;
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

const readableNumber = (num, precision = 6) => {
    let readable = num.toString();
    const absoluteNum = Math.abs(num);
    if (isNaN(num)) {
        readable = 'NaN';
    }
    else if (!Number.isFinite(num)) {
        readable = `${num < 0 ? '-' : ''}Infinity`;
    }
    else if (absoluteNum !== 0) {
        if (absoluteNum < 0.01 || absoluteNum > 999) {
            readable = num.toExponential(precision);
        }
        else if (!Number.isInteger(num)) {
            readable = num.toFixed(precision);
        }
    }
    return readable;
};
const readableTick = (num) => {
    let readable = readableNumber(num);
    readable = readable.replace(/(e)\+(\d+)/, '$1$2'); // e.g. 1.8e+5 => 1.8e5
    readable = readable.replace(/0+(e-?\d+)$/, '$1'); // e.g. 1.200000e-5 => 1.2e-5
    readable = readable.replace(/(\.[0-9]+?)0+$/, '$1'); // e.g. 0.750000 => 0.75
    readable = readable.replace(/\.(e)/, '$1'); // e.g. 2.e5 => 2e5
    return readable;
};
const truncate = (str, options = {}) => {
    var _a, _b;
    const size = (_a = options.size) !== null && _a !== void 0 ? _a : TRUNCATE_SIZE;
    const suffix = (_b = options.suffix) !== null && _b !== void 0 ? _b : TRUNCATE_SUFFIX;
    if (str.length <= size)
        return str;
    return `${str.substring(0, size)}${suffix}`;
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
const DEFAULT_DATA_ON_EDGE = true;
const DEFAULT_REVERSE = false;
const MIN_TICK_DISTANCE = 50;
class NiceScale {
    /**
     * Instantiates a new instance of the NiceScale class.
     *
     * @param minValue the minimum data point on the axis
     * @param maxValue the maximum data point on the axis
     * @param maxTicks the maximum number of tick marks for the axis
     */
    constructor(direction, minValue, maxValue, config = {}) {
        this.direction = direction;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.range = 0;
        this.reverse = DEFAULT_REVERSE;
        this.tickLabels = [];
        this.tickPos = [];
        this.ticks = [];
        this.tickPadding = 0;
        this.tickSpacing = 0;
        this.axisLength = 1;
        this.maxTicks = 1;
        this.dataOnEdge = DEFAULT_DATA_ON_EDGE;
        this.max = maxValue;
        this.min = minValue;
        if (config.dataOnEdge != null)
            this.dataOnEdge = config.dataOnEdge;
        if (direction === Direction.Horizontal) {
            this.reverse = config.reverse != null ? config.reverse : false;
        }
        else {
            this.reverse = config.reverse != null ? !config.reverse : true;
        }
        this.setMinMaxValues(minValue, maxValue, false);
    }
    setAxisLength(axisLength) {
        this.axisLength = axisLength;
        this.maxTicks = axisLength / MIN_TICK_DISTANCE;
        this.calculate();
    }
    setMinMaxValues(minValue, maxValue, calculate = true) {
        /*
         * Handle the 0 range scale by padding each end of the common min/max value,
         * based on the log base 2 of the min/max value.
         */
        if (minValue === maxValue) {
            const value = minValue;
            const exp = Math.log2(value);
            minValue = 2 ** (exp - 1);
            maxValue = value + (value - minValue);
        }
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.max = maxValue;
        this.min = minValue;
        if (calculate)
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
    constructor(direction, categories = [], config = {}) {
        super(direction, 0, 0, config);
        this.direction = direction;
        this.categories = categories;
        if (this.reverse)
            this.categories.reverse();
        this.tickLabels = this.categories.map(category => value2str(category));
    }
    percentToValue(percent) {
        return this.posToValue(percent * this.axisLength);
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
    valueToPercent(value) {
        const stringValue = value2str(value);
        const index = this.tickLabels.findIndex(label => label === stringValue);
        if (index !== -1)
            return this.tickPos[index] / this.axisLength;
        return 0;
    }
    valueToPos(value) {
        return this.valueToPercent(value) * this.axisLength;
    }
    calculate() {
        // Calculate tick positions based on axis length and ticks.
        const count = this.tickLabels.length;
        let traversed = 0;
        this.tickSpacing = this.axisLength / (this.dataOnEdge ? count - 1 : count);
        this.tickPos = [];
        for (let i = 0; i < count; i++) {
            if ([0, count].includes(i)) {
                traversed += this.dataOnEdge ? 0 : this.tickSpacing / 2;
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
    percentToValue(percent) {
        const min = this.dataOnEdge ? this.minValue : this.min;
        const max = this.dataOnEdge ? this.maxValue : this.max;
        return (this.reverse ? 1 - percent : percent) * (max - min) + min;
    }
    posToValue(pos) {
        return this.percentToValue(pos / this.axisLength);
    }
    valueToPercent(value) {
        if (!isNumber(value))
            return 0;
        const min = this.dataOnEdge ? this.minValue : this.min;
        const max = this.dataOnEdge ? this.maxValue : this.max;
        const percent = (value - min) / (max - min);
        return this.reverse ? 1 - percent : percent;
    }
    valueToPos(value) {
        return this.valueToPercent(value) * this.axisLength;
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
            let tick = i * this.tickSpacing + this.min;
            if (this.dataOnEdge && i === 0)
                tick = this.minValue;
            if (this.dataOnEdge && i === count)
                tick = this.maxValue;
            this.ticks.push(tick);
            let tickLabel = readableTick(tick);
            if (this.dataOnEdge && [0, count].includes(i))
                tickLabel = `*${tickLabel}`;
            this.tickLabels.push(tickLabel);
        }
        // Calculate tick positions based on axis length and ticks.
        this.tickPos = this.ticks.map(tick => this.valueToPos(tick));
    }
}

const DEFAULT_LOG_BASE = 10;
class LogScale extends NiceScale {
    constructor(direction, minValue, maxValue, logBase = DEFAULT_LOG_BASE, config = {}) {
        super(direction, minValue, maxValue, config);
        this.direction = direction;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.logBase = logBase;
        this.maxExp = Number.NaN;
        this.maxExpExact = Number.NaN;
        this.minExp = Number.NaN;
        this.minExpExact = Number.NaN;
        this.denominator = 1;
        this.log = Math.log;
        this.logBase = logBase;
    }
    setLogBase(logBase = DEFAULT_LOG_BASE) {
        this.logBase = logBase;
        this.calculate();
    }
    percentToValue(percent) {
        const minExp = this.dataOnEdge ? this.minExpExact : this.minExp;
        const exp = (this.reverse ? 1 - percent : percent) * this.rangeExp() + minExp;
        return this.logBase ** exp;
    }
    posToValue(pos) {
        return this.percentToValue(pos / this.axisLength);
    }
    valueToPercent(value) {
        if (!isNumber(value))
            return 0;
        const exp = this.log(value) / this.denominator;
        const minExp = this.dataOnEdge ? this.minExpExact : this.minExp;
        const maxExp = this.dataOnEdge ? this.maxExpExact : this.maxExp;
        const percent = (exp - minExp) / (maxExp - minExp);
        return this.reverse ? 1 - percent : percent;
    }
    valueToPos(value) {
        return this.valueToPercent(value) * this.axisLength;
    }
    rangeExp() {
        return this.dataOnEdge ? this.maxExpExact - this.minExpExact : this.maxExp - this.minExp;
    }
    calculate() {
        this.log =
            this.logBase === 10
                ? Math.log10
                : this.logBase === 2
                    ? Math.log2
                    : (x) => Math.log(x) / Math.log(this.logBase);
        this.denominator = this.log === Math.log ? Math.log(this.logBase) : 1;
        this.minExpExact = this.log(this.minValue) / this.denominator;
        this.maxExpExact = this.log(this.maxValue) / this.denominator;
        this.minExp = Math.floor(this.minExpExact);
        this.maxExp = Math.ceil(this.maxExpExact);
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
            let tickValue = this.logBase ** tickExp;
            if (this.dataOnEdge && i === 0)
                tickValue = this.logBase ** this.minExpExact;
            if (this.dataOnEdge && i === count)
                tickValue = this.logBase ** this.maxExpExact;
            this.ticks.push(tickValue);
            let tickLabel = readableTick(tickValue);
            if (this.dataOnEdge && [0, count].includes(i))
                tickLabel = `*${tickLabel}`;
            this.tickLabels.push(tickLabel);
        }
        // Calculate tick positions based on axis length and ticks.
        this.tickPos = this.ticks.map(tick => this.valueToPos(tick));
    }
}

const distance = (pointA, pointB) => {
    return Math.sqrt((pointB.x - pointA.x) ** 2 + (pointB.y - pointA.y) ** 2);
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
const shiftRect = (rect, shift) => {
    return { h: rect.h, w: rect.w, x: rect.x + shift.x, y: rect.y + shift.y };
};

const drawBoundary = (ctx, boundary, style = {}) => {
    ctx.save();
    if (style.fillStyle) {
        ctx.fillStyle = style.fillStyle;
        ctx.beginPath();
        ctx.moveTo(boundary[0].x, boundary[0].y);
        for (let i = 1; i < boundary.length; i++) {
            ctx.lineTo(boundary[i].x, boundary[i].y);
        }
        ctx.closePath();
        ctx.fill();
    }
    if (style.strokeStyle) {
        ctx.lineCap = style.lineCap || LINE_CAP;
        ctx.lineDashOffset = style.lineDashOffset || LINE_DASH_OFFSET;
        ctx.lineJoin = style.lineJoin || LINE_JOIN;
        ctx.lineWidth = style.lineWidth || LINE_WIDTH;
        ctx.miterLimit = style.miterLimit || MITER_LIMIT;
        ctx.strokeStyle = style.strokeStyle;
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
    if (style.fillStyle) {
        ctx.fillStyle = style === null || style === void 0 ? void 0 : style.fillStyle;
        ctx.moveTo(x + radius, y);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
    }
    if (style.strokeStyle) {
        ctx.lineCap = style.lineCap || LINE_CAP;
        ctx.lineDashOffset = style.lineDashOffset || LINE_DASH_OFFSET;
        ctx.lineJoin = style.lineJoin || LINE_JOIN;
        ctx.lineWidth = style.lineWidth || LINE_WIDTH;
        ctx.miterLimit = style.miterLimit || MITER_LIMIT;
        ctx.strokeStyle = style.strokeStyle;
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
    ctx.moveTo(roundPixel(x0), roundPixel(y0));
    ctx.lineTo(roundPixel(x1), roundPixel(y1));
    ctx.stroke();
    ctx.restore();
};
const drawRect = (ctx, x, y, w, h, style = {}) => {
    ctx.save();
    const rx = roundPixel(x);
    const ry = roundPixel(y);
    const radius = style.cornerRadius || 0;
    if (style.fillStyle) {
        ctx.fillStyle = style.fillStyle;
        if (radius === 0) {
            ctx.fillRect(rx, ry, w, h);
        }
        else {
            drawRoundedRect(ctx, rx, ry, w, h, radius);
            ctx.fill();
        }
    }
    if (style.strokeStyle) {
        ctx.lineCap = style.lineCap || LINE_CAP;
        ctx.lineDashOffset = style.lineDashOffset || LINE_DASH_OFFSET;
        ctx.lineJoin = style.lineJoin || LINE_JOIN;
        ctx.lineWidth = style.lineWidth || LINE_WIDTH;
        ctx.miterLimit = style.miterLimit || MITER_LIMIT;
        ctx.strokeStyle = style.strokeStyle;
        if (radius === 0) {
            ctx.strokeRect(rx, ry, w, h);
        }
        else {
            drawRoundedRect(ctx, rx, ry, w, h, radius);
            ctx.stroke();
        }
    }
    ctx.restore();
};
const drawRoundedRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
};
const drawText = (ctx, text, x, y, rad, style = {}) => {
    const normalizedRad = normalizeRad(rad);
    const inwards = normalizedRad > Math.PI / 2 && normalizedRad <= 3 * Math.PI / 2;
    const rotate = -rad - (inwards ? Math.PI : 0);
    ctx.save();
    setFont(ctx, style.font);
    ctx.direction = style.direction || DIRECTION;
    ctx.textAlign = style.textAlign || (inwards ? 'right' : 'left');
    ctx.textBaseline = style.textBaseline || TEXT_BASELINE;
    if (rotate % 2 * Math.PI !== 0) {
        ctx.translate(x, y);
        ctx.rotate(rotate);
        ctx.translate(-x, -y);
    }
    if (style.strokeStyle) {
        ctx.lineCap = style.lineCap || LINE_CAP;
        ctx.lineDashOffset = style.lineDashOffset || LINE_DASH_OFFSET;
        ctx.lineJoin = style.lineJoin || LINE_JOIN;
        ctx.lineWidth = style.lineWidth || LINE_WIDTH;
        ctx.miterLimit = style.miterLimit || MITER_LIMIT;
        ctx.strokeStyle = style.strokeStyle;
        ctx.strokeText(text, x, y);
    }
    if (style.fillStyle) {
        ctx.fillStyle = style.fillStyle;
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
    setFont(ctx, font);
    const metrics = ctx.measureText(text);
    const w = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
    const h = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    return { h, w };
};
/**
 * Takes in a single number (padding on all sided), an array of two [ top/bottom, left/right ],
 * or full padding array [ top, right, buttom, left ].
 * A `factor` is applied, that is calculated based on `devicePixelRatio` to help ensure the
 * padding scales at a friendlier proportion relative to font size changes.
 */
const normalizePadding = (padding) => {
    const factor = devicePixelRatio <= 1 ? 1 : 2 - 0.5 ** (devicePixelRatio - 1);
    if (!Array.isArray(padding))
        return new Array(4).fill(padding * factor);
    if (padding.length === 2)
        return [
            padding[0] * factor,
            padding[1] * factor,
            padding[0] * factor,
            padding[1] * factor,
        ];
    return padding.map(p => p * factor);
};
const normalizeRad = (rad) => {
    return (rad + 2 * Math.PI) % (2 * Math.PI);
};
/**
 * To produce crisp lines on canvas, the line coordinates need to sit on the half pixel.
 * https://stackoverflow.com/a/13879402/5402432
 */
const roundPixel = (x) => {
    return Math.round(x - 0.5) + 0.5;
};
const setFont = (ctx, font = FONT) => {
    const regexSize = new RegExp(/(-?\d*\.?\d+)px/);
    const matches = font.match(regexSize);
    if ((matches === null || matches === void 0 ? void 0 : matches.length) === 2) {
        const size = Math.round(parseFloat(matches[1]) * devicePixelRatio);
        ctx.font = font.replace(regexSize, `${size}px`);
    }
    else {
        ctx.font = font;
    }
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
        if (result.length > 5 && result[5] !== undefined)
            rgba.a = parseFloat(result[5]);
        return rgba;
    }
    return { a: 1.0, b: 0, g: 0, r: 0 };
};

const getElement = (target) => {
    if (!isString(target))
        return target;
    return document.querySelector(target);
};
/*
 * Get mouse position relative to an element position.
 */
const getMousePoint = (e, element) => {
    const rect = element.getBoundingClientRect();
    const x = (e.clientX - rect.x) * devicePixelRatio;
    const y = (e.clientY - rect.y) * devicePixelRatio;
    return { x, y };
};

const throttle = (fn, delay) => {
    let timer;
    return (...args) => {
        if (timer == null) {
            timer = setTimeout(() => {
                fn(...args);
                timer = undefined;
            }, delay);
        }
    };
};

const DIMENSION_SWAP_THRESHOLD = 30;
const FILTER_REMOVE_THRESHOLD = 1;
const FILTER_RESIZE_THRESHOLD = 3;
const getDragBound = (index, ix, bound) => {
    const action = ix.shared.action;
    const isLabelDrag = action.type === ActionType.LabelMove && action.dimIndex === index;
    const dragBound = ix.dimension.bound || INVALID_RECT;
    const offset = ix.dimension.boundOffset || { x: 0, y: 0 };
    return isLabelDrag ? shiftRect(dragBound, offset) : bound;
};
const internalToFilter = (filter) => {
    return comparePrimitive(filter.value0, filter.value1) === 1
        ? [filter.value1, filter.value0]
        : [filter.value0, filter.value1];
};
const internalToFilters = (filters) => {
    return Object.keys(filters).reduce((acc, key) => {
        acc[key] = filters[key]
            .map(filter => internalToFilter(filter))
            .sort((a, b) => comparePrimitive(a[0], b[0]));
        return acc;
    }, {});
};
const isFilterEmpty = (filter) => {
    return isNaN(filter.p0) && isNaN(filter.p1);
};
// TODO: possibly invalid logic
const isFilterInvalid = (filter) => {
    return filter.p0 >= filter.p1;
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

const DEFAULT_DIMENSION_COUNT = 10;
const dimensionRanges = {
    'accuracy': [0.55, 0.99],
    'dropout': [0.2, 0.8],
    'global-batch-size': [5, 30],
    'layer-free-decay': [0.001, 0.1],
    'layer-split-factor': [1, 16],
    'learning-rate': [0.0001, 0.1],
    'learning-rate-decay': [0.000001, 0.001],
    'loss': [1.7, 2.4],
    'metrics-base': [0.5, 0.9],
    'n-filters': [8, 64],
};
const dimensionSamples = [
    {
        dataOnEdge: false,
        key: 'dropout',
        label: 'Dropout',
        type: DimensionType.Linear,
    },
    {
        dataOnEdge: false,
        key: 'global-batch-size',
        label: 'Global Batch Size',
        type: DimensionType.Linear,
    },
    {
        categories: [4, 8, 16, 32, 64],
        dataOnEdge: false,
        key: 'layer-dense-size',
        label: 'Layer Dense Size',
        type: DimensionType.Categorical,
    },
    {
        dataOnEdge: false,
        key: 'layer-free-decay',
        label: 'Layer Free Decay',
        logBase: 10,
        type: DimensionType.Logarithmic,
    },
    {
        categories: [true, false],
        dataOnEdge: false,
        key: 'layer-inverse',
        label: 'Layer Inverse',
        type: DimensionType.Categorical,
    },
    {
        dataOnEdge: false,
        key: 'learning-rate',
        label: 'Learning Rate',
        logBase: 10,
        type: DimensionType.Logarithmic,
    },
    {
        dataOnEdge: false,
        key: 'learning-rate-decay',
        label: 'Learning Rate Decay',
        logBase: 10,
        type: DimensionType.Logarithmic,
    },
    {
        dataOnEdge: false,
        key: 'layer-split-factor',
        label: 'Layer Split Factor',
        logBase: 2,
        type: DimensionType.Logarithmic,
    },
    {
        dataOnEdge: false,
        key: 'metrics-base',
        label: 'Metrics Base',
        type: DimensionType.Linear,
    },
    {
        dataOnEdge: false,
        key: 'n-filters',
        label: 'N Filters',
        type: DimensionType.Linear,
    },
];
const metricDimensionSamples = [
    {
        dataOnEdge: false,
        disableDrag: true,
        key: 'accuracy',
        label: 'Accuracy',
        type: DimensionType.Linear,
    },
    {
        dataOnEdge: false,
        disableDrag: true,
        key: 'loss',
        label: 'Loss',
        type: DimensionType.Linear,
    },
];
const generateData = (dimensions, count, random = true) => {
    return dimensions.reduce((acc, dimension) => {
        acc[dimension.key] = new Array(count).fill(null).map((_, index) => {
            if (dimension.type === DimensionType.Categorical) {
                if (dimension.categories) {
                    return random
                        ? randomItem(dimension.categories)
                        : idempotentItem(dimension.categories, index);
                }
            }
            else if (dimension.type === DimensionType.Linear) {
                const range = dimensionRanges[dimension.key];
                if (range) {
                    return random
                        ? randomNumber(range[1], range[0])
                        : idempotentNumber(range[1], range[0], count, index);
                }
            }
            else if (dimension.type === DimensionType.Logarithmic) {
                const range = dimensionRanges[dimension.key];
                if (range && dimension.logBase) {
                    return random
                        ? randomLogNumber(dimension.logBase, range[1], range[0])
                        : idempotentLogNumber(dimension.logBase, range[1], range[0], count, index);
                }
            }
            return INVALID_VALUE;
        });
        return acc;
    }, {});
};
const generateDimensions = (dimCount = DEFAULT_DIMENSION_COUNT, random = true) => {
    // Generate the dimensions based on config.
    const dims = new Array(dimCount - 1).fill(null).map((_, index) => {
        return random
            ? randomItem(dimensionSamples)
            : idempotentItem(dimensionSamples, index);
    });
    // Add a metric dimension to the end.
    const metricDimension = random
        ? randomItem(metricDimensionSamples)
        : idempotentItem(metricDimensionSamples, 0);
    dims.push(metricDimension);
    return dims;
};

var tester = /*#__PURE__*/Object.freeze({
    __proto__: null,
    DEFAULT_DIMENSION_COUNT: DEFAULT_DIMENSION_COUNT,
    dimensionRanges: dimensionRanges,
    dimensionSamples: dimensionSamples,
    metricDimensionSamples: metricDimensionSamples,
    generateData: generateData,
    generateDimensions: generateDimensions
});

class Hermes {
    constructor(target, dimensions, config, data) {
        this.config = HERMES_CONFIG;
        this.data = {};
        this.dataCount = 0;
        this.dimensions = [];
        this.dimensionsOriginal = [];
        this.filters = {};
        this.size = { h: 0, w: 0 };
        this.ix = clone(IX);
        this._ = undefined;
        const element = getElement(target);
        if (!element)
            throw new HermesError('Target element selector did not match anything.');
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
        }
        else {
            this.canvas = canvases[0];
        }
        // Get canvas context.
        const ctx = this.canvas.getContext('2d');
        if (!ctx)
            throw new HermesError('Unable to get context from target element.');
        this.ctx = ctx;
        if (dimensions)
            this.setDimensions(dimensions, false);
        if (config)
            this.setConfig(config, false);
        if (data)
            this.setData(data, false);
        if (dimensions || config || data)
            this.redraw();
        // Define listeners up front, but don't start listening yet.
        this.listeners = {
            dblclick: this.handleDoubleClick.bind(this),
            mousedown: this.handleMouseDown.bind(this),
            mousemove: this.config.interactions.throttleDelayMouseMove === 0
                ? this.handleMouseMove.bind(this)
                : throttle((e) => this.handleMouseMove.bind(this)(e), this.config.interactions.throttleDelayMouseMove),
            mouseup: this.handleMouseUp.bind(this),
        };
        // Enable chart
        this.enable();
    }
    static deepMerge(...objects) {
        return deepMerge(...objects);
    }
    static getTester() {
        return tester;
    }
    static validateData(data, dimensions) {
        const validation = { count: 0, message: '', valid: true };
        const values = Object.values(data);
        // All the dimension data should be equal in size.
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            if (i === 0) {
                validation.count = value.length;
            }
            else if (value.length !== validation.count) {
                validation.message = 'The dimension data are not uniform in size.';
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
    static validateDimension(dimension) {
        if (dimension.type === DimensionType.Categorical) {
            if (!dimension.categories || dimension.categories.length === 0)
                return {
                    message: `Categorical dimension "${dimension.key}" is missing "categories".`,
                    valid: false,
                };
        }
        else if (dimension.type === DimensionType.Logarithmic) {
            if (dimension.logBase == null || dimension.logBase === 0)
                return {
                    message: `Logarithmic dimension "${dimension.key}" is missing "logBase".`,
                    valid: false,
                };
        }
        return { message: '', valid: true };
    }
    static validateDimensions(dimensions) {
        if (dimensions.length === 0) {
            return { message: 'Need at least one dimension defined.', valid: false };
        }
        for (let i = 0; i < dimensions.length; i++) {
            const { message, valid } = Hermes.validateDimension(dimensions[i]);
            if (!valid)
                return { message, valid };
        }
        return { message: '', valid: true };
    }
    setConfig(config = {}, redraw = true) {
        // Set config early as setSize references it early.
        this.config = deepMerge(HERMES_CONFIG, config);
        // Re-add observers as config impacts the throttling of the observer handlers.
        this.addObservers();
        if (redraw)
            this.redraw();
    }
    setData(data, redraw = true) {
        const dataValidation = Hermes.validateData(data, this.dimensionsOriginal);
        if (!dataValidation.valid)
            throw new HermesError(dataValidation.message);
        this.data = data;
        this.dataCount = dataValidation.count;
        this.setDimensions(this.dimensionsOriginal, false);
        if (redraw)
            this.redraw();
    }
    setDimensions(dimensions, redraw = true) {
        // Validate that the dimensions are set properly.
        const dimValidation = Hermes.validateDimensions(dimensions);
        if (!dimValidation.valid)
            throw new HermesError(dimValidation.message);
        const direction = this.config.direction === Direction.Horizontal
            ? Direction.Vertical
            : Direction.Horizontal;
        this.dimensionsOriginal = dimensions;
        this.dimensions = clone(dimensions).map(dimension => {
            const key = dimension.key;
            const data = this.data[key] || [];
            const internal = {
                ...dimension,
                labelTruncated: truncate(dimension.label, { size: this.config.style.dimension.label.truncate }),
                range: undefined,
                scale: new LinearScale(direction, 0, 100),
            };
            if (dimension.type === DimensionType.Linear ||
                dimension.type === DimensionType.Logarithmic) {
                internal.range = getDataRange(data);
                if (dimension.type === DimensionType.Linear) {
                    internal.scale = new LinearScale(direction, internal.range[0], internal.range[1], dimension);
                }
                else if (dimension.type === DimensionType.Logarithmic) {
                    internal.scale = new LogScale(direction, internal.range[0], internal.range[1], dimension.logBase, dimension);
                }
            }
            else if (dimension.type === DimensionType.Categorical) {
                internal.scale = new CategoricalScale(direction, dimension.categories, dimension);
            }
            return internal;
        });
        if (redraw)
            this.redraw();
    }
    setSize(w, h, redraw = true) {
        var _a, _b;
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
        (_b = (_a = this.config.hooks).onResize) === null || _b === void 0 ? void 0 : _b.call(_a, this.size, oldSize);
        if (redraw)
            this.redraw();
    }
    disable() {
        this.removeListeners();
        this.removeObservers();
        // Clear out any intermediate focus or interactive states.
        this.ix = clone(IX);
        this.updateCursor();
        this.redraw();
    }
    enable() {
        this.addListeners();
        this.addObservers();
    }
    redraw() {
        if (this.size.w === 0 && this.size.h === 0)
            return;
        this.calculate();
        this.clear();
        if (this.config.debug)
            this.drawDebugOutline();
        this.draw();
    }
    destroy() {
        this.removeListeners();
        this.removeObservers();
        if (this.canvas && this.element.contains(this.canvas)) {
            this.element.removeChild(this.canvas);
        }
    }
    addListeners() {
        this.element.addEventListener('dblclick', this.listeners.dblclick);
        this.element.addEventListener('mousedown', this.listeners.mousedown);
        window.addEventListener('mousemove', this.listeners.mousemove);
        window.addEventListener('mouseup', this.listeners.mouseup);
    }
    addObservers() {
        // Clear out previously setup resize observer.
        if (this.resizeObserver) {
            this.resizeObserver.unobserve(this.element);
            this.resizeObserver = undefined;
        }
        // Define and add resize observer.
        this.resizeObserver = new ResizeObserver(this.config.interactions.throttleDelayResize === 0
            ? this.handleResize.bind(this)
            : throttle(entries => this.handleResize.bind(this)(entries), this.config.interactions.throttleDelayResize));
        this.resizeObserver.observe(this.element);
    }
    removeListeners() {
        this.element.removeEventListener('dblclick', this.listeners.dblclick);
        this.element.removeEventListener('mousedown', this.listeners.mousedown);
        window.removeEventListener('mousemove', this.listeners.mousemove);
        window.removeEventListener('mouseup', this.listeners.mouseup);
    }
    removeObservers() {
        var _a;
        (_a = this.resizeObserver) === null || _a === void 0 ? void 0 : _a.unobserve(this.element);
        this.resizeObserver = undefined;
    }
    calculate() {
        this.calculateLayout();
        this.calculateStyles();
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
                padding: normalizePadding(this.config.style.padding),
            },
        };
        const { h, w } = this.size;
        const _l = _.layout;
        const _dsa = _.dims.shared.axes;
        const _dsl = _.dims.shared.label;
        const _dsly = _.dims.shared.layout;
        const dimCount = this.dimensions.length;
        const isHorizontal = this.config.direction === Direction.Horizontal;
        const dimLabelStyle = this.config.style.dimension.label;
        const dimLabelBoundaryPadding = this.config.style.dimension.label.boundaryPadding;
        const dimLayout = this.config.style.dimension.layout;
        const axesLabelStyle = this.config.style.axes.label;
        const axisBoundaryPadding = this.config.style.axes.axis.boundaryPadding;
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
            const textSize = getTextSize(this.ctx, dimension.labelTruncated, dimLabelStyle.font);
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
        _dsa.length = _dsa.stop - _dsa.start;
        _dsa.labelFactor = isAxesBefore ? -1 : 1;
        _dsly.totalBoundSpace = 0;
        this.dimensions.forEach((dimension, i) => {
            const _dlia = _.dims.list[i].axes;
            const _dlil = _.dims.list[i].label;
            const _dlily = _.dims.list[i].layout;
            const scale = dimension.scale;
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
                    const size = getTextSize(this.ctx, tickLabel, axesLabelStyle.font);
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
            }
            else {
                _dlily.spaceBefore = (isHorizontal ? _dlil.lengthCos : _dlil.lengthSin) / 2;
                _dlily.spaceAfter = (isHorizontal ? _dlil.lengthCos : _dlil.lengthSin) / 2;
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
            const totalGapWidth = _l.drawRect.w - _dsly.totalBoundSpace;
            _dsly.gap = dimCount > 1 ? Math.max(totalGapWidth, 0) / (dimCount - 1) : 0;
            _dsly.offset = _l.padding[3];
            _dsly.space = dimCount > 1 ? _l.drawRect.w / (dimCount - 1) : 0;
        }
        else {
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
                if (dimLayout === DimensionLayout.AxisEvenlySpaced) {
                    _dlily.bound.x = traversed - _dlily.spaceBefore;
                    traversed += _dsly.space;
                }
                else if (dimLayout === DimensionLayout.Equidistant) {
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
                    _dlily.bound.y = traversed - _dlily.spaceBefore;
                    traversed += _dsly.space;
                }
                else if (dimLayout === DimensionLayout.Equidistant) {
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
    calculateStyles() {
        if (!this._)
            return;
        this._.styles = this._.styles || [];
        const _os = this.config.style;
        const _osa = _os.axes;
        const _osd = _os.dimension;
        const _dl = this._.dims.list;
        const _s = this._.styles;
        const _ixsa = this.ix.shared.action;
        const _ixsf = this.ix.shared.focus;
        const isActive = _ixsa.type !== ActionType.None;
        for (let i = 0; i < _dl.length; i++) {
            const key = this.dimensions[i].key;
            const filters = this.filters[key] || [];
            const isDimActive = _ixsa.type === ActionType.LabelMove && _ixsa.dimIndex === i;
            const isDimFocused = (_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.type) === FocusType.DimensionLabel && (_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.dimIndex) === i;
            const isAxisActive = (_ixsa.type === ActionType.FilterCreate ||
                _ixsa.type === ActionType.FilterMove ||
                _ixsa.type === ActionType.FilterResizeAfter ||
                _ixsa.type === ActionType.FilterResizeBefore) && _ixsa.dimIndex === i;
            const isAxisFocused = ((_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.type) === FocusType.DimensionAxis ||
                (_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.type) === FocusType.Filter ||
                (_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.type) === FocusType.FilterResize) && (_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.dimIndex) === i;
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
                const isFilterFocused = (((_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.type) === FocusType.Filter || (_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.type) === FocusType.FilterResize) &&
                    (_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.dimIndex) === i &&
                    (_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.filterIndex) === j);
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
    getFocusByPoint(point) {
        if (!this._)
            return;
        const _dsa = this._.dims.shared.axes;
        const isHorizontal = this.config.direction === Direction.Horizontal;
        const vKey = isHorizontal ? 'y' : 'x';
        const axisLength = this._.dims.shared.axes.length;
        for (let i = 0; i < this._.dims.list.length; i++) {
            const key = this.dimensions[i].key;
            const layout = this._.dims.list[i].layout;
            // Check to see if a dimension label was targeted and that it is draggable.
            const labelBoundary = layout.labelBoundary;
            if ((isPointInTriangle(point, labelBoundary[0], labelBoundary[1], labelBoundary[2]) ||
                isPointInTriangle(point, labelBoundary[2], labelBoundary[3], labelBoundary[0])) && !this.dimensions[i].disableDrag) {
                return { dimIndex: i, type: FocusType.DimensionLabel };
            }
            // Check to see if a dimension axis was targeted.
            const axisBoundary = layout.axisBoundary;
            if (isPointInTriangle(point, axisBoundary[0], axisBoundary[1], axisBoundary[2]) ||
                isPointInTriangle(point, axisBoundary[2], axisBoundary[3], axisBoundary[0])) {
                const filters = this.filters[key] || [];
                const axisOffset = layout.bound[vKey] + layout.axisStart[vKey];
                const p = (point[vKey] - axisOffset) / axisLength;
                const filterIndex = filters.findIndex(filter => p >= filter.p0 && p <= filter.p1);
                let type = FocusType.DimensionAxis;
                if (filterIndex !== -1) {
                    const threshold = FILTER_RESIZE_THRESHOLD / _dsa.length;
                    const filter = filters[filterIndex];
                    const isResize = p <= filter.p0 + threshold || p >= filter.p1 - threshold;
                    type = isResize ? FocusType.FilterResize : FocusType.Filter;
                }
                return { dimIndex: i, filterIndex, type };
            }
        }
    }
    updateActiveLabel() {
        var _a, _b;
        if (!this._ || this.ix.shared.action.type !== ActionType.LabelMove)
            return;
        const _dl = this._.dims.list;
        const _ix = this.ix;
        const _ixd = _ix.dimension;
        const _ixsa = _ix.shared.action;
        const isHorizontal = this.config.direction === Direction.Horizontal;
        const hKey = isHorizontal ? 'x' : 'y';
        _ixd.boundOffset = {
            x: isHorizontal ? _ixsa.p1.x - _ixsa.p0.x : 0,
            y: isHorizontal ? 0 : _ixsa.p1.y - _ixsa.p0.y,
        };
        let newIndex = -1;
        const dragPosition = _ixd.axis + _ixd.boundOffset[hKey];
        for (let i = 0; i < _dl.length; i++) {
            if (_ixsa.dimIndex === i || this.dimensions[i].disableDrag)
                continue;
            const layout = _dl[i].layout;
            const axisPosition = layout.bound[hKey] + layout.axisStart[hKey];
            const axisDistance = Math.abs(dragPosition - axisPosition);
            const isNearAxis = axisDistance < DIMENSION_SWAP_THRESHOLD;
            // Drag dimension came before the i-th dimension before drag started.
            if (_ixsa.dimIndex < i) {
                if (dragPosition < axisPosition && !isNearAxis)
                    break;
                else
                    newIndex = i;
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
            if (dragDimension.length === 0)
                return;
            // Insert the extracted drag dimension into the dimensions list.
            this.dimensions.splice(newIndex, 0, dragDimension[0]);
            // Update the drag dimension's index
            _ixsa.dimIndex = newIndex;
            // Make hook callback.
            (_b = (_a = this.config.hooks).onDimensionMove) === null || _b === void 0 ? void 0 : _b.call(_a, dragDimension[0], newIndex, oldIndex);
        }
    }
    setActiveFilter(key, pos, value) {
        if (!this._)
            return;
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
            if (pos >= _ixf.active.p0 &&
                pos <= _ixf.active.p0 + (FILTER_RESIZE_THRESHOLD / _dsa.length)) {
                _ixsa.type = ActionType.FilterResizeBefore;
            }
            else if (pos >= _ixf.active.p1 - (FILTER_RESIZE_THRESHOLD / _dsa.length) &&
                pos <= _ixf.active.p1) {
                _ixsa.type = ActionType.FilterResizeAfter;
            }
            else {
                _ixsa.type = ActionType.FilterMove;
            }
        }
        else {
            _ixsa.type = ActionType.FilterCreate;
            _ixf.active = { p0: pos, p1: pos, value0: value, value1: value };
            // Store active filter into filter list.
            _filters[key] = _filters[key] || [];
            _filters[key].push(_ixf.active);
            _ixsa.filterIndex = _filters[key].length - 1;
        }
    }
    updateActiveFilter(e) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _m, _o;
        if (!this._)
            return;
        const _dl = this._.dims.list;
        const _dsa = this._.dims.shared.axes;
        const _ix = this.ix;
        const _ixf = _ix.filters;
        const _ixs = _ix.shared;
        const _ixsa = _ixs.action;
        const _filters = this.filters;
        const index = _ixsa.dimIndex;
        const isHorizontal = this.config.direction === Direction.Horizontal;
        const filterKey = isHorizontal ? 'y' : 'x';
        const isFilterAction = (_ixsa.type === ActionType.FilterCreate ||
            _ixsa.type === ActionType.FilterMove ||
            _ixsa.type === ActionType.FilterResizeAfter ||
            _ixsa.type === ActionType.FilterResizeBefore);
        if (!isFilterAction || !_ixf.key)
            return;
        const bound = _dl[_ixsa.dimIndex].layout.bound;
        const axisStart = _dl[_ixsa.dimIndex].layout.axisStart[filterKey];
        /**
         * If the active filter previously exists, we want to drag it,
         * otherwise we want to change the size of the new one based on event position.
         */
        if (_ixsa.type === ActionType.FilterMove) {
            const startP0 = (_a = _ixf.active.startP0) !== null && _a !== void 0 ? _a : 0;
            const startP1 = (_b = _ixf.active.startP1) !== null && _b !== void 0 ? _b : 0;
            const startLength = startP1 - startP0;
            const shift = (_ixsa.p1[filterKey] - _ixsa.p0[filterKey]) / _dsa.length;
            _ixf.active.p0 = startP0 + shift;
            _ixf.active.p1 = startP1 + shift;
            // Cap the drag to the axis edges.
            if (_ixf.active.p0 < 0.0) {
                _ixf.active.p0 = 0;
                _ixf.active.p1 = startLength;
            }
            else if (_ixf.active.p1 > 1.0) {
                _ixf.active.p0 = 1.0 - startLength;
                _ixf.active.p1 = 1.0;
            }
            _ixf.active.value0 = this.dimensions[index].scale.percentToValue(_ixf.active.p0);
            _ixf.active.value1 = this.dimensions[index].scale.percentToValue(_ixf.active.p1);
        }
        else if (_ixsa.type === ActionType.FilterResizeBefore) {
            _ixf.active.p0 = (_ixsa.p1[filterKey] - bound[filterKey] - axisStart) / _dsa.length;
            _ixf.active.p0 = capDataRange(_ixf.active.p0, [0.0, 1.0]);
            _ixf.active.value0 = this.dimensions[index].scale.percentToValue(_ixf.active.p0);
        }
        else {
            _ixf.active.p1 = (_ixsa.p1[filterKey] - bound[filterKey] - axisStart) / _dsa.length;
            _ixf.active.p1 = capDataRange(_ixf.active.p1, [0.0, 1.0]);
            _ixf.active.value1 = this.dimensions[index].scale.percentToValue(_ixf.active.p1);
        }
        // Whether or not to finalize active filter and removing reference to it.
        if (e.type !== 'mouseup')
            return;
        /**
         * Check to see if the release event is near the starting event.
         * If so, remove the previously added filter and clear out the active filter.
         */
        if (distance(_ixsa.p0, _ixsa.p1) < FILTER_REMOVE_THRESHOLD) {
            // Remove matching filter based on event position value.
            const filters = _filters[_ixf.key] || [];
            const pos = (_ixf.active.p1 - _ixf.active.p0) / 2 + _ixf.active.p0;
            const removeIndex = filters.findIndex(filter => pos >= filter.p0 && pos <= filter.p1);
            if (removeIndex !== -1) {
                // Make hook callback.
                (_d = (_c = this.config.hooks).onFilterRemove) === null || _d === void 0 ? void 0 : _d.call(_c, internalToFilter(filters[removeIndex]));
                // Remove filter.
                filters.splice(removeIndex, 1);
            }
        }
        else {
            // Swap p0 and p1 if p1 is less than p0.
            if (_ixf.active.p1 < _ixf.active.p0) {
                const [tempP, tempValue] = [_ixf.active.p1, _ixf.active.value1];
                [_ixf.active.p1, _ixf.active.value1] = [_ixf.active.p0, _ixf.active.value0];
                [_ixf.active.p0, _ixf.active.value0] = [tempP, tempValue];
            }
            // Make corresponding filter hook callback.
            switch (_ixsa.type) {
                case ActionType.FilterCreate:
                    (_f = (_e = this.config.hooks).onFilterCreate) === null || _f === void 0 ? void 0 : _f.call(_e, internalToFilter(_ixf.active));
                    break;
                case ActionType.FilterMove:
                    (_h = (_g = this.config.hooks).onFilterMove) === null || _h === void 0 ? void 0 : _h.call(_g, internalToFilter(_ixf.active));
                    break;
                case ActionType.FilterResizeAfter:
                case ActionType.FilterResizeBefore:
                    (_k = (_j = this.config.hooks).onFilterResize) === null || _k === void 0 ? void 0 : _k.call(_j, internalToFilter(_ixf.active));
                    break;
            }
        }
        // Overwrite active filter to remove reference to filter in filters list.
        _ixf.active = { ...FILTER };
        _ixf.key = undefined;
        this.cleanUpFilters();
        // Make hook call back with all of the filter changes.
        (_o = (_m = this.config.hooks) === null || _m === void 0 ? void 0 : _m.onFilterChange) === null || _o === void 0 ? void 0 : _o.call(_m, internalToFilters(this.filters));
    }
    cleanUpFilters() {
        Object.keys(this.filters).forEach(key => {
            const filters = this.filters[key] || [];
            for (let i = 0; i < filters.length; i++) {
                // Remove invalid filters.
                if (isFilterInvalid(filters[i])) {
                    filters[i] = { ...FILTER };
                    continue;
                }
                // Remove filters that are sized 0.
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
    updateCursor() {
        const _ix = this.ix;
        const _ixsa = _ix.shared.action;
        const _ixsf = _ix.shared.focus;
        const isHorizontal = this.config.direction === Direction.Horizontal;
        let cursor = 'default';
        if (_ixsa.type !== ActionType.None) {
            if (_ixsa.type === ActionType.FilterMove || _ixsa.type === ActionType.LabelMove) {
                cursor = 'grabbing';
            }
            else if (_ixsa.type === ActionType.FilterResizeAfter ||
                _ixsa.type === ActionType.FilterResizeBefore) {
                cursor = isHorizontal ? 'ns-resize' : 'ew-resize';
            }
            else if (_ixsa.type === ActionType.FilterCreate) {
                cursor = 'crosshair';
            }
        }
        else if (_ixsf !== undefined) {
            if (_ixsf.type === FocusType.DimensionLabel) {
                cursor = 'grab';
            }
            else if (_ixsf.type === FocusType.DimensionAxis) {
                cursor = 'crosshair';
            }
            else if (_ixsf.type === FocusType.Filter) {
                cursor = 'grab';
            }
            else if (_ixsf.type === FocusType.FilterResize) {
                cursor = isHorizontal ? 'ns-resize' : 'ew-resize';
            }
        }
        this.canvas.style.cursor = cursor;
    }
    clear() {
        const { h, w } = this.size;
        this.ctx.clearRect(0, 0, w, h);
    }
    draw() {
        var _a;
        if (!this._)
            return;
        const _dl = this._.dims.list;
        const _dsa = this._.dims.shared.axes;
        const _dsl = this._.dims.shared.label;
        const _s = this._.styles;
        const _ix = this.ix;
        const _ixsf = this.ix.shared.focus;
        const _filters = this.filters;
        const isHorizontal = this.config.direction === Direction.Horizontal;
        const axesStyle = this.config.style.axes;
        const dataStyle = this.config.style.data;
        const dimStyle = this.config.style.dimension;
        const isLabelBefore = dimStyle.label.placement === LabelPlacement.Before;
        const isAxesBefore = axesStyle.label.placement === LabelPlacement.Before;
        // Draw data lines.
        const dimColorKey = (_a = dataStyle.colorScale) === null || _a === void 0 ? void 0 : _a.dimensionKey;
        for (let k = 0; k < this.dataCount; k++) {
            let dataDefaultStyle = dataStyle.default;
            let hasFilters = false;
            let isFilteredOut = false;
            const series = this.dimensions.map((dimension, i) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                const key = dimension.key;
                const layout = _dl[i].layout;
                const bound = getDragBound(i, _ix, layout.bound);
                const value = this.data[key][k];
                const pos = (_b = (_a = dimension.scale) === null || _a === void 0 ? void 0 : _a.valueToPos(value)) !== null && _b !== void 0 ? _b : 0;
                const percent = (_d = (_c = dimension.scale) === null || _c === void 0 ? void 0 : _c.valueToPercent(value)) !== null && _d !== void 0 ? _d : 0;
                const x = bound.x + layout.axisStart.x + (isHorizontal ? 0 : pos);
                const y = bound.y + layout.axisStart.y + (isHorizontal ? pos : 0);
                if (dimColorKey === key) {
                    const percent = (_f = (_e = dimension.scale) === null || _e === void 0 ? void 0 : _e.valueToPercent(value)) !== null && _f !== void 0 ? _f : 0;
                    const reverse = (_h = (_g = dimension.scale) === null || _g === void 0 ? void 0 : _g.reverse) !== null && _h !== void 0 ? _h : false;
                    const colors = ((_j = dataStyle.colorScale) === null || _j === void 0 ? void 0 : _j.colors) || [];
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
                        const filterMin = Math.min(filter.p0, filter.p1);
                        const filterMax = Math.max(filter.p0, filter.p1);
                        if (percent >= filterMin && percent <= filterMax) {
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
        const labelAdjust = dimStyle.label.angle == null && isHorizontal;
        const dimTextStyle = {
            textAlign: labelAdjust ? 'center' : undefined,
            textBaseline: labelAdjust ? (isLabelBefore ? 'bottom' : 'top') : undefined,
        };
        this.dimensions.forEach((dimension, i) => {
            var _a;
            const bound = getDragBound(i, _ix, _dl[i].layout.bound);
            const labelPoint = _dl[i].layout.labelPoint;
            const x = bound.x + labelPoint.x;
            const y = bound.y + labelPoint.y;
            const style = { ..._s[i].label, ...dimTextStyle };
            drawText(this.ctx, dimension.labelTruncated, x, y, (_a = _dsl.rad) !== null && _a !== void 0 ? _a : 0, style);
        });
        // Draw dimension axes.
        const tickAdjust = axesStyle.label.angle == null && isHorizontal;
        const tickTextStyle = {
            textAlign: tickAdjust ? undefined : 'center',
            textBaseline: tickAdjust ? undefined : (isAxesBefore ? 'bottom' : 'top'),
        };
        _dl.forEach((dim, i) => {
            const key = this.dimensions[i].key;
            const bound = getDragBound(i, _ix, dim.layout.bound);
            const axisStart = dim.layout.axisStart;
            const axisStop = dim.layout.axisStop;
            const tickLabels = dim.axes.tickLabels;
            const tickPos = dim.axes.tickPos;
            const tickLengthFactor = isAxesBefore ? -1 : 1;
            const filters = _filters[key] || [];
            drawLine(this.ctx, bound.x + axisStart.x, bound.y + axisStart.y, bound.x + axisStop.x, bound.y + axisStop.y, _s[i].axis);
            for (let j = 0; j < tickLabels.length; j++) {
                let tickLabel = tickLabels[j];
                if (tickLabel[0] === '*') {
                    if ((_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.dimIndex) === i && ((_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.type) === FocusType.DimensionAxis ||
                        (_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.type) === FocusType.Filter ||
                        (_ixsf === null || _ixsf === void 0 ? void 0 : _ixsf.type) === FocusType.FilterResize)) {
                        tickLabel = tickLabel.substring(1);
                    }
                    else {
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
                drawLine(this.ctx, x0, y0, x1, y1, _s[i].tick);
                const cx = isHorizontal ? x1 + tickLengthFactor * axesStyle.label.offset : x0;
                const cy = isHorizontal ? y0 : y1 + tickLengthFactor * axesStyle.label.offset;
                const rad = axesStyle.label.angle != null
                    ? axesStyle.label.angle
                    : (isHorizontal && isAxesBefore ? Math.PI : 0);
                const style = { ..._s[i].tickLabel, ...tickTextStyle };
                drawText(this.ctx, tickLabel, cx, cy, rad, style);
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
                drawRect(this.ctx, x, y, w, h, _s[i].filters[j]);
            });
        });
    }
    drawDebugOutline() {
        if (!this._)
            return;
        const { h, w } = this.size;
        const _l = this._.layout;
        const _dl = this._.dims.list;
        const _dsly = this._.dims.shared.layout;
        const isHorizontal = this.config.direction === Direction.Horizontal;
        // Draw the drawing area by outlining paddings.
        const paddingStyle = { strokeStyle: '#dddddd' };
        drawLine(this.ctx, 0, _l.padding[0], w, _l.padding[0], paddingStyle);
        drawLine(this.ctx, 0, h - _l.padding[2], w, h - _l.padding[2], paddingStyle);
        drawLine(this.ctx, _l.padding[3], 0, _l.padding[3], h, paddingStyle);
        drawLine(this.ctx, w - _l.padding[1], 0, w - _l.padding[1], h, paddingStyle);
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
            drawRect(this.ctx, isHorizontal ? _l.padding[3] + i * _dsly.space : bound.x, isHorizontal ? bound.y : _l.padding[0] + i * _dsly.space, isHorizontal ? _dsly.space : bound.w, isHorizontal ? bound.h : _dsly.space, dimStyle);
            drawRect(this.ctx, bound.x, bound.y, bound.w, bound.h, boundStyle);
            drawCircle(this.ctx, bound.x + labelPoint.x, bound.y + labelPoint.y, 3, labelPointStyle);
            drawBoundary(this.ctx, labelBoundary, labelBoundaryStyle);
            drawBoundary(this.ctx, axisBoundary, axisBoundaryStyle);
        });
    }
    handleResize(entries) {
        const entry = entries.find(entry => entry.target === this.element);
        if (!entry)
            return;
        const { width: w, height: h } = entry.contentRect;
        this.setSize(w, h);
    }
    handleDoubleClick() {
        var _a, _b;
        // Reset chart settings.
        this.setDimensions(this.dimensionsOriginal, false);
        this.filters = {};
        this.ix = clone(IX);
        this.redraw();
        // Make hook callback.
        (_b = (_a = this.config.hooks).onReset) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    handleMouseDown(e) {
        var _a, _b;
        if (!this._)
            return;
        const _ixs = this.ix.shared;
        const _ixsa = this.ix.shared.action;
        const _ixd = this.ix.dimension;
        const _ixf = this.ix.filters;
        const _dsa = this._.dims.shared.axes;
        const isHorizontal = this.config.direction === Direction.Horizontal;
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
            const axisStart = layout.axisStart;
            if (((_a = _ixs.focus) === null || _a === void 0 ? void 0 : _a.type) === FocusType.DimensionLabel) {
                _ixsa.type = ActionType.LabelMove;
                _ixsa.dimIndex = i;
                _ixd.axis = bound[hKey] + axisStart[hKey];
                _ixd.bound = bound;
            }
            else if ([
                FocusType.DimensionAxis,
                FocusType.Filter,
                FocusType.FilterResize,
            ].includes((_b = _ixs.focus) === null || _b === void 0 ? void 0 : _b.type)) {
                _ixsa.type = ActionType.FilterCreate;
                _ixsa.dimIndex = i;
                _ixf.key = this.dimensions[i].key;
                const p0 = (_ixsa.p0[vKey] - bound[vKey] - axisStart[vKey]) / _dsa.length;
                const value0 = this.dimensions[i].scale.percentToValue(p0);
                this.setActiveFilter(_ixf.key, p0, value0);
            }
        }
        // Update cursor pointer based on type and position.
        this.updateCursor();
        this.redraw();
    }
    handleMouseMove(e) {
        if (!this._)
            return;
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
    handleMouseUp(e) {
        if (!this._)
            return;
        const point = getMousePoint(e, this.element);
        this.ix.shared.action.p1 = point;
        // Update dimension dragging via label.
        this.updateActiveLabel();
        // Update active filter upon release event.
        this.updateActiveFilter(e);
        // Reset drag info but preserve focus.
        this.ix = clone(IX);
        this.ix.shared.focus = this.getFocusByPoint(point);
        // Update cursor pointer based on type and position.
        this.updateCursor();
        this.redraw();
    }
}

export { ActionType, DimensionLayout, DimensionType, Direction, FocusType, LabelPlacement, PathType, Hermes as default };
