/**
 * NiceScale solves the problem of generating human friendly ticks for chart axes.
 * Normal generative tick techniques make tick marks that jarring for the human to read.
 *
 * https://stackoverflow.com/questions/8506881/nice-label-algorithm-for-charts-with-minimum-ticks
 */

const DEFAULT_MAX_TICKS = 10;

class NiceScale {
  public max: number;
  public min: number;
  public range: number;
  public ticks: number[];
  public tickSpacing: number;
  private maxTicks: number;
  private maxValue: number;
  private minValue: number;

  /**
   * Instantiates a new instance of the NiceScale class.
   *
   * @param minValue the minimum data point on the axis
   * @param maxValue the maximum data point on the axis
   * @param maxTicks the maximum number of tick marks for the axis
   */
  constructor(maxTicks: number = DEFAULT_MAX_TICKS) {
    this.maxValue = Number.POSITIVE_INFINITY;
    this.minValue = Number.NEGATIVE_INFINITY;
    this.maxTicks = maxTicks;
    this.max = 100;
    this.min = 0;
    this.range = 100;
    this.ticks = [];
    this.tickSpacing = 10;
  }

  /**
   * Sets the minimum and maximum data points for the axis.
   *
   * @param minPoint the minimum data point on the axis
   * @param maxPoint the maximum data point on the axis
   */
  public setMinMaxValues(minValue: number, maxValue: number): void {
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.calculate();
  }

  /**
   * Sets maximum number of tick marks we're comfortable with
   *
   * @param maxTicks the maximum number of tick marks for the axis
   */
  public setMaxTicks(maxTicks: number): void {
    this.maxTicks = maxTicks;
    this.calculate();
  }

  /**
   * Calculate and update values for tick spacing and nice
   * minimum and maximum data points on the axis.
   */
  private calculate() {
    this.range = this.niceNum(this.maxValue - this.minValue, false);
    this.tickSpacing = this.niceNum(this.range / (this.maxTicks - 1), true);
    this.min = Math.floor(this.minValue / this.tickSpacing) * this.tickSpacing;
    this.max = Math.ceil(this.maxValue / this.tickSpacing) * this.tickSpacing;

    // Generate ticks based on min, max and tick spacing.
    this.ticks = [];
    for (let i = this.min; i <= this.max; i += this.tickSpacing) this.ticks.push(i);
  }

  /**
   * Returns a "nice" number approximately equal to range.
   * Rounds the number if round = true
   * Takes the ceiling if round = false.
   *
   * @param range the data range
   * @param round whether to round the result
   * @return a "nice" number to be used for the data range
   */
  private niceNum(range: number, round: boolean): number {
    const exponent = Math.floor(Math.log10(range));   // Exponent of range.
    const fraction = range / 10 ** exponent;          // Fractional part of range.
    let niceFraction: number;                         // Nice, rounded fraction.

    if (round) {
      if (fraction < 1.5) niceFraction = 1;
      else if (fraction < 3) niceFraction = 2;
      else if (fraction < 7) niceFraction = 5;
      else niceFraction = 10;
    } else {
      if (fraction <= 1) niceFraction = 1;
      else if (fraction <= 2) niceFraction = 2;
      else if (fraction <= 5) niceFraction = 5;
      else niceFraction = 10;
    }

    return niceFraction * 10 ** exponent;
  }
}

export default NiceScale;
