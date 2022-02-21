import { Primitive } from '../types';
import { isNumber } from '../utils/data';
import { readableTick } from '../utils/string';

import NiceScale, { DEFAULT_DATA_ON_EDGE } from './NiceScale';

export const DEFAULT_LOG_BASE = 10;

class LogScale extends NiceScale {
  protected denominator: number;
  protected log: (x: number) => number;
  protected maxExp: number = Number.NaN;
  protected maxExpExact: number = Number.NaN;
  protected minExp: number = Number.NaN;
  protected minExpExact: number = Number.NaN;

  constructor(
    protected minValue: number,
    protected maxValue: number,
    protected logBase: number = DEFAULT_LOG_BASE,
    protected dataOnEdge = DEFAULT_DATA_ON_EDGE,
  ) {
    super(minValue, maxValue, dataOnEdge);
    this.denominator = 1;
    this.log = Math.log;
    this.logBase = logBase;
  }

  public setLogBase(logBase: number = DEFAULT_LOG_BASE): void {
    this.logBase = logBase;
    this.calculate();
  }

  public percentToValue(percent: number): number {
    const minExp = this.dataOnEdge ? this.minExpExact : this.minExp;
    const exp = percent * this.rangeExp() + minExp;
    return this.logBase ** exp;
  }

  public posToValue(pos: number): number {
    const minExp = this.dataOnEdge ? this.minExpExact : this.minExp;
    const exp = (pos / this.axisLength) * this.rangeExp() + minExp;
    return this.logBase ** exp;
  }

  public valueToPos(value: Primitive): number {
    return this.valueToPercent(value) * this.axisLength;
  }

  public valueToPercent(value: Primitive): number {
    if (!isNumber(value)) return 0;
    const exp = this.log(value) / this.denominator;
    if (this.dataOnEdge) return (exp - this.minExpExact) / (this.maxExpExact - this.minExpExact);
    return (exp - this.minExp) / (this.maxExp - this.minExp);
  }

  protected rangeExp(): number {
    return this.dataOnEdge ? this.maxExpExact - this.minExpExact : this.maxExp - this.minExp;
  }

  protected calculate(): void {
    this.log = this.logBase === 10 ? Math.log10 : this.logBase === 2 ? Math.log2 : Math.log;
    this.denominator = this.log === Math.log ? Math.log(this.logBase) : 1;

    this.minExpExact = this.log(this.minValue) / this.denominator;
    this.maxExpExact = this.log(this.maxValue) / this.denominator;
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
