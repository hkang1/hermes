import * as DEFAULT from '../defaults';
import * as t from '../types';

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  style: t.StyleShape = {},
): void => {
  ctx.save();

  if (ctx.fillStyle) {
    ctx.fillStyle = style?.fillStyle || '';
    ctx.moveTo(x + radius, y);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
  }
  if (ctx.strokeStyle) {
    ctx.lineCap = style.lineCap || DEFAULT.LINE_CAP;
    ctx.lineDashOffset = style.lineDashOffset || DEFAULT.LINE_DASH_OFFSET;
    ctx.lineJoin = style.lineJoin || DEFAULT.LINE_JOIN;
    ctx.lineWidth = style.lineWidth || DEFAULT.LINE_WIDTH;
    ctx.miterLimit = style.miterLimit || DEFAULT.MITER_LIMIT;
    ctx.strokeStyle = style.strokeStyle || DEFAULT.STROKE_STYLE;
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
  for (let i = 1; i < data.length; i++) ctx.lineTo(data[i].x, data[i].y);
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
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();

  ctx.restore();
};

export const drawRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  style: t.StyleShape = {},
): void => {
  ctx.save();

  if (style.fillStyle) {
    ctx.fillStyle = style.fillStyle || DEFAULT.FILL_STYLE;
    ctx.fillRect(x, y, w, h);
  }
  if (style.strokeStyle) {
    ctx.lineCap = style.lineCap || DEFAULT.LINE_CAP;
    ctx.lineDashOffset = style.lineDashOffset || DEFAULT.LINE_DASH_OFFSET;
    ctx.lineJoin = style.lineJoin || DEFAULT.LINE_JOIN;
    ctx.lineWidth = style.lineWidth || DEFAULT.LINE_WIDTH;
    ctx.miterLimit = style.miterLimit || DEFAULT.MITER_LIMIT;
    ctx.strokeStyle = style.strokeStyle || DEFAULT.STROKE_STYLE;
    ctx.strokeRect(x, y, w, h);
  }

  ctx.restore();
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

  ctx.save();

  ctx.direction = style.direction || DEFAULT.DIRECTION;
  ctx.font = style.font || DEFAULT.FONT;
  ctx.textAlign = style.textAlign || (inwards ? 'right' : 'left');
  ctx.textBaseline = style.textBaseline || DEFAULT.TEXT_BASELINE;

  ctx.translate(x, y);
  ctx.rotate(-rad - (inwards ? Math.PI : 0));
  ctx.translate(-x, -y);

  if (style.fillStyle) {
    ctx.fillStyle = style.fillStyle || DEFAULT.FILL_STYLE;
    ctx.fillText(text, x, y);
  }
  if (style.strokeStyle) {
    ctx.lineCap = style.lineCap || DEFAULT.LINE_CAP;
    ctx.lineDashOffset = style.lineDashOffset || DEFAULT.LINE_DASH_OFFSET;
    ctx.lineJoin = style.lineJoin || DEFAULT.LINE_JOIN;
    ctx.lineWidth = style.lineWidth || DEFAULT.LINE_WIDTH;
    ctx.miterLimit = style.miterLimit || DEFAULT.MITER_LIMIT;
    ctx.strokeStyle = style.strokeStyle || DEFAULT.STROKE_STYLE;
    ctx.strokeText(text, x, y);
  }

  ctx.restore();
};

export const getFont = (font: t.Font): string => {
  const style = font.style || t.FontStyle.Normal;
  const weight = font.weight || t.FontWeight.Normal;
  const size = `${font.size || 14}px`;
  const family = font.family || 'sans-serif';
  return [ style, weight, size, family ].join(' ');
};

export const getTextSize = (ctx: CanvasRenderingContext2D, text: string, font: t.Font): t.Size => {
  ctx.font = getFont(font);
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
