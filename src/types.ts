import NiceScale from './classes/NiceScale';

/*
 * Base Core Types
 */
export type Primitive = boolean | number | string;
export type Padding = number | [ number, number ] | [ number, number, number, number ];
export type Range<T = number> = [ T, T ];
export type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> };

/*
 * Canvas Rendering Types
 */
export type Point = { x: number, y: number };
export type Size = { h: number, w: number };
export type Rect = Point & Size;

/*
 * Chart Option Types
 */
export enum LabelPlacement {
  After = 'after',
  Before = 'before',
}

export enum AxesLabelLayout {
  After = 'after',
  Before = 'before',
}

export enum AxisType {
  Categorical = 'categorical',
  Linear = 'linear',
  Logarithmic = 'logarithmic',
}

export enum DimensionLabelLayout {
  End = 'end',
  Start = 'start',
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

export interface DrawStyle {
  fillStyle?: string | CanvasGradient | CanvasPattern;
  lineWidth?: number;
  strokeStyle?: string | CanvasGradient | CanvasPattern;
}

export interface Axis {
  auto?: boolean;
  categories?: Primitive[];
  range?: Range;
  type: AxisType;
}

export interface Font {
  family?: string;
  size?: number;
  style?: FontStyle;
  weight?: FontWeight | number;
}

export interface Dimension {
  axis: Axis;
  key: string;
  label: string;
}

export interface LabelOptions {
  angle?: number;
  color: string;
  font: Font;
  offset: number;
  placement: LabelPlacement;
}

export interface HermesOptions {
  direction: Direction;
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
        axisStart: Point;
        axisStop: Point;
        bound: Rect;
        labelPoint: Point;
        spaceAfter: number;
        spaceBefore: number;
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
        totalBoundSpace: number;
      };
    };
  };
  layout: {
    drawRect: Rect;
    padding: [ number, number, number, number ];
  };
}
