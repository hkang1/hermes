import * as utils from 'test/utils';

import * as t from './types';

const KEYS = new Array(26).fill('').map((_, index) => String.fromCharCode(65 + index));
const LABELS = KEYS.map(key => `${key}${key}${key}`);
const OPTIONS: Record<string, unknown[]> = {
  categories: [
    undefined,
    [ false, true ],
    [ 2, 4, 8, 16 ],
    [ 'abc', 'def', 'ghi' ],
  ],
  dataOnEdge: [ undefined, false, true ],
  logBase: [ undefined, 2, 10 ],
  reverse: [ undefined, false, true ],
  type: Object.values(t.DimensionType),
};
const DIMENSIONS_OPTIONS: unknown[] = [];

for (let a = 0; a < OPTIONS.categories.length; a++) {
  for (let b = 0; b < OPTIONS.dataOnEdge.length; b++) {
    for (let c = 0; c < OPTIONS.logBase.length; c++) {
      for (let d = 0; d < OPTIONS.reverse.length; d++) {
        for (let e = 0; e < OPTIONS.type.length; e++) {
          DIMENSIONS_OPTIONS.push({
            categories: OPTIONS.categories[a],
            dataOnEdge: OPTIONS.dataOnEdge[b],
            logBase: OPTIONS.logBase[c],
            reverse: OPTIONS.reverse[d],
            type: OPTIONS.type[e],
          });
        }
      }
    }
  }
}

describe('Hermes Dimension', () => {
  const tester = utils.HermesTester.getTester();

  for (let i = 0; i < DIMENSIONS_OPTIONS.length; i += utils.DIMENSION_COUNT) {
    const start = i;
    const stop = i + utils.DIMENSION_COUNT - 1;
    const dimensions = DIMENSIONS_OPTIONS
      .slice(start, stop)
      .map((dimension, index) => {
        return {
          ...dimension as Record<string, unknown>,
          key: KEYS[index],
          label: LABELS[index],
        } as t.Dimension;
      })
      .filter(dimension => utils.HermesTester.validateDimension(dimension).valid) as t.Dimension[];

    it(`should render dimension configs ${start} ~ ${stop} horizontally`, () => {
      const config: t.RecursivePartial<t.Config> = { direction: t.Direction.Horizontal };
      const data = tester.generateData(dimensions, 10, false);
      const setup = utils.hermesSetup(dimensions, config, data);
      const ctx = setup.hermes?.getCtx();

      expect(ctx.__getDrawCalls()).toMatchSnapshot();

      utils.hermesTeardown(setup);
    });

    it(`should render dimension configs ${start} ~ ${stop} vertically`, () => {
      const config: t.RecursivePartial<t.Config> = { direction: t.Direction.Vertical };
      const data = tester.generateData(dimensions, 10, false);
      const setup = utils.hermesSetup(dimensions, config, data);
      const ctx = setup.hermes?.getCtx();

      expect(ctx.__getDrawCalls()).toMatchSnapshot();

      utils.hermesTeardown(setup);
    });
  }
});
