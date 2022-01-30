import * as t from './types';
declare class Hermes {
    private element;
    private canvas;
    private ctx;
    private resizeObserver;
    private data;
    private dataCount;
    private dimensions;
    private options;
    private size;
    private drag;
    private _?;
    constructor(target: HTMLElement | string, data: t.HermesData, dimensions: t.Dimension[], options?: t.RecursivePartial<t.HermesOptions>);
    static getTester(): any;
    destroy(): void;
    setSize(w: number, h: number): void;
    private calculate;
    private calculateScales;
    private calculateLayout;
    private draw;
    private drawDebugOutline;
    private getDragBound;
    private handleMouseDown;
    private handleMouseMove;
    private handleMouseUp;
}
export default Hermes;
