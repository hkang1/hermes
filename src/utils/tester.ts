import * as DEFAULT from '../defaults';
import * as t from '../types';

import { randomItem, randomLogNumber, randomNumber } from './data';

export interface Tester {
  generateData: (dimensions: t.Dimension[], count: number) => t.Data;
  generateDimensions: (dimCount?: number, random?: boolean) => t.Dimension[];
}

export const DEFAULT_DIMENSION_COUNT = 10;

export const dimensionRanges: Record<t.RecordKey, t.Range> = {
  'accuracy': [ 0.55, 0.99 ],
  'dropout': [ 0.2, 0.8 ],
  'global-batch-size': [ 5, 30 ],
  'layer-free-decay': [ 0.001, 0.1 ],
  'layer-split-factor': [ 1, 16 ],
  'learning-rate': [ 0.0001, 0.1 ],
  'learning-rate-decay': [ 0.000001, 0.001 ],
  'loss': [ 1.7, 2.4 ],
  'metrics-base': [ 0.5, 0.9 ],
  'n-filters': [ 8, 64 ],
};

export const dimensionSamples: t.Dimension[] = [
  {
    key: 'dropout',
    label: 'Dropout',
    type: t.DimensionType.Linear,
  },
  {
    key: 'global-batch-size',
    label: 'Global Batch Size',
    type: t.DimensionType.Linear,
  },
  {
    categories: [ 4, 8, 16, 32, 64 ],
    dataOnEdge: false,
    key: 'layer-dense-size',
    label: 'Layer Dense Size',
    type: t.DimensionType.Categorical,
  },
  {
    key: 'layer-free-decay',
    label: 'Layer Free Decay',
    logBase: 10,
    type: t.DimensionType.Logarithmic,
  },
  {
    categories: [ true, false ],
    dataOnEdge: false,
    key: 'layer-inverse',
    label: 'Layer Inverse',
    type: t.DimensionType.Categorical,
  },
  {
    key: 'learning-rate',
    label: 'Learning Rate',
    logBase: 10,
    type: t.DimensionType.Logarithmic,
  },
  {
    key: 'learning-rate-decay',
    label: 'Learning Rate Decay',
    logBase: 10,
    type: t.DimensionType.Logarithmic,
  },
  {
    key: 'layer-split-factor',
    label: 'Layer Split Factor',
    logBase: 2,
    type: t.DimensionType.Logarithmic,
  },
  {
    key: 'metrics-base',
    label: 'Metrics Base',
    type: t.DimensionType.Linear,
  },
  {
    key: 'n-filters',
    label: 'N Filters',
    type: t.DimensionType.Linear,
  },
];

export const metricDimensionSamples: t.Dimension[] = [
  {
    key: 'accuracy',
    label: 'Accuracy',
    type: t.DimensionType.Linear,
  },
  {
    key: 'loss',
    label: 'Loss',
    type: t.DimensionType.Linear,
  },
];

export const generateData = (dimensions: t.Dimension[], count: number): t.Data => {
  return dimensions.reduce((acc, dimension) => {
    acc[dimension.key] = new Array(count).fill(null).map(() => {
      if (dimension.type === t.DimensionType.Categorical) {
        return dimension.categories ? randomItem(dimension.categories) : DEFAULT.INVALID_VALUE;
      } else if (dimension.type === t.DimensionType.Linear) {
        const range = dimensionRanges[dimension.key];
        return range ? randomNumber(range[1], range[0]) : DEFAULT.INVALID_VALUE;
      } else if (dimension.type === t.DimensionType.Logarithmic) {
        const range = dimensionRanges[dimension.key];
        return range && dimension.logBase
          ? randomLogNumber(dimension.logBase, range[1], range[0]) : DEFAULT.INVALID_VALUE;
      }
      return DEFAULT.INVALID_VALUE;
    });
    return acc;
  }, {} as t.Data);
};

export const generateDimensions = (
  dimCount = DEFAULT_DIMENSION_COUNT,
  random = true,
): t.Dimension[] => {
  // Generate the dimensions based on config.
  const dims = new Array(dimCount - 1).fill(null).map((_, index) => {
    if (random) return randomItem(dimensionSamples);
    return dimensionSamples[index % dimensionSamples.length];
  });

  // Add a metric dimension to the end.
  const metricDimension = random ? randomItem(metricDimensionSamples) : metricDimensionSamples[0];
  dims.push(metricDimension);

  return dims;
};
