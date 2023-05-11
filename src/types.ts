import CategoricalScale from './classes/CategoricalScale';
import LinearScale from './classes/LinearScale';
import LogScale from './classes/LogScale';

/**
 * TYPES
 */

export type HasNull<T> = null | T;
export type HasUndefined<T> = undefined | T;
export type NestedObject = Record<RecordKey, unknown>;
export type Padding = number | [ number, number ] | PaddingNormalized;
export type PaddingNormalized = [ number, number, number, number ]
export type Primitive = boolean | number | string;
export type Range<T = number> = [ T, T ];
export type RecordKey = string | number | symbol;
export type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> };
export type Validation = { message: string, valid: boolean };
export type ValidationData = Validation & { count: number };

/**
 * Canvas Rendering Types
 */

export type Action = {
  dimIndex: number,
  filterIndex?: number,
  p0: Point,
  p1: Point,
  type: EActionType,
};
export type Boundary = [ Point, Point, Point, Point ];
export type Focus = { dimIndex: number, filterIndex?: number, type: EFocusType };
export type Point = { x: number, y: number };
export type Rect = Point & Size;
export type Size = { h: number, w: number };
export type StyleLine = Partial<
  CanvasFillStrokeStyles &
  CanvasPathDrawingStyles &
  { lineDash: number [] }
>;
export type StyleRect = Partial<StyleShape & { cornerRadius: number }>;
export type StyleShape = Partial<CanvasFillStrokeStyles & CanvasPathDrawingStyles>;
export type StyleText = Partial<
  CanvasFillStrokeStyles &
  CanvasPathDrawingStyles &
  CanvasTextDrawingStyles
>;

/**
 * Data Types
 */

export type DimensionKey = string;

/**
 * ENUMERABLES
 */

export type EActionType = typeof ActionType[keyof typeof ActionType];
export type EDimensionLayout = typeof DimensionLayout[keyof typeof DimensionLayout];
export type EDimensionType = typeof DimensionType[keyof typeof DimensionType];
export type EDirection = typeof Direction[keyof typeof Direction];
export type EFocusType = typeof FocusType[keyof typeof FocusType];
export type ELabelPlacement = typeof LabelPlacement[keyof typeof LabelPlacement];
export type EPathType = typeof PathType[keyof typeof PathType];

export const ActionType = {
  FilterCreate: 'filter-create',
  FilterMove: 'filter-move',
  FilterResizeAfter: 'filter-resize-after',
  FilterResizeBefore: 'filter-resize-before',
  LabelMove: 'label-move',
  None: 'none',
} as const;

export const DimensionLayout = {
  AxisEvenlySpaced: 'axis-evenly-spaced',
  Equidistant: 'equidistant',
} as const;

export const DimensionType = {
  Categorical: 'categorical',
  Linear: 'linear',
  Logarithmic: 'logarithmic',
} as const;

export const Direction = {
  Horizontal: 'horizontal',
  Vertical: 'vertical',
} as const;

export const FocusType = {
  DimensionAxis: 'dimension-axis',
  DimensionLabel: 'dimension-label',
  Filter: 'filter',
  FilterResize: 'filter-resize',
} as const;

export const LabelPlacement = {
  After: 'after',
  Before: 'before',
} as const;

export const PathType = {
  Bezier: 'bezier',
  Straight: 'straight',
} as const;

/**
 * INTERFACES
 */

export interface AxisOptions extends StyleLine {
  boundaryPadding: number;
  infLineDash: number[];
  infOffset: number;
  nanGap: number;
}

export interface DataOptions {
  default: StyleLine;
  filtered: StyleLine;
  overrideNaN?: StyleLine;
  overrideNegativeInfinity?: StyleLine;
  overridePositiveInfinity?: StyleLine;
  path: PathOptions;
  targetColorScale?: string[];
  targetDimensionKey?: DimensionKey;
}

export interface Dimension {
  categories?: Primitive[];
  dataOnEdge?: boolean;
  disableDrag?: boolean;
  filters?: Filter[];
  key: string;
  label: string;
  logBase?: number;
  reverse?: boolean;
  type: EDimensionType;
}

export interface FilterOptions extends StyleRect {
  width: number;
}

export interface InternalFilter {
  hasNaN: boolean;
  hasNegativeInfinity: boolean;
  hasPositiveInfinity: boolean;
  p0: number;           // Starting axis % position relative to axisBoundaryStart|Stop.(x|y).
  p1: number;           // Ending axis % position relative to axisBoundaryStart|Stop.(x|y).
  percent0: number;     // Starting percent accommodating NaN and +/-Infinity markers.
  percent1: number;     // Ending percent accommodating NaN and +/-Infinity markers.
  value0: Primitive;    // Starting axis value adjusted for NaN and +/-Infinity markers.
  value1: Primitive;    // Ending axis value adjusted for NaN and +/-Infinity markers.
}

export interface InternalFilterActive extends InternalFilter {
  startP0?: number;   // Initial p0 value before an existing filter is shifted via dragging.
  startP1?: number;   // Initial p1 value before an existing filter is shifted via dragging.
}

export type InternalFilters = Record<DimensionKey, InternalFilter[]>

export interface InternalListeners {
  dblclick: (e: MouseEvent) => void;
  mousedown: (e: MouseEvent) => void;
  mousemove: (e: MouseEvent) => void;
  mouseup: (e: MouseEvent) => void;
}

