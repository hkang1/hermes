import CategoricalScale from './classes/CategoricalScale';
import LinearScale from './classes/LinearScale';
import LogScale from './classes/LogScale';
import NiceScale from './classes/NiceScale';

/**
 * TYPES
 */

export type Padding = number | [ number, number ] | [ number, number, number, number ];
export type Primitive = boolean | number | string;
export type Range<T = number> = [ T, T ];
export type RecordKey = string | number | symbol;
export type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> };

/**
 * Canvas Rendering Types
 */

export type Boundary = [ Point, Point, Point, Point ];
export type Point = { x: number, y: number };
export type Rect = Point & Size;
export type Size = { h: number, w: number };

/**
 * Data Types
 */

export type DimensionKey = string;
export type StyleLine =Partial<CanvasFillStrokeStyles & CanvasPathDrawingStyles>;
export type StyleShape = Partial<CanvasFillStrokeStyles & CanvasPathDrawingStyles>;
export type StyleText = Partial<
  CanvasFillStrokeStyles &
  CanvasPathDrawingStyles &
  CanvasTextDrawingStyles
>;

/**
 * ENUMERABLES
 */

export enum AxisType {
  Categorical = 'categorical',
  Linear = 'linear',
  Logarithmic = 'logarithmic',
}

export enum DimensionLayout {
  AxisEvenlySpaced = 'axis-evenly-spaced',
  Equidistant = 'equidistant',
  EvenlySpaced = 'evenly-spaced',
}

export enum Direction {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export enum DragType {
  DimensionFilterCreate = 'dimension-filter-create',
  DimensionFilterMove = 'dimension-filter-move',
  DimensionFilterResizeAfter = 'dimension-filter-resize-after',
  DimensionFilterResizeBefore = 'dimension-filter-resize-before',
  DimensionLabel = 'dimension-label',
  None = 'none',
}

export enum FontWeight {
  Bold = 'bold',
  Bolder = 'bolder',
  Lighter = 'lighter',
  Normal = 'normal',
}

export enum FontStyle {
  Italic = 'italic',
  Normal = 'normal',
  Oblique = 'oblique',
}

export enum LabelPlacement {
  After = 'after',
  Before = 'before',
}

export enum PathType {
  Bezier = 'bezier',
  Straight = 'straight',
}

/**
 * INTERFACES
 */

export interface Axis {
  auto?: boolean;
  categories?: Primitive[];
  logBase?: number;
  range?: Range;
  scale: CategoricalScale | LinearScale | LogScale;
  type: AxisType;
}

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
  axis: Axis;
  key: string;
  label: string;
}

export interface DimensionLabelOptions extends LabelOptions {
  boundaryPadding: number;
}

export interface Filter {
  p0: number;         // starting axis pixel position relative to axisStart.(x|y).
  p1: number;         // ending axis pixel position relative to axisStart.(x|y).
  value0: Primitive;  // starting axis value.
  value1: Primitive;  // ending axis value.
}

export interface FilterOptions extends StyleShape {
  width: number;
}

export interface Font {
  family?: string;
  size?: number;
  style?: FontStyle;
  weight?: FontWeight | number;
}

export interface LabelOptions extends StyleText {
  angle?: number;
  offset: number;
  placement: LabelPlacement;
}

export interface PathOptions {
  options: {
    bezierFactor?: number;
  };
  type: PathType;
}

export interface TickOptions extends StyleLine {
  length: number;
}

/**
 * PRIMARY INTERFACES AND TYPES
 */

export type HermesData = Record<DimensionKey, Primitive[]>;

export interface HermesOptions {
  direction: Direction;
  //hooks: {},
  style: {
    axes: {
      axis: AxisOptions,
      filter: FilterOptions;
      label: LabelOptions;
      tick: TickOptions;
    };
    data: DataOptions;
    dimension: {
      label: DimensionLabelOptions;
      layout: DimensionLayout;
    };
    padding: Padding;
  };
}

export interface Drag {
  dimension: {
    bound0?: Rect;
    bound1?: Rect;
    offset: Point;
  };
  filters: {
    active: Filter;
    key?: DimensionKey;
  };
  shared: {
    index: number;
    p0: Point;
    p1: Point;
  };
  type: DragType;
}

export interface Filters {
  [key: DimensionKey]: Filter[];
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
}
