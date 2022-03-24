# Hermes Parallel Coordinates [![CircleCI](https://circleci.com/gh/hkang1/hermes.svg?style=svg&circle-token=8ba8640f46689196736c4eba43384331eed60ee2)](<LINK>) [![codecov](https://codecov.io/gh/hkang1/hermes/branch/main/graph/badge.svg?token=JNS0KB6VXX)](https://codecov.io/gh/hkang1/hermes)

A lightweight canvas-based parallel coordinates chart library.

> [Parallel coordinates](https://en.wikipedia.org/wiki/Parallel_coordinates#:~:text=Parallel%20coordinates%20are%20a%20common,typically%20vertical%20and%20equally%20spaced.) are a common way of visualizing and analyzing high-dimensional datasets.

Check out the list of [Demos](https://bejewelled-lamington-f97ebd.netlify.app/) to get an idea of the various capabilities and config options.

Or try out the [Live Demo](https://codepen.io/hoyoul/pen/yLPzoMe) in a sandbox.

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

# API

`Hermes` is a class. To use render the chart, simply create a new instance of `Hermes` and pass in the necessary parameters.

```
new Hermes(
  target: HTMLElement | string,
  dimensions?: Hermes.Dimension[],
  config?: RecursivePartial<Hermes.Config>,
  data?: Hermes.Data,
);
```

## Hermes Target 

The `target` can be an HTML element passed in directly or a query selector that matches an element. For example you can pass in `#hermes` and Hermes will look for the element with the `id` attribute set to `hermes` and use that as a container for the chart rendering.

## Hermes Dimension

The list of dimension defines the behavior of each axis on the chart. A sample dimension definition might look like...

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

## Hermes Data Format

The data format is of type [Hermes.Data](https://github.com/hkang1/hermes/blob/main/dist/hermes.d.ts#L215), which is an object with the dimension unique keys as the object key and a list of values for that dimension as the value. The expected data is defined as:

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

### key: string

This is a required unique identifier for the defined dimension. This is used internally for dimension ordering and when filters are created for a corresponding dimension.

### label: string

The string label to display on the chart for the dimension.

### type: 'categorical' | 'linear' | 'logarithmic'

This field specifies the dimension scale type. The 3 scale types corresponds to the TypeScript enum of `Hermes.DimensionType.Categorical`, `Hermes.DimensionType.Linear` and `Hermes.DimensionType.Logarithmic`.

### categories: [Primitive](https://github.com/hkang1/hermes/blob/main/dist/hermes.d.ts#L66)\[\] (optional)

If the [dimension scale type](#type) is set to `categorical`, this field needs to be defined. The data for categorical dimensions need to match a value in the `categories` list. Some examples of `categories`:

```
# boolean categories
categories: [ true, false ]

# numeric categories
categories: [ 1, 2, 4, 8, 16 ]

# string categories
categories: [ 'slow', 'medium', 'fast' ]
```

### dataOnEdge: boolean (optional)

If unspecified, `dataOnEdge` defaults to `true`. When `true`, the dimension scale ranges from the minimum data value to the maximum data value. For example, if for dimension `loss` had data values ranging from `2.1` to `5.4`, the dimension scale will show `2.1` to `5.4`.

If disabled and set to `false`, Hermes will try to find the nearest *nice* number for the extremes on the scale. The extremes are still based on the data value range. So for the same `loss` example above, the dimension scale will instead show `2.0` to `5.5` or something similar.

### logBase: whole number (optional)

If the [dimension scale type](#type) is set to `logarithmic`, `logBase` can be set to determine what logarithmic base you wish the scale to be set. If this value is not provided, it defaults to `logBase` of 10. Common log base values are 2 and 10.

### reverse: boolean (optional)

The dimension axes are drawn vertically, the axis tick values increase from the bottom up. When drawn horizontally, the axis tick values increase from left to right. Setting the `reverse` to `true` will reverse the direction of the axis tick along the axes.

## Hermes Config and Styles

The config provides control over the chart behavior, rendering, style and the ability to hook into key events. [Hermes.Config](https://github.com/hkang1/hermes/blob/main/dist/hermes.d.ts#L234-L275) provides a more up-to-date definition of the config.

### General Config

#### direction: 'horizontal' **default** | 'vertical'

The direction the dimensions should be laid out. The direction can be set to `horizontal` or `vertical`. The `horizontal` direction will draw the dimensions across the canvas with vertical axes. The `vertical` direction will draw the dimensions top to bottom on the canvas with horizontal axes.

### Hooks

#### onDimensionMove: (dimension: [Dimension](https://github.com/hkang1/hermes/blob/main/dist/hermes.d.ts#L217-L226), newIndex: number, oldIndex: number) => void

Optional hook for when the order of dimensions changes via drag and drop. The callback is called during the drag and whenever dimensions required a swap, even before when the mouse is released. The data for the dimension that is dragged, the new index and the original index are returned.

#### onFilterChange: (filters: [Filters](https://github.com/hkang1/hermes/blob/main/dist/hermes.d.ts#L230-L232)) => void

Optional hook for when any filter changes. The callback is specifically called on the `mouseup` event. The entire updated filters object is returned.

#### onFilterCreate: (filter: Filter) => void

Optional hook for when a filter is created. The newly create filter is returned.

#### onFilterMove: (filter: Filter) => void

Optional hook for when a filter is moved. The modified filter is returned.

#### onFilterRemove: (filter: Filter) => void

Optional hook for when a filter is removed via single click. Info for the removed filter is returned.

#### onFilterResize: (filter: Filter) => void

Optional hook for when a filter is resized. The modified filter is returned.

#### onReset: () => void

Optional hook for when the chart is reset via double click. The dimension order is reset back to the original order and the filters are cleared out.

#### onResize: (newSize: Size, oldSize: Size) => void

Optional hook for when the chart containing element is resized. The resize is detected using the [ResizeObserver API](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver), which observes the chart containing HTML element. When the element changes in size, this callback returns the new size and the original size.

### Interactions

#### throttleDelayMouseMove (default 50)

The time interval in millisconds in which the mouse move event is allowed to propogate. For example, with the default 50ms, as the user moves the mouse cursor around, the mouse move event, the associated calculations and the rerenders are allowed to happen only every 50ms. The `mouseup` handler performs all of the `mousemove` event operations. So if this interval happens to be set to a very high number, where the `mouseup` event occurs before a throttle 

#### throttleDelayResize (default: 50)

The time interval in milliseconds in which the resize event is allowed to propagate. For example, with the default 50ms, as the user is changing the browser window that contains the chart, the resize event, the associated calculations and the rerenders are allowed to happen only every 50ms.

### Style Options

#### axes

##### axis: [AxisOptions]()
##### axisActve: [StyleLine]()
##### axisHover: [StyleLine]()
##### filter: [FilterOptions]()
##### filterActive: [FilterOptions]()
##### filterHover: [FilterOptions]()
##### label: [LabelOptions]()
##### labelActive: [StyleText]()
##### labelHover: [StyleText]()
##### tick: [TickOptions]()
##### tickActive: [StyleLine]()
##### tickHover: [StyleLine]()

#### data: [DataOptions]()

#### dimension

##### label: [LabelMoveOptions]()
##### labelActive: [StyleText]()
##### labelHover: [StyleText]()
##### layout: [EDimensionLayout]()

#### padding: number | number[2] | number [4]

The padding between the edge of the chart container and the chart content, such as the labels, axes and axis labels. The padding can be a single number, a list of two numbers or a list of 4 numbers.

```
// 8px on all four sides ([ 8, 8, 8, 8 ]).
padding: 8

// Padding of 16px on top and bottom and 8px on the left and right ([ 16, 8, 16, 8 ]).
padding: [ 16, 8 ]

// padding of 32px on top, 16px on the right, 8px on bottom, and 4px on the left.
padding: [ 32, 16, 8, 4 ]
```

# Special Thanks

- Leon Sorokin's [uPlot](https://github.com/leeoniya/uPlot) was a great source of inspiration and a lot of the setup work and deployment steps of Hermes are modeled after it. Leon has also provided some great guidance on some technical improvements.
- Alex Johnson provided some great feedback during development to improve the overall the user experience of Hermes.
