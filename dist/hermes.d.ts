import * as t from './types';
declare class Hermes {
    private element;
    private canvas;
    private ctx;
    private resizeObserver;
    private dimensions;
    private options;
    private size;
    private _?;
    constructor(target: HTMLElement | string, dimensions: t.Dimension[], options?: t.RecursivePartial<t.HermesOptions>);
    destroy(): void;
    draw(): void;
    calculate(): void;
    setSize(w: number, h: number): void;
}
export default Hermes;
