import Hermes from 'hermes-parallel-coordinates';

const tester = Hermes.getTester();

export const DEFAULT_DIMENSIONS = tester.generateDimensions(10, false);
export const DEFAULT_DIMENSIONS_STRING = Hermes.obj2str<Hermes.Dimension[]>(DEFAULT_DIMENSIONS);

export const DEFAULT_DATA = tester.generateData(DEFAULT_DIMENSIONS, 100, true, {
  includeNaN: 0.01,
  includeNegativeInfinity: 0.01,
  includePositiveInfinity: 0.01,
});
export const DEFAULT_DATA_STRING = Hermes.obj2str<Hermes.Data>(DEFAULT_DATA);

export const DEFAULT_CONFIG = {};
