# Hermes Parallel Coordinates

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
new Hermes(container, data, dimensions, options);
```

## Hermes Container

The `container` can be an HTML element passed in directly or a query selector that matches an element. For example you can pass in `#hermes` and Hermes will look for the element with the `id` attribute set to `hermes` and use that as a container for the chart rendering.

## Hermes Data Format

TODO

## Hermes Dimension Options

TODO

## Hermes Styles and Options

TODO

```
Options
```
