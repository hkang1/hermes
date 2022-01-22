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
    constructor(target: HTMLElement | string, data: t.HermesData, dimensions: t.Dimension[], options?: t.RecursivePartial<t.HermesOptions>);
    static getTester(): any;
    destroy(): void;
    setSize(w: number, h: number): void;
    private calculate;
    private draw;
    private drawDebugOutline;
}
export default Hermes;
