import { Primitive } from '../types';
import { value2str } from '../utils/string';

import NiceScale, { DEFAULT_DATA_ON_EDGE, DEFAULT_REVERSE } from './NiceScale';

class CategoricalScale extends NiceScale {
  constructor(
    protected categories: Primitive[] = [],
    protected dataOnEdge = DEFAULT_DATA_ON_EDGE,
    protected reverse = DEFAULT_REVERSE,
  ) {
    super(0, 0, dataOnEdge);
    this.tickLabels = this.categories.map(category => value2str(category));
  }

  public percentToValue(percent: number): Primitive {
    return this.posToValue(percent * this.axisLength);
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
    if (index !== -1) return this.tickPos[index] / this.axisLength;
    return 0;
  }

  public valueToPos(value: Primitive): number {
    const stringValue = value2str(value);
    const index = this.tickLabels.findIndex(label => label === stringValue);
    if (index !== -1) return this.tickPos[index];
    return 0;
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
