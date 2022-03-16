import * as DEFAULT from '../defaults';
import * as t from '../types';

import { rotatePoint } from './math';

export const drawBoundary = (
  ctx: CanvasRenderingContext2D,
  boundary: t.Boundary,
  style: t.StyleShape = {},
): void => {
  ctx.save();

  if (style.fillStyle) {
    ctx.fillStyle = style.fillStyle;
    ctx.beginPath();
    ctx.moveTo(boundary[0].x, boundary[0].y);
    for (let i = 1; i < boundary.length; i++) {
      ctx.lineTo(boundary[i].x, boundary[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }
  if (style.strokeStyle) {
    ctx.lineCap = style.lineCap || DEFAULT.LINE_CAP;
    ctx.lineDashOffset = style.lineDashOffset || DEFAULT.LINE_DASH_OFFSET;
    ctx.lineJoin = style.lineJoin || DEFAULT.LINE_JOIN;
    ctx.lineWidth = style.lineWidth || DEFAULT.LINE_WIDTH;
    ctx.miterLimit = style.miterLimit || DEFAULT.MITER_LIMIT;
    ctx.strokeStyle = style.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(boundary[0].x, boundary[0].y);
    for (let i = 1; i < boundary.length; i++) {
      ctx.lineTo(boundary[i].x, boundary[i].y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  ctx.restore();
};

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  style: t.StyleShape = {},
): void => {
  ctx.save();

  if (style.fillStyle) {
    ctx.fillStyle = style?.fillStyle;
    ctx.moveTo(x + radius, y);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
  }
  if (style.strokeStyle) {
    ctx.lineCap = style.lineCap || DEFAULT.LINE_CAP;
    ctx.lineDashOffset = style.lineDashOffset || DEFAULT.LINE_DASH_OFFSET;
    ctx.lineJoin = style.lineJoin || DEFAULT.LINE_JOIN;
    ctx.lineWidth = style.lineWidth || DEFAULT.LINE_WIDTH;
    ctx.miterLimit = style.miterLimit || DEFAULT.MITER_LIMIT;
    ctx.strokeStyle = style.strokeStyle;
    ctx.moveTo(x + radius, y);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }

  ctx.restore();
};

export const drawData = (
  ctx: CanvasRenderingContext2D,
  data: t.Point[],
  isHorizontal: boolean,
  path: t.PathOptions,
  style: t.StyleLine = {},
): void => {
  if (data.length < 2) return;

  ctx.save();

  ctx.lineCap = style.lineCap || DEFAULT.LINE_CAP;
  ctx.lineDashOffset = style.lineDashOffset || DEFAULT.LINE_DASH_OFFSET;
  ctx.lineJoin = style.lineJoin || DEFAULT.LINE_JOIN;
  ctx.lineWidth = style.lineWidth || DEFAULT.LINE_WIDTH;
  ctx.miterLimit = style.miterLimit || DEFAULT.MITER_LIMIT;
  ctx.strokeStyle = style.strokeStyle || DEFAULT.STROKE_STYLE;

  ctx.beginPath();
  ctx.moveTo(data[0].x, data[0].y);

  const bezierFactor = path.options.bezierFactor ?? DEFAULT.BEZIER_FACTOR;
  for (let i = 1; i < data.length; i++) {
    const [ x1, y1 ] = [ data[i].x, data[i].y ];
    if (path.type === t.PathType.Straight) {
      ctx.lineTo(x1, y1);
    } else if (path.type === t.PathType.Bezier) {
      const [ x0, y0 ] = [ data[i - 1].x, data[i - 1].y ];
      const [ cp0x, cp0y ] = [
        x0 + (isHorizontal ? (x1 - x0) * bezierFactor : 0),
        y0 + (isHorizontal ? 0 : (y1 - y0) * bezierFactor),
      ];
      const [ cp1x, cp1y ] = [
        x1 - (isHorizontal ? (x1 - x0) * bezierFactor : 0),
        y1 - (isHorizontal ? 0 : (y1 - y0) * bezierFactor),
      ];
      ctx.bezierCurveTo(cp0x, cp0y, cp1x, cp1y, x1, y1);
    }
  }
  ctx.stroke();

  ctx.restore();
};

export const drawLine = (
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  style: t.StyleLine = {},
): void => {
  ctx.save();

  ctx.lineCap = style.lineCap || DEFAULT.LINE_CAP;
  ctx.lineDashOffset = style.lineDashOffset || DEFAULT.LINE_DASH_OFFSET;
  ctx.lineJoin = style.lineJoin || DEFAULT.LINE_JOIN;
  ctx.lineWidth = style.lineWidth || DEFAULT.LINE_WIDTH;
  ctx.miterLimit = style.miterLimit || DEFAULT.MITER_LIMIT;
  ctx.strokeStyle = style.strokeStyle || DEFAULT.STROKE_STYLE;

  ctx.beginPath();
  ctx.moveTo(roundPixel(x0), roundPixel(y0));
  ctx.lineTo(roundPixel(x1), roundPixel(y1));
  ctx.stroke();

  ctx.restore();
};

export const drawRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  style: t.StyleRect = {},
): void => {
  ctx.save();

  const rx = roundPixel(x);
  const ry = roundPixel(y);
  const radius = style.cornerRadius || 0;

  if (style.fillStyle) {
    ctx.fillStyle = style.fillStyle;
    if (radius === 0) {
      ctx.fillRect(rx, ry, w, h);
    } else {
      drawRoundedRect(ctx, rx, ry, w, h, radius);
      ctx.fill();
    }
  }
  if (style.strokeStyle) {
    ctx.lineCap = style.lineCap || DEFAULT.LINE_CAP;
    ctx.lineDashOffset = style.lineDashOffset || DEFAULT.LINE_DASH_OFFSET;
    ctx.lineJoin = style.lineJoin || DEFAULT.LINE_JOIN;
    ctx.lineWidth = style.lineWidth || DEFAULT.LINE_WIDTH;
    ctx.miterLimit = style.miterLimit || DEFAULT.MITER_LIMIT;
    ctx.strokeStyle = style.strokeStyle;
    if (radius === 0) {
      ctx.strokeRect(rx, ry, w, h);
    } else {
      drawRoundedRect(ctx, rx, ry, w, h, radius);
      ctx.stroke();
    }
  }

  ctx.restore();
};

export const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,  // Radius
): void => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

export const drawText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  rad: number,
  style: t.StyleText = {},
): void => {
  const normalizedRad = normalizeRad(rad);
  const inwards = normalizedRad > Math.PI / 2 && normalizedRad <= 3 * Math.PI / 2;
  const rotate = -rad - (inwards ? Math.PI : 0);

  ctx.save();

  ctx.font = style.font || DEFAULT.FONT;
  ctx.direction = style.direction || DEFAULT.DIRECTION;
  ctx.textAlign = style.textAlign || (inwards ? 'right' : 'left');
  ctx.textBaseline = style.textBaseline || DEFAULT.TEXT_BASELINE;

  if (rotate % 2 * Math.PI !== 0) {
    ctx.translate(x, y);
    ctx.rotate(rotate);
    ctx.translate(-x, -y);
  }

  if (style.strokeStyle) {
    ctx.lineCap = style.lineCap || DEFAULT.LINE_CAP;
    ctx.lineDashOffset = style.lineDashOffset || DEFAULT.LINE_DASH_OFFSET;
    ctx.lineJoin = style.lineJoin || DEFAULT.LINE_JOIN;
    ctx.lineWidth = style.lineWidth || DEFAULT.LINE_WIDTH;
    ctx.miterLimit = style.miterLimit || DEFAULT.MITER_LIMIT;
    ctx.strokeStyle = style.strokeStyle;
    ctx.strokeText(text, x, y);
  }
  if (style.fillStyle) {
    ctx.fillStyle = style.fillStyle;
    ctx.fillText(text, x, y);
  }

  ctx.restore();
};

export const getTextBoundary = (
  x: number,
  y: number,
  w: number,
  h: number,
  rad?: number,
  offsetX = 0,
  offsetY = 0,
  padding = 0,
): t.Boundary => {
  const x0 = x + offsetX - padding;
  const y0 = y + offsetY - padding;
  const x1 = x + w + offsetX + padding;
  const y1 = y + h + offsetY + padding;
  const boundary: t.Boundary = [
    { x: x0, y: y0 },
    { x: x1, y: y0 },
    { x: x1, y: y1 },
    { x: x0, y: y1 },
  ];

  if (rad != null) {
    const normalizedRad = normalizeRad(rad);
    return boundary.map(point => rotatePoint(
      point.x,
      point.y,
      -normalizedRad,
      x,
      y,
    )) as t.Boundary;
  }

  return boundary;
};

export const getTextSize = (
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string = DEFAULT.FONT,
): t.Size => {
  ctx.font = font;
  const metrics = ctx.measureText(text);
  const w = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
  const h = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  return { h, w };
};

export const normalizePadding = (padding: t.Padding): [ number, number, number, number ] => {
  if (!Array.isArray(padding)) return [ padding, padding, padding, padding ];
  if (padding.length === 2) return [ padding[0], padding[1], padding[0], padding[1] ];
  return padding;
};

export const normalizeRad = (rad: number): number => {
  return (rad + 2 * Math.PI) % (2 * Math.PI);
};

/**
 * To produce crisp lines on canvas, the line coordinates need to sit on the half pixel.
 * https://stackoverflow.com/a/13879402/5402432
 */
export const roundPixel = (x: number): number => {
  return Math.round(x - 0.5) + 0.5;
};
