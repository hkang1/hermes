declare class NiceScale {
  constructor(
    direction: Hermes.EDirection,
    minValue: number,
    maxValue: number,
    config?: { dataOnEdge?: boolean, reverse?: boolean },
  );
  public setAxisLength(axisLength: number): void;
  public setMinMaxValues(minValue: number, maxValue: number): void;
  protected niceNum(range: number, round: boolean): number;
}

declare class CategoricalScale extends NiceScale {
  constructor(
    direction: Hermes.EDirection,
    categories?: Hermes.Primitive[],
    config?: { dataOnEdge?: boolean, reverse?: boolean },
  );
}

declare class LinearScale extends NiceScale {}

declare class LogScale extends NiceScale {
  constructor(
    direction: Hermes.EDirection,
    minValue: number,
    maxValue: number,
    logBase?: number,
    config?: { dataOnEdge?: boolean, reverse?: boolean },
  );
  public setLogBase(logBase?: number): void;
}

declare class Hermes {
  constructor(
    target: HTMLElement | string,
    dimensions?: Hermes.Dimension[],
    options?: Hermes.RecursivePartial<Hermes.Config>,
    data?: Hermes.Data,
  );

  static getTester(): Hermes.Tester;
  static validateData(data: Hermes.Data): { count: number, valid: boolean };
  static validateDimension(dimension: Hermes.Dimension): { message: string, valid: boolean };
  static validateDimensions(dimensions: Hermes.Dimension[]): { message: string, valid: boolean };

  setConfig(config: Hermes.RecursivePartial<Hermes.Config>, redraw?: boolean): void;
  setData(data: Hermes.Data, redraw?: boolean): void;
  setDimensions(dimensions: Hermes.Dimension[], redraw?: boolean): void;
  setSize(w: number, h: number, redraw?: boolean): void;

  disable(): void;
  enable(): void;
  redraw(): void;
  destroy(): void;
}

export = Hermes;

declare namespace Hermes {
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

  export const ActionType: {
    FilterCreate: 'filter-create',
    FilterMove: 'filter-move',
    FilterResizeAfter: 'filter-resize-after',
    FilterResizeBefore: 'filter-resize-before',
    LabelMove: 'label-move',
    None: 'none',
  };

  export const DimensionLayout: {
    AxisEvenlySpaced: 'axis-evenly-spaced',
    Equidistant: 'equidistant',
  };

  export const DimensionType: {
    Categorical: 'categorical',
    Linear: 'linear',
    Logarithmic: 'logarithmic',
  };

  export const Direction: {
    Horizontal: 'horizontal',
    Vertical: 'vertical',
  };

  export const FocusType: {
    DimensionAxis: 'dimension-axis',
    DimensionLabel: 'dimension-label',
    Filter: 'filter',
    FilterResize: 'filter-resize',
  };

  export const LabelPlacement: {
    After: 'after',
    Before: 'before',
  };

  export const PathType: {
    Bezier: 'bezier',
    Straight: 'straight',
  };

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
    disableDrag?: boolean;
    key: string;
    label: string;
    logBase?: number;
    reverse?: boolean;
    type: EDimensionType;
  }

  export interface FilterOptions extends StyleRect {
    width: number;
  }

  export interface LabelMoveOptions extends LabelOptions {
    boundaryPadding: number;
  }

  export interface LabelOptions extends StyleText {
    angle?: number;
    offset: number;
    placement: ELabelPlacement;
  }

  export interface PathOptions {
    options: {
      bezierFactor?: number;
    };
    type: EPathType;
  }

  export interface Tester {
    generateData: (dimensions: Dimension[], count: number, random?: boolean) => Data;
    generateDimensions: (dimCount?: number, random?: boolean) => Dimension[];
  }

  export interface TickOptions extends StyleLine {
    length: number;
  }

  /**
   * PRIMARY INTERFACES AND TYPES
   */

  export type Data = Record<DimensionKey, Primitive[]>;

  export type Filter = Range<Primitive>;

  export interface Filters {
    [key: DimensionKey]: Filter[];
  }

  export interface Config {
    direction: EDirection;
    hooks: {
      onDimensionMove?: (dimension: Dimension, newIndex: number, oldIndex: number) => void;
      onFilterChange?: (filters: Filters) => void;
      onFilterCreate?: (filter: Filter) => void,
      onFilterMove?: (filter: Filter) => void,
      onFilterRemove?: (filter: Filter) => void,
      onFilterResize?: (filter: Filter) => void,
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
}

export as namespace Hermes;
