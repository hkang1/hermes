import CategoricalScale from './classes/CategoricalScale';
import LinearScale from './classes/LinearScale';
import LogScale from './classes/LogScale';
/**
 * TYPES
 */
export declare type Padding = number | [number, number] | [number, number, number, number];
export declare type Primitive = boolean | number | string;
export declare type Range<T = number> = [T, T];
export declare type RecordKey = string | number | symbol;
export declare type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};
/**
 * Canvas Rendering Types
 */
export declare type Action = {
    dimIndex: number;
    filterIndex?: number;
    p0: Point;
    p1: Point;
    type: ActionType;
};
export declare type Boundary = [Point, Point, Point, Point];
export declare type Focus = {
    dimIndex: number;
    filterIndex?: number;
    type: FocusType;
};
export declare type Point = {
    x: number;
    y: number;
};
export declare type Rect = Point & Size;
export declare type Size = {
    h: number;
    w: number;
};
export declare type StyleLine = Partial<CanvasFillStrokeStyles & CanvasPathDrawingStyles>;
export declare type StyleRect = Partial<StyleShape & {
    cornerRadius: number;
}>;
export declare type StyleShape = Partial<CanvasFillStrokeStyles & CanvasPathDrawingStyles>;
export declare type StyleText = Partial<CanvasFillStrokeStyles & CanvasPathDrawingStyles & CanvasTextDrawingStyles>;
/**
 * Data Types
 */
export declare type DimensionKey = string;
/**
 * ENUMERABLES
 */
export declare enum ActionType {
    FilterCreate = "filter-create",
    FilterMove = "filter-move",
    FilterResizeAfter = "filter-resize-after",
    FilterResizeBefore = "filter-resize-before",
    LabelMove = "label-move",
    None = "none"
}
export declare enum AxisType {
    Categorical = "categorical",
    Linear = "linear",
    Logarithmic = "logarithmic"
}
export declare enum DimensionLayout {
    AxisEvenlySpaced = "axis-evenly-spaced",
    Equidistant = "equidistant",
    EvenlySpaced = "evenly-spaced"
}
export declare enum Direction {
    Horizontal = "horizontal",
    Vertical = "vertical"
}
export declare enum FocusType {
    DimensionLabel = "dimension-label",
    DimensionAxis = "dimension-axis",
    Filter = "filter",
    FilterResize = "filter-resize"
}
export declare enum LabelPlacement {
    After = "after",
    Before = "before"
}
export declare enum PathType {
    Bezier = "bezier",
    Straight = "straight"
}
/**
 * INTERFACES
 */
export interface Axis {
    categories?: Primitive[];
    dataOnEdge?: boolean;
    logBase?: number;
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
export interface LabelMoveOptions extends LabelOptions {
    boundaryPadding: number;
}
export interface Filter {
    p0: number;
    p1: number;
    value0: Primitive;
    value1: Primitive;
}
export interface FilterActive extends Filter {
    startP0?: number;
    startP1?: number;
}
export interface FilterOptions extends StyleRect {
    width: number;
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
export declare type HermesData = Record<DimensionKey, Primitive[]>;
export interface HermesOptions {
    direction: Direction;
    style: {
        axes: {
            axis: AxisOptions;
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
            layout: DimensionLayout;
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
        active: FilterActive;
        key?: DimensionKey;
    };
    shared: {
        action: Action;
        focus?: Focus;
    };
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
                axisBoundary: Boundary;
                axisStart: Point;
                axisStop: Point;
                bound: Rect;
                boundOffset: Point;
                labelBoundary: Boundary;
                labelPoint: Point;
                spaceAfter: number;
                spaceBefore: number;
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
        padding: [number, number, number, number];
    };
    styles: {
        axis: StyleLine;
        filters: FilterOptions[];
        label: StyleText;
        tick: StyleLine;
        tickLabel: StyleText;
    }[];
}
