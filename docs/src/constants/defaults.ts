import Hermes from 'hermes-parallel-coordinates';

const tester = Hermes.getTester();

export const DEFAULT_DIMENSIONS = tester.generateDimensions(10, false);
export const DEFAULT_DIMENSIONS_STRING = JSON.stringify(DEFAULT_DIMENSIONS, undefined, 2);

export const DEFAULT_DATA = tester.generateData(DEFAULT_DIMENSIONS, 500, true, {
  includeNaN: 0.1,
  includeNegativeInfinity: 0.1,
  includePositiveInfinity: 0.1,
});
export const DEFAULT_DATA_STRING = JSON.stringify(DEFAULT_DATA, undefined, 2);
