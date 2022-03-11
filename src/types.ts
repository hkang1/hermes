import CategoricalScale from './classes/CategoricalScale';
import LinearScale from './classes/LinearScale';
import LogScale from './classes/LogScale';

/**
 * TYPES
 */

export type NestedObject = Record<RecordKey, unknown>;
export type Padding = number | [ number, number ] | [ number, number, number, number ];
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
export type StyleLine = Partial<CanvasFillStrokeStyles & CanvasPathDrawingStyles>;
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
}

export interface DataColorScale {
  colors: string[];
  dimensionKey: DimensionKey;
}

export interface DataOptions {
  colorScale?: {
    colors: string[];
    dimensionKey: DimensionKey;
  };
  default: StyleLine;
  defaultColorScale?: DataColorScale;
  filtered: StyleLine;
  filteredColorScale?: DataColorScale;
  path: PathOptions;
}

export interface Dimension {
  categories?: Primitive[];
  dataOnEdge?: boolean;
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
  p0: number;         // starting axis % position relative to axisStart.(x|y).
  p1: number;         // ending axis % position relative to axisStart.(x|y).
  value0: Primitive;  // starting axis value.
  value1: Primitive;  // ending axis value.
}

export interface InternalFilterActive extends InternalFilter {
  startP0?: number;   // Initial p0 value before an existing filter is shifted via dragging.
  startP1?: number;   // Initial p1 value before an existing filter is shifted via dragging.
}

export interface InternalFilters {
  [key: DimensionKey]: InternalFilter[];
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

export type Data = Record<DimensionKey, Primitive[]>;

export interface Config {
  debug: boolean;
  direction: EDirection;
  hooks: {
    onDimensionMove?: (dimension: Dimension, index0: number, index1: number) => void;
    onFilterChange?: (filters: Filters) => void;
    onFilterCreate?: (filter: Filter) => void,
    onFilterMove?: (filter: Filter) => void,
    onFilterRemove?: (filter: Filter) => void,
    onFilterResize?: (filter: Filter) => void,
    onReset?: () => void;
    onResize?: (newSize: Size, oldSize: Size) => void;
  },
  resizeThrottleDelay: number;
  style: {
    axes: {
      axis: AxisOptions,
      axisActve: StyleLine;
      axisHover: StyleLine;
      filter: FilterOptions;
      filterActive: FilterOptions;
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

export type Filter = Range<Primitive>;

export interface Filters {
  [key: DimensionKey]: Filter[];
}

export interface InternalDimension extends Dimension {
  range?: Range;
  scale: CategoricalScale | LinearScale | LogScale;
}

export type InternalDimensions = Record<DimensionKey, InternalDimension>;

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
      layout: {
        axisBoundary: Boundary;   // Coordinates for axis boundary after transformation.
        axisStart: Point;         // Respective to bound (x, y)
        axisStop: Point;          // Respective to bound (x, y)
        bound: Rect;              // Bounding rect for the dimension label and axis.
        boundOffset: Point;       // Offset for the bounding rect from dragging.
        labelBoundary: Boundary;  // Coordinates for label boundary after transformation.
        labelPoint: Point;        // Respective to bound (x, y)
        spaceAfter: number;       // Space after the axis line.
        spaceBefore: number;      // Space before the axis line.
      };
    }[];
    shared: {
      axes: {
        labelFactor: number;
        length: number;
        maxTicks: number;
        start: number;
        stop: number;
      };
      dataCount: number;
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
