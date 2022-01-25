import { Primitive } from '../types';
import { isNumber } from '../utils/data';
import { readableTick } from '../utils/string';
import NiceScale from './NiceScale';

class LinearScale extends NiceScale {
  constructor(minValue: number, maxValue: number) {
    super(minValue, maxValue);
  }

  public valueToPos(value: Primitive): number {
    return this.valueToPercent(value) * this.axisLength;
  }

  public valueToPercent(value: Primitive): number {
    if (!isNumber(value)) return 0;
    return (value - this.minValue) / (this.maxValue - this.minValue);
  }

  protected calculate() {
    this.range = this.niceNum(this.maxValue - this.minValue, false);
    this.tickSpacing = this.niceNum(this.range / (this.maxTicks - 1), true);
    this.min = Math.floor(this.minValue / this.tickSpacing) * this.tickSpacing;
    this.max = Math.ceil(this.maxValue / this.tickSpacing) * this.tickSpacing;

    // Generate ticks based on min, max and tick spacing.
    this.ticks = [];
    this.tickLabels = [];
    for (let i = this.min; i <= this.max; i += this.tickSpacing) {
      this.ticks.push(i);
      this.tickLabels.push(readableTick(i));
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
