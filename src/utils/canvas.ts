import * as t from '../types';

export const drawTextAngled = (
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
  x: number,
  y: number,
  degree: number,
  inwards = false,
): t.Rect => {
  ctx.save();
  ctx.font = font;

  ctx.translate(x, y);

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
export const getTextSize = (ctx: CanvasRenderingContext2D, text: string): t.Size => {
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
