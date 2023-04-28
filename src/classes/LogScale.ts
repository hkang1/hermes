import { EDirection, Primitive } from '../types';
import { isNumber } from '../utils/data';
import { readableTick } from '../utils/string';

import NiceScale from './NiceScale';

export const DEFAULT_LOG_BASE = 10;

const basedLog = (base: number) => (x: number) => {
  return Math.log(x) / Math.log(base);
};

class LogScale extends NiceScale {
  protected log: (x: number) => number;
  protected maxExp: number = Number.NaN;
  protected maxExpExact: number = Number.NaN;
  protected minExp: number = Number.NaN;
  protected minExpExact: number = Number.NaN;

  constructor(
    protected direction: EDirection,
    protected finiteMin: number,
    protected finiteMax: number,
    protected actualMin: number,
    protected actualMax: number,
    protected logBase: number = DEFAULT_LOG_BASE,
    config: { dataOnEdge?: boolean, reverse?: boolean } = {},
  ) {
    super(direction, finiteMin, finiteMax, config);
    this.log = basedLog(logBase);
    this.logBase = logBase;
    this.actualMax = actualMax;
    this.actualMin = actualMin;
  }

  public setLogBase(logBase: number = DEFAULT_LOG_BASE): void {
    this.logBase = logBase;
    this.calculate();
  }

  public percentToValue(percent: number): number {
    if (percent === 0) {
      return this.reverse ? this.actualMax : this.actualMin;
    }
    if (percent === 1) {
      return this.reverse ? this.actualMin : this.actualMax;
    }
    const minExp = this.dataOnEdge ? this.minExpExact : this.minExp;
    const exp = (this.reverse ? 1 - percent : percent) * this.rangeExp() + minExp;
    return this.logBase ** exp;
  }

  public posToValue(pos: number): number {
    return this.percentToValue(pos / this.axisLength);
  }

  public valueToPercent(value: Primitive): number {
    if (!isNumber(value)) return 0;
    const exp = this.log(value);
    const minExp = this.dataOnEdge ? this.minExpExact : this.minExp;
    const maxExp = this.dataOnEdge ? this.maxExpExact : this.maxExp;
    const percent = (exp - minExp) / (maxExp - minExp);
    return this.reverse ? 1 - percent : percent;
  }

  public valueToPos(value: Primitive): number {
    return this.valueToPercent(value) * this.axisLength;
  }

  protected rangeExp(): number {
    return this.dataOnEdge ? this.maxExpExact - this.minExpExact : this.maxExp - this.minExp;
  }

  protected calculate(): void {

    this.log = basedLog(this.logBase);
    this.minExpExact = this.log(this.minValue);
    this.maxExpExact = this.log(this.maxValue);
    this.minExp = Math.floor(this.minExpExact);
    this.maxExp = Math.ceil(this.maxExpExact);

    this.range = this.logBase ** this.maxExp - this.logBase ** this.minExp;
    this.tickSpacing = 1;

    /**
     * For log scale, tick spacing is exp based rather than actual log values.
     * Generate ticks based on `minExp`, `maxExp` and `tickSpacing`.
     * Due to rounding errors, the final tick can get cut off if
     * traversing from `minExp` to `maxExp` with fractional `tickSpacing`.
     * Instead pre-calculate number of ticks and calculate accordingly.
     */
    const count = Math.round((this.maxExp - this.minExp) / this.tickSpacing);
    this.ticks = [];
    this.tickLabels = [];
    for (let i = 0; i <= count; i++) {
      const tickExp = i * this.tickSpacing + this.minExp;
      let tickValue = this.logBase ** tickExp;
      if (this.dataOnEdge && i === 0) tickValue = this.logBase ** this.minExpExact;
      if (this.dataOnEdge && i === count) tickValue = this.logBase ** this.maxExpExact;
      this.ticks.push(tickValue);

      let tickLabel = readableTick(tickValue);
      if (this.dataOnEdge && [ 0, count ].includes(i)) tickLabel = `*${tickLabel}`;
      this.tickLabels.push(tickLabel);
    }

    // Calculate tick positions based on axis length and ticks.
    this.tickPos = this.ticks.map(tick => this.valueToPos(tick));
  }
}

export default LogScale;
