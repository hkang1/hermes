import { deepmerge } from 'deepmerge-ts';

import HermesError from './classes/HermesError';
import NiceScale from './classes/NiceScale';
import * as t from './types';
import {
  getFont, getTextSize, normalizePadding,
} from './utils/canvas';
import { getElement } from './utils/dom';

const CONFIG = { TICK_DISTANCE: 5 };

const DEFAULT_OPTIONS: t.HermesOptions = {
  direction: t.Direction.Horizontal,
  style: {
    axes: {
      axis: {
        color: 'grey',
        width: 1,
      },
      label: {
        color: 'blue',
        font: { size: 12 },
        offset: 10,
        placement: t.LabelPlacement.After,
      },
      tick: {
        color: 'red',
        length: 10,
        width: 1,
      },
    },
    dimension: {
      label: {
        angle: Math.PI / 4,
        color: 'black',
        font: { size: 14 },
        offset: 10,
        placement: t.LabelPlacement.Before,
      },
    },
    padding: 25,
  },
};

class Hermes {
  private element: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private resizeObserver: ResizeObserver;
  private dimensions: t.Dimension[];
  private options: t.HermesOptions;
  private size: t.Size = { h: 0, w: 0 };
  private _: any = {};

  constructor(
    target: HTMLElement | string,
    dimensions: t.Dimension[],
    options: t.RecursivePartial<t.HermesOptions> = {},
  ) {
    const element = getElement(target);
    if (!element) throw new HermesError('Target element selector did not match anything.');
    this.element = element;

    // Create a canvas and append it to the target element.
    this.canvas = document.createElement('canvas');
    this.element.appendChild(this.canvas);

    // Setup initial canvas size.
    const rect = this.element.getBoundingClientRect();
    this.setSize(rect.width, rect.height);

    // Get canvas context.
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new HermesError('Unable to get context from target element.');
    this.ctx = ctx;

    this.dimensions = dimensions;
    this.options = deepmerge(DEFAULT_OPTIONS, options) as t.HermesOptions;

    // Add resize observer to detect target element resizing.
    this.resizeObserver = new ResizeObserver(entries => {
      const rect = entries[0].contentRect;
      this.setSize(rect.width, rect.height);
      this.calculate();
    });
    this.resizeObserver.observe(this.element);
  }

  destroy(): void {
    this.resizeObserver.unobserve(this.element);
  }

  draw(): void {
    // Set line width
    this.ctx.lineWidth = 1;
    this.ctx.fillStyle = 'black';

    // calculate dimension labels
    // calculate axis labels

    // this.drawDimensions();

    // this.ctx.fillRect(100, 100, 100, 100);

    // Wall
    // this.ctx.strokeRect(0, 0, 100, 100);

    // // Door
    // this.ctx.fillRect(130, 190, 40, 60);

    // // Roof
    // this.ctx.beginPath();
    // this.ctx.moveTo(50, 140);
    // this.ctx.lineTo(150, 60);
    // this.ctx.lineTo(250, 140);
    // this.ctx.closePath();
    // this.ctx.stroke();
  }

