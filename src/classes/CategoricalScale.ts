import { EDirection, Primitive } from '../types';
import { value2str } from '../utils/string';

import NiceScale from './NiceScale';

class CategoricalScale extends NiceScale {
  constructor(
    protected direction: EDirection,
    protected categories: Primitive[] = [],
    config: { dataOnEdge?: boolean, reverse?: boolean } = {},
  ) {
    super(direction, 0, 0, config);
    this.tickLabels = this.categories.map(category => value2str(category));
  }

  public percentToValue(percent: number): Primitive {
    return this.posToValue((this.reverse ? 1 - percent : percent) * this.axisLength);
  }

  public posToValue(pos: number): Primitive {
    let distance = Infinity;
    let value: Primitive = Number.NaN;
    for (let i = 0; i < this.tickPos.length; i++) {
      const tickPos = this.tickPos[i];
      const dp = Math.abs(pos - tickPos);
      if (dp < distance) {
        distance = dp;
        value = this.categories[i];
      }
    }
    return value;
  }

  public valueToPercent(value: Primitive): number {
    const stringValue = value2str(value);
    const index = this.tickLabels.findIndex(label => label === stringValue);
    if (index !== -1) {
      const percent = this.tickPos[index] / this.axisLength;
      return this.reverse ? 1 - percent : percent;
    }
    return 0;
  }

  public valueToPos(value: Primitive): number {
    return this.valueToPercent(value) * this.axisLength;
  }

  protected calculate(): void {
    // Calculate tick positions based on axis length and ticks.
    const count = this.tickLabels.length;
    let traversed = 0;
    this.tickSpacing = this.axisLength / (this.dataOnEdge ? count - 1 : count);
    this.tickPos = [];
    for (let i = 0; i < count; i++) {
      if ([ 0, count ].includes(i)) {
        traversed += this.dataOnEdge ? 0 : this.tickSpacing / 2;
      } else {
        traversed += this.tickSpacing;
      }
      this.tickPos.push(traversed);
    }
  }
}

export default CategoricalScale;
