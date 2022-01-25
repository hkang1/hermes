import * as t from '../types';

const dimensionSamples: t.Dimension[] = [
  {
    axis: { range: [ 0.2, 0.8 ], type: t.AxisType.Linear },
    key: 'dropout',
    label: 'Dropout',
  },
  {
    axis: { range: [ 5, 30 ], type: t.AxisType.Linear },
    key: 'global-batch-size',
    label: 'Global Batch Size',
  },
  {
    axis: { categories: [ 4, 8, 16, 32, 64 ], type: t.AxisType.Categorical },
    key: 'layer-dense-size',
    label: 'Layer Dense Size',
  },
  {
    axis: { categories: [ true, false ], type: t.AxisType.Categorical },
    key: 'layer-inverse',
    label: 'Layer Inverse',
  },
  {
    axis: { logBase: 10, range: [ 0.0001, 0.1 ], type: t.AxisType.Logarithmic },
    key: 'learning-rate',
    label: 'Learning Rate',
  },
  {
    axis: { logBase: 10, range: [ 0.000001, 0.001 ], type: t.AxisType.Logarithmic },
    key: 'learning-rate-decay',
    label: 'Learning Rate Decay',
  },
  {
    axis: { logBase: 2, range: [ 1, 16 ], type: t.AxisType.Logarithmic },
    key: 'layer-split-factor',
    label: 'Layer Split Factor',
  },
  {
    axis: { range: [ 0.5, 0.9 ], type: t.AxisType.Linear },
    key: 'metrics-base',
    label: 'Metrics Base',
  },
  {
    axis: { range: [ 8, 64 ], type: t.AxisType.Linear },
    key: 'n-filters',
    label: 'N Filters',
  },
];

const metricDimensionSamples: t.Dimension[] = [
  {
    axis: { range: [ 0.55, 0.99 ], type: t.AxisType.Linear },
    key: 'accuracy',
    label: 'Accuracy',
  },
  {
    axis: { range: [ 1.7, 2.4 ], type: t.AxisType.Linear },
    key: 'loss',
    label: 'Loss',
  },
];

export const generateData = (dimensions: t.Dimension[], count: number): t.HermesData => {
  return dimensions.reduce((acc, dimension) => {
    const axis = dimension.axis;
    acc[dimension.key] = new Array(count).fill(null).map(() => {
      if (axis.type === t.AxisType.Categorical) {
        return axis.categories ? randomItem(axis.categories) : null;
      } else if (axis.type === t.AxisType.Linear) {
        return axis.range ? randomNumber(axis.range[1], axis.range[0]) : null;
      } else if (axis.type === t.AxisType.Logarithmic) {
        return axis.range && axis.logBase
          ? randomLogNumber(axis.logBase, axis.range[1], axis.range[0]) : null;
      }
      return null;
    });
    return acc;
  }, {} as t.HermesData);
};

export const generateDimensions = (dimCount = 10, random = true): t.Dimension[] => {
  // Generate the dimensions based on config.
  const dims = new Array(dimCount - 1).fill(null).map((_, index) => {
    if (random) return randomItem(dimensionSamples);
    return dimensionSamples[index % dimensionSamples.length];
  });

  // Add a metric dimension to the end.
  dims.push(randomItem(metricDimensionSamples));

  return dims;
};

export const randomInt = (max: number, min = 0): number => {
  return Math.floor(Math.random() * (max - min)) + min;
};

export const randomItem = <T = unknown>(list: T[]): T => {
  return list[randomInt(list.length)];
};

export const randomLogNumber = (base: number, max: number, min: number): number => {
  const log = base === 10 ? Math.log10 : base === 2 ? Math.log2 : Math.log;
  const denominator = log === Math.log ? Math.log(base) : 1;
  const maxExp = log(max) / denominator;
  const minExp = log(min) / denominator;
  return base ** randomNumber(maxExp, minExp);
};

export const randomNumber = (max: number, min: number): number => {
  return Math.random() * (max - min) + min;
};
