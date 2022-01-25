
import { Primitive } from '../types';
import { value2str } from '../utils/string';
import NiceScale from './NiceScale';

class CategoricalScale extends NiceScale {
  constructor(categories: Primitive[] = []) {
    super(0, 0);
    this.tickLabels = categories.map(category => value2str(category));
  }

  public valueToPos(value: Primitive): number {
    const stringValue = value2str(value);
    const index = this.tickLabels.findIndex(label => label === stringValue);
    if (index !== -1) return this.tickPos[index];
    return 0;
  }

  protected calculate() {
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