  calculate(): void {
    console.log('calculate');
    const _: any = {
      dims: {
        list: new Array(this.dimensions.length)
          .fill(undefined)
          .map(() => ({ axes: {}, label: {}, layout: {} })),
        shared: { axes: {}, label: {}, layout: {} },
      },
      layout: {
        drawRect: {},
        padding: normalizePadding(this.options.style.padding),
      },
    };

    const isHorizontal = this.options.direction === t.Direction.Horizontal;
    const dimLabelStyle = this.options.style.dimension.label;
    const axesLabelStyle = this.options.style.axes.label;
    const placement = dimLabelStyle.placement;
    const dimCount = this.dimensions.length;

    const _l = _.layout;
    const _dsa = _.dims.shared.axes;
    const _dsl = _.dims.shared.label;
    const _dsly = _.dims.shared.layout;

    /**
     * Calculate actual render area (canvas minus padding).
     */
    _l.drawRect = {
      h: this.size.h - _l.padding[0] - _l.padding[2],
      w: this.size.w - _l.padding[1] - _l.padding[3],
      x: _l.padding[3],
      y: _l.padding[0],
    };

    /**
     * Go through each of the dimension labels and calculate the size
     * of each one and figure out how much space is needed for them.
     */
    _dsl.cos = dimLabelStyle.angle ? Math.cos(dimLabelStyle.angle) : undefined;
    _dsl.sin = dimLabelStyle.angle ? Math.sin(dimLabelStyle.angle) : undefined;
    _dsl.cosMax = 0;
    _dsl.sinMax = 0;
    this.dimensions.forEach((dimension, index) => {
      const textSize = getTextSize(this.ctx, dimension.label);
      const _dlil = _.dims.list[index].label;
      _dlil.w = textSize.w;
      _dlil.h = textSize.h;
      _dlil.lengthCos = _dsl.cos ? textSize.w * _dsl.cos : undefined;
      _dlil.lengthSin = _dsl.sin ? textSize.w * _dsl.sin : undefined;
      if (_dlil.lengthCos > _dsl.cosMax) _dsl.cosMax = _dlil.lengthCos;
      if (_dlil.lengthSin > _dsl.sinMax) _dsl.sinMax = _dlil.lengthSin;
    });

    /**
     * Figure out the max axis pixel range after dimension labels are calculated.
     */
    _dsa.start = 0;
    _dsa.stop = 0;
    if (isHorizontal) {
      if (placement === t.LabelPlacement.Before) {
        _dsa.start = _l.padding[0] + _dsl.sinMax + dimLabelStyle.offset;
        _dsa.stop = this.size.h - _l.padding[2];
      } else {
        _dsa.start = _l.padding[0];
        _dsa.stop = this.size.h - _l.padding[2] - _dsl.sinMax - dimLabelStyle.offset;
      }
    } else {
      if (placement === t.LabelPlacement.Before) {
        _dsa.start = _l.padding[3] + _dsl.cosMax + dimLabelStyle.offset;
        _dsa.stop = this.size.w - _l.padding[1];
      } else {
        _dsa.start = _l.padding[3];
        _dsa.stop = this.size.w - _l.padding[1] - _dsl.cosMax - dimLabelStyle.offset;
      }
    }

    /**
     * Go through each axis and figure out the sizes of each axis labels.
     */
    _dsa.maxTicks = (_dsa.stop - _dsa.start) / CONFIG.TICK_DISTANCE;
    _dsa.scale = new NiceScale(_dsa.maxTicks);
    _dsa.labelFactor = axesLabelStyle.placement === t.LabelPlacement.Before ? -1 : 1;
    _dsly.totalBoundSpace = 0;
    for (let i = 0; i < dimCount; i++) {
      const _dlia = _.dims.list[i].axes;
      const _dlil = _.dims.list[i].label;
      const _dlily = _.dims.list[i].layout;

      /**
       * Save scale info for each axis.
       */
      _dsa.scale.setMinMaxValues(-100, 100);
      _dlia.scale = {
        max: _dsa.scale.max,
        min: _dsa.scale.min,
        range: _dsa.scale.range,
        ticks: _dsa.scale.ticks.slice(),
        tickSpacing: _dsa.scale.tickSpacing,
      };

      /**
       * Find the longest axis label.
       */
      _dlia.maxLength = _dsa.scale.ticks.reduce((acc: number, tick: number) => {
        const size = getTextSize(this.ctx, tick.toString());
        console.log('tick', tick, size);
        return Math.max(size.w, acc);
      }, 0);

      /**
       * Figure out where the axis alignment center should be.
       * First, base it on the direction and dimension label placement.
       */
      if (_dlil.lengthCos == null) {
        _dlily.spaceBefore = (isHorizontal ? _dlil.w : _dlil.h) / 2;
        _dlily.spaceAfter = _dlily.spaceBefore;
      } else if (isHorizontal) {
        _dlily.spaceBefore = _dlil.lengthCos < 0 ? -_dlil.lengthCos : 0;
        _dlily.spaceAfter = _dlil.lengthCos > 0 ? _dlil.lengthCos : 0;
      } else {
        _dlily.spaceBefore = _dlil.lengthSin < 0 ? -_dlil.lengthSin : 0;
        _dlily.spaceAfter = _dlil.lengthSin > 0 ? _dlil.lengthSin : 0;
      }

      /**
       * See if axes labels are long enough to shift the axis center.
       */
      if (axesLabelStyle.placement === t.LabelPlacement.Before) {
        _dlily.spaceBefore = Math.max(_dlily.spaceBefore, _dlia.maxLength);
      } else {
        _dlily.spaceAfter = Math.max(_dlily.spaceAfter, _dlia.maxLength);
      }
      _dlily.spaceOffset = _dlily.spaceAfter - _dlily.spaceBefore;

      /**
       * Caclulate the layout positions.
       */
      if (isHorizontal) {
        _dlily.bound = {
          h: this.size.h - _l.padding[0] - _l.padding[2],
          w: _dlily.spaceBefore + _dlily.spaceAfter,
          x: 0,
          y: _l.padding[0],
        };
        _dsly.totalBoundSpace += _dlily.bound.w;
      } else {
        _dlily.bound = {
          h: _dlily.spaceBefore + _dlily.spaceAfter,
          w: this.size.w - _l.padding[1] - _l.padding[3],
          x: _l.padding[3],
          y: 0,
        };
        _dsly.totalBoundSpace += _dlily.bound.h;
      }
    }

    /**
     * Calculate the gap spacing between the dimensions.
     */
    if (isHorizontal) {
      _dsly.gap = dimCount > 1 ? (_l.drawRect.w - _dsly.totalBoundSpace) / (dimCount - 1) : 0;
    } else {
      _dsly.gap = dimCount > 1 ? (_l.drawRect.h - _dsly.totalBoundSpace) / (dimCount - 1) : 0;
    }

    /**
     * Update the dimension bounding position.
     */
    let traversed = isHorizontal ? _l.padding[3] : _l.padding[0];
    for (let i = 0; i < dimCount; i++) {
      const _dlily = _.dims.list[i].layout;

      if (isHorizontal) {
        _dlily.bound.x = traversed;
        _dlily.labelPoint = {
          x: _dlily.spaceBefore,
          y: placement === t.LabelPlacement.Before
            ? _dsa.start - dimLabelStyle.offset - _l.padding[0]
            : _dsa.stop + dimLabelStyle.offset - _l.padding[0],
        };
        _dlily.axisStart = {};
        traversed += _dsly.gap + _dlily.bound.w;
      } else {
        _dlily.bound.y = traversed;
        _dlily.labelPoint = {
          x: placement === t.LabelPlacement.Before
            ? _dsa.start - dimLabelStyle.offset - _l.padding[1]
            : _dsa.stop + dimLabelStyle.offset - _l.padding[1],
          y: _dlily.spaceBefore,
        };
        traversed += _dsly.gap + _dlily.bound.h;
      }
    }
    console.log(_);

    this.drawLine(0, _dsa.start, this.size.w, _dsa.start);
    this.drawLine(0, _dsa.stop, this.size.w, _dsa.stop);
    this.drawLine(_l.padding[3], 0, _l.padding[3], this.size.h);
    this.drawLine(this.size.w - _l.padding[1], 0, this.size.w - _l.padding[1], this.size.h);

    _.dims.list.forEach((dim: any) => {
      const bound = dim.layout.bound;
      const labelPoint = dim.layout.labelPoint;
      this.drawRect(bound.x, bound.y, bound.w, bound.h);
      this.drawCircle(bound.x + labelPoint.x, bound.y + labelPoint.y, 5);
    });
  }

