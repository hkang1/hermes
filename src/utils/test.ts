import LinearScale from '../classes/LinearScale';
import * as DEFAULT from '../defaults';
import * as t from '../types';

const scale = new LinearScale(0, 100);

const dimensionRanges: Record<t.RecordKey, t.Range> = {
  'accuracy': [ 0.55, 0.99 ],
  'dropout': [ 0.2, 0.8 ],
  'global-batch-size': [ 5, 30 ],
  'layer-split-factor': [ 1, 16 ],
  'learning-rate': [ 0.0001, 0.1 ],
  'learning-rate-decay': [ 0.000001, 0.001 ],
  'loss': [ 1.7, 2.4 ],
  'metrics-base': [ 0.5, 0.9 ],
  'n-filters': [ 8, 64 ],
};

const dimensionSamples: t.Dimension[] = [
  {
    axis: { scale, type: t.AxisType.Linear },
    key: 'dropout',
    label: 'Dropout',
  },
  {
    axis: { scale, type: t.AxisType.Linear },
    key: 'global-batch-size',
    label: 'Global Batch Size',
  },
  {
    axis: {
      categories: [ 4, 8, 16, 32, 64 ],
      dataOnEdge: false,
      scale,
      type: t.AxisType.Categorical,
    },
    key: 'layer-dense-size',
    label: 'Layer Dense Size',
  },
  {
    axis: { categories: [ true, false ], dataOnEdge: false, scale, type: t.AxisType.Categorical },
    key: 'layer-inverse',
    label: 'Layer Inverse',
  },
  {
    axis: { logBase: 10, scale, type: t.AxisType.Logarithmic },
    key: 'learning-rate',
    label: 'Learning Rate',
  },
  {
    axis: { logBase: 10, scale, type: t.AxisType.Logarithmic },
    key: 'learning-rate-decay',
    label: 'Learning Rate Decay',
  },
  {
    axis: { logBase: 2, scale, type: t.AxisType.Logarithmic },
    key: 'layer-split-factor',
    label: 'Layer Split Factor',
  },
  {
    axis: { scale, type: t.AxisType.Linear },
    key: 'metrics-base',
    label: 'Metrics Base',
  },
  {
    axis: { scale, type: t.AxisType.Linear },
    key: 'n-filters',
    label: 'N Filters',
  },
];

const metricDimensionSamples: t.Dimension[] = [
  {
    axis: { scale, type: t.AxisType.Linear },
    key: 'accuracy',
    label: 'Accuracy',
  },
  {
    axis: { scale, type: t.AxisType.Linear },
    key: 'loss',
    label: 'Loss',
  },
];

export const generateData = (dimensions: t.Dimension[], count: number): t.HermesData => {
  return dimensions.reduce((acc, dimension) => {
    const axis = dimension.axis;
    acc[dimension.key] = new Array(count).fill(null).map(() => {
      if (axis.type === t.AxisType.Categorical) {
        return axis.categories ? randomItem(axis.categories) : DEFAULT.INVALID_VALUE;
      } else if (axis.type === t.AxisType.Linear) {
        const range = dimensionRanges[dimension.key];
        return axis.range ? randomNumber(range[1], range[0]) : DEFAULT.INVALID_VALUE;
      } else if (axis.type === t.AxisType.Logarithmic) {
        const range = dimensionRanges[dimension.key];
        return axis.range && axis.logBase
          ? randomLogNumber(axis.logBase, range[1], range[0]) : DEFAULT.INVALID_VALUE;
      }
      return DEFAULT.INVALID_VALUE;
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
