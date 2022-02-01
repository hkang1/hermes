import { Primitive } from '../types';
import { isNumber } from '../utils/data';
import { readableTick } from '../utils/string';

import NiceScale from './NiceScale';

class LinearScale extends NiceScale {
  public valueToPos(value: Primitive): number {
    return this.valueToPercent(value) * this.axisLength;
  }

  public posToValue(pos: number): number {
    const min = this.ticks[0];
    const max = this.ticks[this.ticks.length - 1];
    return (pos / this.axisLength) * (max - min) + min;
  }

  public valueToPercent(value: Primitive): number {
    if (!isNumber(value)) return 0;
    const min = this.ticks[0];
    const max = this.ticks[this.ticks.length - 1];
    return (value - min) / (max - min);
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
      const tick = i * this.tickSpacing + this.min;
      this.ticks.push(tick);
      this.tickLabels.push(readableTick(tick));
    }

    // Calculate tick positions based on axis length and ticks.
    const offset = this.axisLength / (this.ticks.length - 1);
    this.tickPos = [];
    for (let i = 0; i < this.ticks.length; i++) {
      this.tickPos.push(i * offset);
    }
  }
}

export default LinearScale;