  drawDimensions(): void {
    const direction = this.options.direction;
    const style = this.options.style.dimension.label;
    const placement = style.placement;
    const padding = normalizePadding(this.options.style.padding);

    this.ctx.save();
    this.ctx.font = getFont(style.font);
    this.ctx.textBaseline = 'middle';

    // console.log('labelInfo', labelInfo);
    // console.log('maxLabelSin', maxLabelSin);
    // const dimensionCount = this.dimensions.length;
    // const dimensionWidth = (this.size.w - padding[1] - padding[3]) / dimensionCount;
    this.ctx.textAlign = 'right';
    this.ctx.fillText('this is a long test', 100, 0);

    this.ctx.restore();
  }

  setSize(w: number, h: number): void {
    this.canvas.width = w;
    this.canvas.height = h;
    this.size = { h, w };
  }

  drawCircle(x: number, y: number, radius: number): void {
    this.ctx.strokeStyle = 'blue';
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(x + radius, y);
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  drawLine(x0: number, y0: number, x1: number, y1: number): void {
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(x0, y0);
    this.ctx.lineTo(x1, y1);
    this.ctx.stroke();
  }

  drawRect(x: number, y: number, w: number, h: number): void {
    this.ctx.strokeStyle = 'green';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, w, h);
  }
}

export default Hermes;
