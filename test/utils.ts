export const CLOSE_PRECISION = 8;

export const getContext = (): CanvasRenderingContext2D => {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 400;

  let ctx: CanvasRenderingContext2D | null = null;
  while (ctx === null) {
    ctx = canvas.getContext('2d');
  }

  return ctx;
};
