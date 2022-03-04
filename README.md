# Hermes Parallel Coordinates [![CircleCI](https://circleci.com/gh/hkang1/hermes.svg?style=svg&circle-token=8ba8640f46689196736c4eba43384331eed60ee2)](<LINK>) [![codecov](https://codecov.io/gh/hkang1/hermes/branch/main/graph/badge.svg?token=JNS0KB6VXX)](https://codecov.io/gh/hkang1/hermes)

A lightweight canvas-based parallel coordinates chart library.

> [Parallel coordinates](https://en.wikipedia.org/wiki/Parallel_coordinates#:~:text=Parallel%20coordinates%20are%20a%20common,typically%20vertical%20and%20equally%20spaced.) are a common way of visualizing and analyzing high-dimensional datasets.

Try out the [Live Demo](https://codepen.io/hoyoul/pen/yLPzoMe).

# Screenshots

Standard parallel coordinates rendering with default options.
![Standard](https://github.com/hkang1/hermes/blob/main/screenshots/standard.png?raw=true)

Filtering data on multiple dimensions. You can have multiple filters per dimension as well.
![Multi-Dimension Filtering](https://github.com/hkang1/hermes/blob/main/screenshots/filtered.png?raw=true)

Chart drawn with bezier curves instead of the default straight lines.
![Bezier Curve Lines](https://github.com/hkang1/hermes/blob/main/screenshots/path-type-bezier-curve.png?raw=true)

Support for vertical layout with a simple config change of layout from `horizontal` to `vertical`.
![Vertical Layout](https://github.com/hkang1/hermes/blob/main/screenshots/layout-vertical.png?raw=true)

# Features

- Drag-and-drop dimensions.
- Support for dimension filters. Multiple filters per dimension supported.
- Support for linear, logarithmic and categorical dimension scales.
- Support for vertical layout.
- Auto redraw upon chart resize.
- Color scale and gradient based on a key dimension.
- Highly customizable styles:
  - Axes: color, thickness, width (active and hover styles)
  - Filters: color, thickness, stroke, fill (active and hover styles)
  - Labels: font, color, position, angle (active and hover styles)
  - Ticks: font, color, position, angle (active and hover styles)
- Fast render times.

# Future Features

- Support for event hooks.

# API

`Hermes` is a class. To use render the chart, simply create a new instance of `Hermes` and pass in the necessary parameters.

```
new Hermes(
  container: HTMLElement | string,
  data: Hermes.Data,
  dimensions: Hermes.Dimension[],
  config?: Partial<Hermes.Config>,
);
```

## Hermes Container

The `container` can be an HTML element passed in directly or a query selector that matches an element. For example you can pass in `#hermes` and Hermes will look for the element with the `id` attribute set to `hermes` and use that as a container for the chart rendering.

## Hermes Data Format

The data format is of type [Hermes.Data](https://github.com/hkang1/hermes/blob/main/dist/hermes.d.ts#L228), which is an object with the dimension unique keys as the object key and a list of values for that dimension as the value. The expected data is defined as:

```
type Data = Record<DimensionKey, Primitive[]>;
```

A sample data input might look like...

```
const data = {
  'weight': [ 155, 29, 6, 109 ],
  'gender': [ 'm', 'm', 'u', 'f' ],
  'is-adult': [ true, false, false, true ],
};
```

## Hermes Dimensions Definition

The dimensions definition is a list of [Hermes.Dimension](https://github.com/hkang1/hermes/blob/main/dist/hermes.d.ts#L172-L180), where it is defined as:

```
interface Dimension {
  categories?: Primitive[];
  dataOnEdge?: boolean;
  key: string;
  label: string;
  logBase?: number;
  reverse?: boolean;
  type: EDimensionType;
}
type Primitive = boolean | number | string
type EDimensionType = 'categorical' | 'linear' | 'logarithmic'
```

A sample dimension definition might look like...

```
const dimensions = [
  {
    key: 'weight',
    label: 'Weight',
    type: Hermes.DimensionType.Linear,
  },
  {
    categories: [ 'f', 'm', 'u' ],
    key: 'gender',
    label: 'Gender',
    type: Hermes.DimensionType.Categorical,
  },
  {
    categories: [ true, false ],
    key: 'is-adult',
    label: 'Is an adult?',
    type: Hermes.DimensionType.Categorical,
  },
];
```

### key

This is a required unique identifier for the defined dimension. This is used internally for dimension ordering and when filters are created for a corresponding dimension.

### label

The string label to display on the chart for the dimension.

### type

This field specifies the dimension scale type. The 3 possible values are `categorical`, `linear` or `logarithmic`. The corresponding TypeScript references are `Hermes.DimensionType.Categorical`, `Hermes.DimensionType.Linear` and `Hermes.DimensionType.Logarithmic`.

### categories (optional)

If the [dimension scale type](#type) is set to `categorical`, this field needs to be defined. The data for categorical dimensions need to match a value in the `categories` list. Some examples of `categories`:

```
# boolean categories
categories: [ true, false ]

# numeric categories
categories: [ 1, 2, 4, 8, 16 ]

# string categories
categories: [ 'slow', 'medium', 'fast' ]
```

### dataOnEdge (optional)

If unspecified, `dataOnEdge` defaults to `true`. When `true`, the dimension scale ranges from the minimum data value to the maximum data value. For example, if for dimension `loss` had data values ranging from `2.1` to `5.4`, the dimension scale will show `2.1` to `5.4`.

If disabled and set to `false`, Hermes will try to find the nearest *nice* number for the extremes on the scale. The extremes are still based on the data value range. So for the same `loss` example above, the dimension scale will instead show `2.0` to `5.5` or something similar.

### logBase (optional)

If the [dimension scale type](#type) is set to `logarithmic`, `logBase` can be set to determine what logarithmic base you wish the scale to be set. If this value is not provided, it defaults to `logBase` of 10. Common log base values are 2 and 10.

### reverse (optional)

The dimension axes are drawn vertically, the axis tick values increase from the bottom up. When drawn horizontally, the axis tick values increase from left to right. Setting the `reverse` to `true` will reverse the direction of the axis tick along the axes.

## Hermes Config and Styles

The config provides control over the chart behavior, rendering, style and the ability to hook into key events. [Hermes.Config](https://github.com/hkang1/hermes/blob/main/dist/hermes.d.ts#L230-L267) provides a more up-to-date definition of the config.

```
interface Config {
  direction: EDirection;
  hooks: {
    onDimensionMove?: (dimension: Dimension, index0: number, index1: number) => void;
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
```

### General Config

#### direction (default: 'horizontal')

The direction the dimensions should be laid out. The direction can be set to `horizontal` or `vertical`. The `horizontal` direction will draw the dimensions across the canvas with vertical axes. The `vertical` direction will draw the dimensions top to bottom on the canvas with horizontal axes.

#### resizeThrottleDelay (default: 0)

The number of milliseconds to throttle the resizing. Resizing performs new calculations and redraws based on the new sizes. Depending on data and dimension count, this can slow the browser significantly. The default is set to `0` which means throttling is disabled.

### Hooks

#### onDimensionMove
#### onFilterCreate
#### onFilterMove
#### onFilterRemove
#### onFilterResize
#### onReset
#### onResize

### Style Options

#### axes
#### data
#### dimension
#### padding