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

export type Point = { x: number, y: number };
export type Rect = Point & Size;
export type Size = { h: number, w: number };

/**
 * Data Types
 */

export type DataValue = boolean | number | string | null | undefined;
export type DimensionKey = string;

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

/**
 * INTERFACES
 */

export interface Axis {
  auto?: boolean;
  categories?: Primitive[];
  logBase?: number;
  range?: Range;
  type: AxisType;
}

export interface Dimension {
  axis: Axis;
  key: string;
  label: string;
}

export interface DrawStyle {
  fillStyle?: string | CanvasGradient | CanvasPattern;
  lineWidth?: number;
  strokeStyle?: string | CanvasGradient | CanvasPattern;
}

export interface Font {
  family?: string;
  size?: number;
  style?: FontStyle;
  weight?: FontWeight | number;
}

export interface LabelOptions {
  angle?: number;
  color: string;
  font: Font;
  offset: number;
  placement: LabelPlacement;
}

/**
 * PRIMARY INTERFACES AND TYPES
 */

export type HermesData = Record<DimensionKey, DataValue[]>;

export interface HermesOptions {
  direction: Direction;
  //hooks: {},
  style: {
    axes: {
      axis: {
        color: string;
        width: number;
      },
      label: LabelOptions;
      tick: {
        color: string;
        length: number;
        width: number;
      };
    };
    dimension: {
      label: LabelOptions;
      layout: DimensionLayout;
    };
    padding: Padding;
  };
}

export interface Internal {
  dims: {
    list: {
      axes: {
        maxLength: number;
        scale: {
          max: number;
          min: number;
          range: number;
          tickSpacing: number;
          ticks: number[];
        };
      };
      label: {
        h: number;
        lengthCos: number;
        lengthSin: number;
        w: number;
      };
      layout: {
        axisStart: Point;       // Respective to bound (x, y)
        axisStop: Point;        // Respective to bound (x, y)
        bound: Rect;            // Bounding rect for the dimension label and axis.
        labelPoint: Point;      // Respective to bound (x, y)
        spaceAfter: number;     // Space after the axis line.
        spaceBefore: number;    // Space before the axis line.
        spaceOffset: number;
      };
    }[];
    shared: {
      axes: {
        labelFactor: number;
        maxTicks: number;
        scale: NiceScale;
        start: number;
        stop: number;
      };
      label: {
        cos?: number;
        maxLengthCos?: number;
        maxLengthSin?: number;
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
