import * as t from '../types';

const DEFAULT_FILL_STYLE = 'black';
const DEFAULT_LINE_WIDTH = 1;
const DEFAULT_STROKE_STYLE = 'black';

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  style?: t.DrawStyle,
): void => {
  ctx.fillStyle = style?.fillStyle || '';
  ctx.lineWidth = style?.lineWidth || DEFAULT_LINE_WIDTH;
  ctx.strokeStyle = style?.strokeStyle || DEFAULT_STROKE_STYLE;
  ctx.moveTo(x + radius, y);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
};

export const drawLine = (
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  style?: t.DrawStyle,
): void => {
  ctx.lineWidth = style?.lineWidth || DEFAULT_LINE_WIDTH;
  ctx.strokeStyle = style?.strokeStyle || DEFAULT_STROKE_STYLE;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
};

export const drawRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  style?: t.DrawStyle,
): void => {
  ctx.fillStyle = style?.fillStyle || '';
  ctx.lineWidth = style?.lineWidth || DEFAULT_LINE_WIDTH;
  ctx.strokeStyle = style?.strokeStyle || DEFAULT_STROKE_STYLE;
  ctx.strokeRect(x, y, w, h);
};

export const drawTextAngled = (
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
  x: number,
  y: number,
  rad: number,
  style?: t.DrawStyle,
): t.Rect => {
  const normalizedRad = (rad + 2 * Math.PI) % (2 * Math.PI);
  const inwards = normalizedRad > Math.PI / 2 && normalizedRad <= 3 * Math.PI / 2;

  ctx.save();
  ctx.font = font;
  ctx.textAlign = inwards ? 'right' : 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = style?.fillStyle || DEFAULT_FILL_STYLE;

  ctx.translate(x, y);
  ctx.rotate(-rad - (inwards ? Math.PI : 0));
  ctx.translate(-x, -y);
  ctx.fillText(text, x, y);

  ctx.restore();

  return { h: 0, w: 0, x: 0, y: 0 };
};

export const getFont = (font: t.Font): string => {
  const style = font.style || t.FontStyle.Normal;
  const weight = font.weight || t.FontWeight.Normal;
  const size = `${font.size || 14}px`;
  const family = font.family || 'sans-serif';
  return [ style, weight, size, family ].join(' ');
};

export const getTextAlignFromAngle = (rad: number): CanvasTextAlign => {
  const angle = normalizeAngle(rad);
  if (angle > (Math.PI / 2) && angle <= (Math.PI * 3 / 4)) return 'end';
  return 'start';
};

/*
 * The setting of context font is expected to be done outside of this function.
 */
export const getTextSize = (
  ctx: CanvasRenderingContext2D,
  text: string,
  font: t.Font,
): t.Size => {
  ctx.font = getFont(font);
  const metrics = ctx.measureText(text);
  const w = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
  const h = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  return { h, w };
};

export const normalizeAngle = (rad: number): number => {
  const radCapped = rad % (2 * Math.PI);
  return radCapped < 0 ? radCapped + (2 * Math.PI) : radCapped;
};

export const normalizePadding = (padding: t.Padding): [ number, number, number, number ] => {
  if (!Array.isArray(padding)) return [ padding, padding, padding, padding ];
  if (padding.length === 2) return [ padding[0], padding[1], padding[0], padding[1] ];
  return padding;
};
