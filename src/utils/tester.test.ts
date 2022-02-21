import * as utils from './tester';

describe('library testing utility functions', () => {
  describe('generateData', () => {
    const dimCount = 3;
    const dataCount = 10;
    const dimensions = utils.generateDimensions(dimCount, false);

    it('should generate data', () => {
      const data = utils.generateData(dimensions, dataCount);
      expect(Object.keys(data).length).toBe(dimCount);

      Object.values(data).forEach(dimData => {
        expect(dimData.length).toBe(dataCount);
      });
    });
  });

  describe('generateDimensions', () => {
    it('should generate dimensions with defaults', () => {
      const dimensions = utils.generateDimensions();
      expect(dimensions.length).toBe(utils.DEFAULT_DIMENSION_COUNT);

      for (let i = 0; i < dimensions.length - 1; i++) {
        const dimension = dimensions[i];
        expect(utils.dimensionSamples.includes(dimension)).toBe(true);
      }

      expect(utils.metricDimensionSamples.includes(dimensions[dimensions.length - 1])).toBe(true);
    });

    it('should generate dimensions with count', () => {
      const count = 3;
      const dimensions = utils.generateDimensions(count);

      for (let i = 0; i < dimensions.length - 1; i++) {
        const dimension = dimensions[i];
        expect(utils.dimensionSamples.includes(dimension)).toBe(true);
      }

      expect(utils.metricDimensionSamples.includes(dimensions[dimensions.length - 1])).toBe(true);
    });

    it('should generate dimensions sequentially and not randomly', () => {
      const count = 3;
      const dimensions = utils.generateDimensions(count, false);

      for (let i = 0; i < dimensions.length - 1; i++) {
        expect(dimensions[i]).toStrictEqual(utils.dimensionSamples[i]);
      }

      expect(dimensions[count - 1]).toStrictEqual(utils.metricDimensionSamples[0]);
    });
  });
});
