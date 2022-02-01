import { Primitive } from '../types';
import { value2str } from '../utils/string';

import NiceScale from './NiceScale';

class CategoricalScale extends NiceScale {
  constructor(protected categories: Primitive[] = []) {
    super(0, 0);
    this.tickLabels = this.categories.map(category => value2str(category));
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

  public valueToPos(value: Primitive): number {
    const stringValue = value2str(value);
    const index = this.tickLabels.findIndex(label => label === stringValue);
    if (index !== -1) return this.tickPos[index];
    return 0;
  }

  public valueToPercent(value: Primitive): number {
    const stringValue = value2str(value);
    const index = this.tickLabels.findIndex(label => label === stringValue);
    if (index !== -1) return index / this.tickLabels.length;
    return 0;
  }

  protected calculate(): void {
    // Calculate tick positions based on axis length and ticks.
    let traversed = 0;
    this.tickSpacing = this.axisLength / this.tickLabels.length;
    this.tickPos = [];
    for (let i = 0; i < this.tickLabels.length; i++) {
      if (i === 0 || i === this.tickLabels.length) {
        traversed += this.tickSpacing / 2;
      } else {
        traversed += this.tickSpacing;
      }
      this.tickPos.push(traversed);
    }
  }
}

export default CategoricalScale;