export interface LabelMoveOptions extends LabelOptions {
  boundaryPadding: number;
}

export interface LabelOptions extends StyleText {
  angle?: number;
  offset: number;
  placement: ELabelPlacement;
  truncate?: number;
}

export interface NumberOptions {
  includeNaN?: number;                  // Probability to show up between 0 and 1.
  includeNegativeInfinity?: number;     // Probability to show up between 0 and 1.
  includePositiveInfinity?: number;     // Probability to show up between 0 and 1.
}

export interface PathOptions {
  options: {
    bezierFactor?: number;
  };
  type: EPathType;
}

export interface TickOptions extends StyleLine {
  length: number;
}

/**
 * PRIMARY INTERFACES AND TYPES
 */

export type RawData = Record<DimensionKey, HasNull<HasUndefined<Primitive>>[]>;

export type Data = Record<DimensionKey, Primitive[]>;

export type ActualAndFiniteRanges = { actual: Range; finite: Range }

export interface Config {
  debug: boolean;
  direction: EDirection;
  filters: Filters,
  hooks: {
    onDimensionMove?: (dimension: Dimension, newIndex: number, oldIndex: number) => void;
    onFilterChange?: (filters: Filters) => void;
    onFilterCreate?: (filters: Filters) => void,
    onFilterMove?: (filters: Filters) => void,
    onFilterRemove?: (filters: Filters) => void,
    onFilterResize?: (filters: Filters) => void,
    onReset?: () => void;
    onResize?: (newSize: Size, oldSize: Size) => void;
  };
  interactions: {
    throttleDelayMouseMove: number;
    throttleDelayResize: number;
  };
  style: {
    axes: {
      axis: AxisOptions,
      axisActve: StyleLine;
      axisHover: StyleLine;
      filter: FilterOptions;
      filterActive: FilterOptions;
      filterAxisHover: FilterOptions;
      filterHover: FilterOptions;
      label: LabelOptions;
      labelActive: StyleText;
      labelHover: StyleText;
      tick: TickOptions;
      tickActive: StyleLine;
      tickHover: StyleLine;
    };
    data: DataOptions;
    dimension: {
      label: LabelMoveOptions;
      labelActive: StyleText;
      labelHover: StyleText;
      layout: EDimensionLayout;
    };
    padding: Padding;
  };
}

export interface IX {
  dimension: {
    axis: number;
    bound?: Rect;
    boundOffset?: Point;
    offset: number;
  };
  filters: {
    active: InternalFilterActive;
    key?: DimensionKey;
  };
  shared: {
    action: Action;
    focus?: Focus;
  };
}

export type Filter = Range<number>

export type Filters = Record<DimensionKey, Filter[]>

export interface InternalDataInfo {
  hasInfinity: boolean;
  hasNaN: boolean;
  seriesCount: number;
}

export interface InternalDimension extends Dimension {
  labelTruncated: string;
  rangeActual?: Range;
  rangeFinite?: Range;
  scale: CategoricalScale | LinearScale | LogScale;
}

export type InternalDimensions = Record<DimensionKey, InternalDimension>;

export interface InternalDimensionLayout {
  axisBoundary: Boundary;   // Coordinates for axis boundary after transformation.
  axisBoundaryStart: Point; // Respective to bound (x, y).
  axisBoundaryStop: Point;  // Respective to bound (x, y).
  axisDataStart: Point;     // Axis excluding +/-Infinity and NaN.
  axisDataStop: Point;      // Axis excluding +/-Infinity and NaN.
  axisInfinityStart: Point; // Axis including +/-Infinity but excluding NaN.
  axisInfinityStop: Point;  // Axis including +/-Infinity but excluding NaN.
  bound: Rect;              // Bounding rect for the dimension label and axis.
  boundOffset: Point;       // Offset for the bounding rect from dragging.
  labelBoundary: Boundary;  // Coordinates for label boundary after transformation.
  labelPoint: Point;        // Respective to bound (x, y).
  spaceAfter: number;       // Space after the axis line.
  spaceBefore: number;      // Space before the axis line.
}

export interface Internal {
  dims: {
    list: {
      axes: {
        maxLength: number;
        tickLabels: string[];
        tickPos: number[];
        ticks: number[];
      };
      label: {
        h: number;
        lengthCos: number;
        lengthSin: number;
        w: number;
      };
      layout: InternalDimensionLayout;
    }[];
    map: Record<DimensionKey, number>,
    shared: {
      axes: {
        labelFactor: number;
        length: number;
        maxTicks: number;
        start: number;
        startData: number;
        startInfinity: number;
        startNaN?: number;
        stop: number;
        stopData: number;
        stopInfinity: number;
        stopNaN?: number;
      };
      label: {
        cos?: number;
        maxLengthCos?: number;
        maxLengthSin?: number;
        rad?: number;
        sin?: number;
      };
      layout: {
        gap: number;
        offset: number;
        space: number;
        totalBoundSpace: number;
      };
    };
  };
  layout: {
    drawRect: Rect;
    padding: [ number, number, number, number ];
  };
  styles: {
    axis: StyleLine;
    filters: FilterOptions[];
    label: StyleText;
    tick: StyleLine;
    tickLabel: StyleText;
  }[];
}
