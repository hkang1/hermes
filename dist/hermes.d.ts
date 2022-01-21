import * as t from './types';
declare class Hermes {
    private element;
    private canvas;
    private ctx;
    private resizeObserver;
    private dimensions;
    private options;
    private size;
    private _;
    constructor(target: HTMLElement | string, dimensions: t.Dimension[], options?: t.RecursivePartial<t.HermesOptions>);
    destroy(): void;
    draw(): void;
    calculate(): void;
    drawDimensions(): void;
    setSize(w: number, h: number): void;
    drawCircle(x: number, y: number, radius: number): void;
    drawLine(x0: number, y0: number, x1: number, y1: number): void;
    drawRect(x: number, y: number, w: number, h: number): void;
}
export default Hermes;
