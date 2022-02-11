/**
 * NiceScale solves the problem of generating human friendly ticks for chart axes.
 * Normal generative tick techniques make tick marks that jarring for the human to read.
 *
 * https://stackoverflow.com/questions/8506881/nice-label-algorithm-for-charts-with-minimum-ticks
 */

import { Primitive } from '../types';

export const DEFAULT_DATA_ON_EDGE = true;

const MIN_TICK_DISTANCE = 50;

abstract class NiceScale {
  public max: number;
  public min: number;
  public range = 0;
  public tickLabels: string[] = [];
  public tickPos: number[] = [];
  public ticks: number[] = [];
  public tickPadding = 0;
  public tickSpacing = 0;
  protected axisLength = 1;
  protected maxTicks = 1;

  /**
   * Instantiates a new instance of the NiceScale class.
   *
   * @param minValue the minimum data point on the axis
   * @param maxValue the maximum data point on the axis
   * @param maxTicks the maximum number of tick marks for the axis
   */
  constructor(
    protected minValue: number,
    protected maxValue: number,
    protected dataOnEdge = DEFAULT_DATA_ON_EDGE,
  ) {
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.max = maxValue;
    this.min = minValue;
  }

  public setAxisLength(axisLength: number): void {
    this.axisLength = axisLength;
    this.maxTicks = axisLength / MIN_TICK_DISTANCE;
    this.calculate();
  }

  public setMinMaxValues(minValue: number, maxValue: number): void {
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.calculate();
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
  protected niceNum(range: number, round: boolean): number {
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

  /**
   * Convert the axis % position to axis value.
   */
  public abstract percentToValue(percent: number): Primitive;

  /**
   * Convert the axis position to axis value.
   */
  public abstract posToValue(pos: number): Primitive;

  /**
   * Convert value into a position on the axis based on the axis length.
   */
  public abstract valueToPos(value: number): number;

  /**
    * Convert value into a percent of the min / max range.
    */
  public abstract valueToPercent(value: number): number;

  /**
   * Calculate and update values for tick spacing and nice
   * minimum and maximum data points on the axis.
   */
  protected abstract calculate(): void;
}

export default NiceScale;
