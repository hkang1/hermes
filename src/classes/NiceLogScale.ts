export const DEFAULT_LOG_BASE = 10;

class NiceLogScale {
  public maxExp: number;
  public minExp: number;
  public ticks: number[];
  private logBase: number;
  private maxValue: number;
  private minValue: number;

  constructor(logBase: number = DEFAULT_LOG_BASE) {
    this.logBase = logBase;
    this.maxValue = Number.POSITIVE_INFINITY;
    this.minValue = Number.NEGATIVE_INFINITY;
    this.maxExp = -1;
    this.minExp = -3;
    this.ticks = [];
  }

  public setMinMaxValues(
    minValue: number,
    maxValue: number,
    logBase: number = DEFAULT_LOG_BASE,
  ): void {
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.logBase = logBase;
    this.calculate();
  }

  private calculate() {
    const log = this.logBase === 10 ? Math.log10 : this.logBase === 2 ? Math.log2 : Math.log;
    const denominator = log === Math.log ? Math.log(this.logBase) : 1;
    this.minExp = Math.floor(log(this.minValue) / denominator);
    this.maxExp = Math.ceil(log(this.maxValue) / denominator);
    this.ticks = [];
    for (let i = this.minExp; i <= this.maxExp; i++) this.ticks.push(i);
  }
}

export default NiceLogScale;
