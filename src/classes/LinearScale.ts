import { Primitive } from '../types';
import { isNumber } from '../utils/data';
import { readableTick } from '../utils/string';

import NiceScale from './NiceScale';

class LinearScale extends NiceScale {
  public percentToValue(percent: number): number {
    const min = this.dataOnEdge ? this.minValue : this.min;
    const max = this.dataOnEdge ? this.maxValue : this.max;
    return (this.reverse ? 1 - percent : percent) * (max - min) + min;
  }

  public posToValue(pos: number): number {
    const min = this.dataOnEdge ? this.minValue : this.min;
    const max = this.dataOnEdge ? this.maxValue : this.max;
    return (pos / this.axisLength) * (max - min) + min;
  }

  public valueToPercent(value: Primitive): number {
    if (!isNumber(value)) return 0;
    const min = this.dataOnEdge ? this.minValue : this.min;
    const max = this.dataOnEdge ? this.maxValue : this.max;
    const percent = (value - min) / (max - min);
    return this.reverse ? 1 - percent : percent;
  }

  public valueToPos(value: Primitive): number {
    return this.valueToPercent(value) * this.axisLength;
  }

  protected calculate(): void {
    this.range = this.niceNum(this.maxValue - this.minValue, false);
    this.tickSpacing = this.niceNum(this.range / this.maxTicks, true);
    this.min = Math.floor(this.minValue / this.tickSpacing) * this.tickSpacing;
    this.max = Math.ceil(this.maxValue / this.tickSpacing) * this.tickSpacing;

    /**
     * Generate ticks based on min, max and tick spacing.
     * Due to rounding errors, the final tick can get cut off if
     * traversing from `min` to `max` with fractional `tickSpacing`.
     * Instead pre-calculate number of ticks and calculate accordingly.
     */
    const count = Math.round((this.max - this.min) / this.tickSpacing);
    this.ticks = [];
    this.tickLabels = [];
    for (let i = 0; i <= count; i++) {
      let tick = i * this.tickSpacing + this.min;
      if (this.dataOnEdge && i === 0) tick = this.minValue;
      if (this.dataOnEdge && i === count) tick = this.maxValue;
      this.ticks.push(tick);

      let tickLabel = readableTick(tick);
      if (this.dataOnEdge && [ 0, count ].includes(i)) tickLabel = `*${tickLabel}`;
      this.tickLabels.push(tickLabel);
    }

    // Calculate tick positions based on axis length and ticks.
    this.tickPos = this.ticks.map(tick => this.valueToPos(tick));
  }
}

export default LinearScale;
