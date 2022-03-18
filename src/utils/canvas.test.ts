import { getContext } from 'test/utils';

import * as DEFAULT from '../defaults';
import * as t from '../types';

import * as utils from './canvas';

const TEXT = 'The fox jumped over the lazy fox.';

describe('canvas utilities', () => {
  let ctx: CanvasRenderingContext2D;

  describe('drawBoundary', () => {
    const boundary: t.Boundary = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 50 },
      { x: 0, y: 50 },
    ];

    beforeEach(() => {
      ctx = getContext();
    });

    it('should not draw fill or stroke if fillStyle and strokeStyle are not provided', () => {
      utils.drawBoundary(ctx, boundary);
      expect(ctx.beginPath).not.toHaveBeenCalled();
      expect(ctx.moveTo).not.toHaveBeenCalled();
      expect(ctx.lineTo).not.toHaveBeenCalled();
      expect(ctx.closePath).not.toHaveBeenCalled();
    });

    it('should save and restore context for each draw', () => {
      utils.drawBoundary(ctx, boundary);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.save).toHaveBeenCalledBefore(ctx.restore as jest.Mock);
    });

    it('should draw boundary with fillStyle', () => {
      utils.drawBoundary(ctx, boundary, { fillStyle: DEFAULT.FILL_STYLE });
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalled();
      expect(ctx.closePath).toHaveBeenCalled();
    });

    it('should draw boundary with strokeStyle', () => {
      utils.drawBoundary(ctx, boundary, { strokeStyle: DEFAULT.STROKE_STYLE });
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalled();
      expect(ctx.closePath).toHaveBeenCalled();
    });

    it('should draw boundary with all styles', () => {
      utils.drawBoundary(ctx, boundary, {
        fillStyle: DEFAULT.FILL_STYLE,
        lineCap: DEFAULT.LINE_CAP,
        lineDashOffset: DEFAULT.LINE_DASH_OFFSET,
        lineJoin: DEFAULT.LINE_JOIN,
        lineWidth: DEFAULT.LINE_WIDTH,
        miterLimit: DEFAULT.MITER_LIMIT,
        strokeStyle: DEFAULT.STROKE_STYLE,
      });
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });
  });

  describe('drawCircle', () => {
    const x = 50;
    const y = 50;
    const radius = 10;

    beforeEach(() => {
      ctx = getContext();
    });

    it('should not draw fill or stroke if fillStyle and strokeStyle are not provided', () => {
      utils.drawCircle(ctx, x, y, radius);
      expect(ctx.beginPath).not.toHaveBeenCalled();
      expect(ctx.arc).not.toHaveBeenCalled();
      expect(ctx.fill).not.toHaveBeenCalled();
      expect(ctx.stroke).not.toHaveBeenCalled();
    });

    it('should save and restore context for each draw', () => {
      utils.drawCircle(ctx, x, y, radius);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.save).toHaveBeenCalledBefore(ctx.restore as jest.Mock);
    });

    it('should draw circle with fillStyle', () => {
      utils.drawCircle(ctx, x, y, radius, { fillStyle: DEFAULT.FILL_STYLE });
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.arc).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('should draw circle with strokeStyle', () => {
      utils.drawCircle(ctx, x, y, radius, { strokeStyle: DEFAULT.STROKE_STYLE });
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.arc).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('should draw circle with all styles', () => {
      utils.drawCircle(ctx, x, y, radius, {
        fillStyle: DEFAULT.FILL_STYLE,
        lineCap: DEFAULT.LINE_CAP,
        lineDashOffset: DEFAULT.LINE_DASH_OFFSET,
        lineJoin: DEFAULT.LINE_JOIN,
        lineWidth: DEFAULT.LINE_WIDTH,
        miterLimit: DEFAULT.MITER_LIMIT,
        strokeStyle: DEFAULT.STROKE_STYLE,
      });
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.arc).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });
  });

  describe('drawData', () => {
    const data = [ { x: 10, y: 10 }, { x: 20, y: 20 }, { x: 30, y: 25 } ];
    const defaultPathOptions = { options: {}, type: t.PathType.Straight };

    it('should not draw anything with less than 2 data points', () => {
      ctx = getContext();
      utils.drawData(ctx, [], true, defaultPathOptions);
      expect(ctx.save).not.toHaveBeenCalled();
      expect(ctx.beginPath).not.toHaveBeenCalled();
      expect(ctx.lineTo).not.toHaveBeenCalled();
      expect(ctx.bezierCurveTo).not.toHaveBeenCalled();
      expect(ctx.stroke).not.toHaveBeenCalled();
      expect(ctx.restore).not.toHaveBeenCalled();
    });

    it('should draw line with all styles', () => {
      ctx = getContext();
      utils.drawData(ctx, data, true, defaultPathOptions, {
        lineCap: DEFAULT.LINE_CAP,
        lineDashOffset: DEFAULT.LINE_DASH_OFFSET,
        lineJoin: DEFAULT.LINE_JOIN,
        lineWidth: DEFAULT.LINE_WIDTH,
        miterLimit: DEFAULT.MITER_LIMIT,
        strokeStyle: DEFAULT.STROKE_STYLE,
      });
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalled();
      expect(ctx.bezierCurveTo).not.toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    describe('straight path type', () => {
      const pathOptions = { options: {}, type: t.PathType.Straight };

      beforeEach(() => {
        ctx = getContext();
      });

      it('should save and restore context for each draw', () => {
        utils.drawData(ctx, data, true, pathOptions);
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
        expect(ctx.save).toHaveBeenCalledBefore(ctx.restore as jest.Mock);
      });

      it('should draw data lines horizontally', () => {
        utils.drawData(ctx, data, true, pathOptions);
        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.lineTo).toHaveBeenCalled();
        expect(ctx.bezierCurveTo).not.toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
      });

      it('should draw data lines vertically', () => {
        utils.drawData(ctx, data, false, pathOptions);
        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.lineTo).toHaveBeenCalled();
        expect(ctx.bezierCurveTo).not.toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
      });
    });

    describe('bezier curve path type', () => {
      const pathOptions = {
        options: { bezierFactor: undefined },
        type: t.PathType.Bezier,
      };

      beforeEach(() => {
        ctx = getContext();
      });

      it('should save and restore context for each draw', () => {
        utils.drawData(ctx, data, true, pathOptions);
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
        expect(ctx.save).toHaveBeenCalledBefore(ctx.restore as jest.Mock);
      });

      it('should draw data lines horizontally', () => {
        utils.drawData(ctx, data, true, pathOptions);
        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.lineTo).not.toHaveBeenCalled();
        expect(ctx.bezierCurveTo).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
      });

      it('should draw data lines vertically', () => {
        utils.drawData(ctx, data, false, pathOptions);
        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.lineTo).not.toHaveBeenCalled();
        expect(ctx.bezierCurveTo).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
      });

      it('should draw data line with different bezier factor', () => {
        utils.drawData(ctx, data, false, { ...pathOptions, options: { bezierFactor: 0.1 } });
        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.lineTo).not.toHaveBeenCalled();
        expect(ctx.bezierCurveTo).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
      });
    });
  });

  describe('drawLine', () => {
    const x0 = 10;
    const y0 = 5;
    const x1 = 20;
    const y1 = 15;

    beforeEach(() => {
      ctx = getContext();
    });

    it('should save and restore context for each draw', () => {
      utils.drawLine(ctx, x0, y0, x1, y1);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.save).toHaveBeenCalledBefore(ctx.restore as jest.Mock);
    });

    it('should draw line without style', () => {
      utils.drawLine(ctx, x0, y0, x1, y1);
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('should draw line with all styles', () => {
      utils.drawLine(ctx, x0, y0, x1, y1, {
        lineCap: DEFAULT.LINE_CAP,
        lineDashOffset: DEFAULT.LINE_DASH_OFFSET,
        lineJoin: DEFAULT.LINE_JOIN,
        lineWidth: DEFAULT.LINE_WIDTH,
        miterLimit: DEFAULT.MITER_LIMIT,
        strokeStyle: DEFAULT.STROKE_STYLE,
      });
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });
  });

  describe('drawRect', () => {
    const x = 10;
    const y = 5;
    const w = 20;
    const h = 15;

    beforeEach(() => {
      ctx = getContext();
    });

    it('should not draw fill or stroke if fillStyle and strokeStyle are not provided', () => {
      utils.drawRect(ctx, x, y, w, h);
      expect(ctx.fillRect).not.toHaveBeenCalled();
      expect(ctx.strokeRect).not.toHaveBeenCalled();
    });

    it('should save and restore context for each draw', () => {
      utils.drawRect(ctx, x, y, w, h);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.save).toHaveBeenCalledBefore(ctx.restore as jest.Mock);
    });

    it('should draw rectangle without corner radius', () => {
      utils.drawRect(ctx, x, y, w, h, { fillStyle: DEFAULT.FILL_STYLE });
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('should draw rectangle with all styles', () => {
      utils.drawRect(ctx, x, y, w, h, {
        cornerRadius: 15,
        fillStyle: DEFAULT.FILL_STYLE,
        lineCap: DEFAULT.LINE_CAP,
        lineDashOffset: DEFAULT.LINE_DASH_OFFSET,
        lineJoin: DEFAULT.LINE_JOIN,
        lineWidth: DEFAULT.LINE_WIDTH,
        miterLimit: DEFAULT.MITER_LIMIT,
        strokeStyle: DEFAULT.STROKE_STYLE,
      });
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalled();
      expect(ctx.quadraticCurveTo).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });
  });

  describe('drawRoundedRect', () => {
    it('should draw rounded rectangle', () => {
      ctx = getContext();
      utils.drawRoundedRect(ctx, 0, 0, 100, 50, 5);
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalledTimes(4);
      expect(ctx.quadraticCurveTo).toHaveBeenCalledTimes(4);
      expect(ctx.closePath).toHaveBeenCalled();
    });
  });

  describe('drawText', () => {
    const x = 10;
    const y = 5;
    const rad = Math.PI / 4;

    beforeEach(() => {
      ctx = getContext();
    });

    it('should not draw fill or stroke if fillStyle and strokeStyle are not provided', () => {
      utils.drawText(ctx, TEXT, x, y, rad);
      expect(ctx.fillRect).not.toHaveBeenCalled();
      expect(ctx.strokeRect).not.toHaveBeenCalled();
    });

    it('should save and restore context for each draw', () => {
      utils.drawText(ctx, TEXT, x, y, rad);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.save).toHaveBeenCalledBefore(ctx.restore as jest.Mock);
    });

    it('should not rotate if rotate is not needed', () => {
      utils.drawText(ctx, TEXT, x, y, 0, { fillStyle: DEFAULT.FILL_STYLE });
      expect(ctx.translate).not.toHaveBeenCalled();
      expect(ctx.rotate).not.toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('should rotate text', () => {
      utils.drawText(ctx, TEXT, x, y, rad, { fillStyle: DEFAULT.FILL_STYLE });
      expect(ctx.translate).toHaveBeenCalled();
      expect(ctx.rotate).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('should draw text with strokeStyle', () => {
      utils.drawText(ctx, TEXT, x, y, rad, { strokeStyle: DEFAULT.STROKE_STYLE });
      expect(ctx.strokeText).toHaveBeenCalled();
    });

    it('should draw text with fillStyle', () => {
      utils.drawText(ctx, TEXT, x, y, rad, { fillStyle: DEFAULT.FILL_STYLE });
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('should draw text with all styles', () => {
      utils.drawText(ctx, TEXT, x, y, rad, {
        fillStyle: DEFAULT.FILL_STYLE,
        lineCap: DEFAULT.LINE_CAP,
        lineDashOffset: DEFAULT.LINE_DASH_OFFSET,
        lineJoin: DEFAULT.LINE_JOIN,
        lineWidth: DEFAULT.LINE_WIDTH,
        miterLimit: DEFAULT.MITER_LIMIT,
        strokeStyle: DEFAULT.STROKE_STYLE,
      });
      expect(ctx.strokeText).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalled();
    });
  });

  describe('getTextBoundary', () => {
    const x = 5;
    const y = 10;
    const w = 20;
    const h = 30;
    const rad = Math.PI / 4;

    it('should get text boundary', () => {
      const boundary = utils.getTextBoundary(x, y, w, h);
      expect(boundary).toStrictEqual([
        { x: 5, y: 10 }, { x: 25, y: 10 }, { x: 25, y: 40 }, { x: 5, y: 40 },
      ]);
    });

    it('should get text boundary with rotation', () => {
      const boundary = utils.getTextBoundary(x, y, w, h, rad);
      expect(boundary).toStrictEqual([
        { x: 5, y: 10 },
        { x: 19.14213562373095, y: -4.142135623730949 },
        { x: 40.35533905932738, y: 17.071067811865476 },
        { x: 26.213203435596423, y: 31.213203435596427 },
      ]);
    });

    it('should get text boundary with offset', () => {
      const boundary = utils.getTextBoundary(x, y, w, h, rad, 10, -5);
      expect(boundary).toStrictEqual([
        { x: 8.535533905932738, y: -0.6066017177982133 },
        { x: 22.67766952966369, y: -14.74873734152916 },
        { x: 43.890872965260115, y: 6.464466094067266 },
        { x: 29.74873734152916, y: 20.606601717798213 },
      ]);
    });

    it('should get text boundary with padding', () => {
      const boundary = utils.getTextBoundary(x, y, w, h, rad, 0, 0, 10);
      expect(boundary).toStrictEqual([
        { x: -9.142135623730951, y: 10 },
        { x: 19.14213562373095, y: -18.2842712474619 },
        { x: 54.49747468305833, y: 17.07106781186548 },
        { x: 26.213203435596423, y: 45.35533905932738 },
      ]);
    });
  });

  describe('getTextSize', () => {
    it('should return text size with default font', () => {
      ctx = getContext();
      const size = utils.getTextSize(ctx, TEXT);
      expect(ctx.measureText).toHaveBeenCalled();
      expect(size.w).toBeDefined();
      expect(size.h).toBeDefined();
    });

    it('should return text size with custom font', () => {
      ctx = getContext();
      const font = 'bold 14px serif';
      const size = utils.getTextSize(ctx, TEXT, font);
      expect(ctx.measureText).toHaveBeenCalled();
      expect(size.w).toBeDefined();
      expect(size.h).toBeDefined();
    });
  });

  describe('normalizePadding', () => {
    it.each`
      padding           | devicePixelRatio | expected
      ${[ 1, 2, 3, 4 ]} | ${1}             | ${[ 1, 2, 3, 4 ]}
      ${[ 1, 2, 3, 4 ]} | ${2}             | ${[ 1.5, 3, 4.5, 6 ]}
      ${[ 1, 2, 3, 4 ]} | ${3}             | ${[ 1.75, 3.5, 5.25, 7 ]}
      ${[ 1, 2 ]}       | ${1}             | ${[ 1, 2, 1, 2 ]}
      ${[ 1, 2 ]}       | ${2}             | ${[ 1.5, 3, 1.5, 3 ]}
      ${[ 1, 2 ]}       | ${3}             | ${[ 1.75, 3.5, 1.75, 3.5 ]}
      ${3}              | ${1}             | ${[ 3, 3, 3, 3 ]}
      ${3}              | ${2}             | ${[ 4.5, 4.5, 4.5, 4.5 ]}
      ${3}              | ${3}             | ${[ 5.25, 5.25, 5.25, 5.25 ]}
    `(
      'should normalize padding with various devicePixelRatio',
      ({ padding, devicePixelRatio, expected }) => {
        window.devicePixelRatio = devicePixelRatio;
        expect(utils.normalizePadding(padding)).toStrictEqual(expected);
        window.devicePixelRatio = 1;
      },
    );
  });

  describe('normalizeRad', () => {
    it('should return radians for 0 ~ < 2 PI', () => {
      expect(utils.normalizeRad(0)).toBe(0);
      expect(utils.normalizeRad(Math.PI)).toBe(Math.PI);
    });

    it('should normalize radians for >= 2 PI', () => {
      expect(utils.normalizeRad(2 * Math.PI)).toBe(0);
      expect(utils.normalizeRad(3 * Math.PI)).toBe(Math.PI);
    });

    it('should normalize negative radians', () => {
      expect(utils.normalizeRad(-Math.PI)).toBe(Math.PI);
      expect(utils.normalizeRad(-2 * Math.PI)).toBe(0);
    });
  });

  describe('roundPixel', () => {
    it('should round pixels to the nearest half pixel', () => {
      expect(utils.roundPixel(-1.0)).toBe(-0.5);
      expect(utils.roundPixel(-0.75)).toBe(-0.5);
      expect(utils.roundPixel(-0.5)).toBe(-0.5);
      expect(utils.roundPixel(-0.25)).toBe(-0.5);
      expect(utils.roundPixel(0)).toBe(0.5);
      expect(utils.roundPixel(0.25)).toBe(0.5);
      expect(utils.roundPixel(0.5)).toBe(0.5);
      expect(utils.roundPixel(0.75)).toBe(0.5);
      expect(utils.roundPixel(1.0)).toBe(1.5);
    });
  });

  describe('setFont', () => {
    beforeEach(() => {
      ctx = getContext();
    });

    it('should adjust canvas font sizes based on `pixelDeviceRatio`', () => {
      window.devicePixelRatio = 3;
      utils.setFont(ctx, 'normal 12px san-serif');
      expect(ctx.font).toBe('36px san-serif');

      window.devicePixelRatio = 1.5;
      utils.setFont(ctx, 'bold 16px serif');
      expect(ctx.font).toBe('bold 24px serif');
    });

    it('should return the original canvas font when font px is missing', () => {
      utils.setFont(ctx, 'caption');
      expect(ctx.font).toBe('10px sans-serif');
    });
  });
});
