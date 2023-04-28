import * as DEFAULT from '../defaults';
import * as t from '../types';

import { clone } from './data';
import * as utils from './interaction';

describe('interaction utilities', () => {
  describe('getDragBound', () => {
    const dimIndex = 2;
    const bound = { h: 100, w: 100, x: 0, y: 0 };
    const boundOffset = { x: 50, y: 100 };
    let ix: t.IX;

    beforeEach(() => {
      ix = clone(DEFAULT.IX);
      ix.shared.action.dimIndex = dimIndex;
      ix.dimension.bound = bound;
      ix.dimension.boundOffset = boundOffset;
    });

    it('should get dragging boundary if applicable', () => {
      ix.shared.action.type = t.ActionType.LabelMove;
      expect(utils.getDragBound(dimIndex, ix, bound)).toStrictEqual({ ...bound, ...boundOffset });
    });

    it('should get default bound if not applicable', () => {
      ix.shared.action.type = t.ActionType.None;
      expect(utils.getDragBound(dimIndex, ix, bound)).toStrictEqual(bound);
    });
  });

  describe('translate internal filters for filter hook calls', () => {
    const tests: { input: t.InternalFilter, output: t.Filter }[] = [
      {
        input: { ...DEFAULT.FILTER, p0: 0.5, p1: 0.2, value0: 5, value1: 2 },
        output: [ 0.2, 0.5 ],
      },
      {
        input: { ...DEFAULT.FILTER, p0: 0.1, p1: 0.2, value0: 1, value1: 2 },
        output: [ 0.1, 0.2 ],
      },
      {
        input: { ...DEFAULT.FILTER, p0: 0.8, p1: 0.1, value0: 8, value1: 1 },
        output: [ 0.1, 0.8 ],
      },
    ];

    describe('internalToFilter', () => {
      it('should translate internal filter to external filter', () => {
        tests.forEach(test => {
          expect(utils.internalToFilter(test.input)).toStrictEqual(test.output);
        });
      });
    });

    describe('internalToFilters', () => {
      it('should translate internal filters to external filters', () => {
        const filterKey = 'key';
        const filters = { [filterKey]: tests.map(test => test.input) };
        const output = { [filterKey]: [ [ 0.1, 0.2 ], [ 0.1, 0.8 ], [ 0.2, 0.5 ] ] };
        expect(utils.internalToFilters(filters)).toStrictEqual(output);
      });
    });
  });

  describe('isFilterEmpty', () => {
    it('should determine if a fiter is empty', () => {
      const filter = { ...DEFAULT.FILTER, p0: NaN, p1: NaN, value0: NaN, value1: NaN };
      expect(utils.isFilterEmpty(filter)).toBe(true);
    });

    it('should determine if a fiter is not empty', () => {
      const filter0 = { ...DEFAULT.FILTER, p0: 0.2, p1: 0.6, value0: 20, value1: 60 };
      const filter1 = { ...DEFAULT.FILTER, p0: NaN, p1: 0.6, value0: 20, value1: 60 };
      const filter2 = { ...DEFAULT.FILTER, p0: 0.2, p1: NaN, value0: 20, value1: 60 };
      expect(utils.isFilterEmpty(filter0)).toBe(false);
      expect(utils.isFilterEmpty(filter1)).toBe(false);
      expect(utils.isFilterEmpty(filter2)).toBe(false);
    });
  });

  describe('isFilterInvalid', () => {
    it('should determine if a filter is invalid', () => {
      const filter0 = { ...DEFAULT.FILTER, p0: 0.6, p1: 0.4, value0: 60, value1: 40 };
      const filter1 = { ...DEFAULT.FILTER, p0: 0.4, p1: 0.4, value0: 40, value1: 40 };
      expect(utils.isFilterInvalid(filter0)).toBe(true);
      expect(utils.isFilterInvalid(filter1)).toBe(true);
    });

    it('should determine if a filter is valid', () => {
      const filter = { ...DEFAULT.FILTER, p0: 0.4, p1: 0.6, value0: 40, value1: 60 };
      expect(utils.isFilterInvalid(filter)).toBe(false);
    });
  });

  describe('isIntersectingFilters', () => {
    it('should detect if filters are overlapping', () => {
      const filter0 = { ...DEFAULT.FILTER, p0: 0.2, p1: 0.6, value0: 20, value1: 60 };
      const filter1 = { ...DEFAULT.FILTER, p0: 0.4, p1: 0.8, value0: 40, value1: 80 };
      expect(utils.isIntersectingFilters(filter0, filter1)).toBe(true);
      expect(utils.isIntersectingFilters(filter1, filter0)).toBe(true);
    });

    it('should detect if filters are not overlapping', () => {
      const filter0 = { ...DEFAULT.FILTER, p0: 0.2, p1: 0.4, value0: 20, value1: 40 };
      const filter1 = { ...DEFAULT.FILTER, p0: 0.6, p1: 0.8, value0: 60, value1: 80 };
      expect(utils.isIntersectingFilters(filter0, filter1)).toBe(false);
      expect(utils.isIntersectingFilters(filter1, filter0)).toBe(false);
    });
  });

  describe('mergeFilters', () => {
    it('should merge overlapping filters', () => {
      const filter0 = {
        ...DEFAULT.FILTER,
        p0: 0.2,
        p1: 0.4,
        percent0: 0.2,
        percent1: 0.4,
        value0: 20,
        value1: 40,
      };
      const filter1 = {
        ...DEFAULT.FILTER,
        p0: 0.6,
        p1: 0.8,
        percent0: 0.6,
        percent1: 0.8,
        value0: 60,
        value1: 80,
      };
      const expected = {
        ...DEFAULT.FILTER,
        p0: 0.2,
        p1: 0.8,
        percent0: 0.2,
        percent1: 0.8,
        value0: 20,
        value1: 80,
      };
      expect(utils.mergeFilters(filter0, filter1)).toStrictEqual(expected);
      expect(utils.mergeFilters(filter1, filter0)).toStrictEqual(expected);
    });

    it('should merge non-overlapping filters', () => {
      const filter0 = {
        ...DEFAULT.FILTER,
        p0: 0.2,
        p1: 0.4,
        percent0: 0.2,
        percent1: 0.4,
        value0: 20,
        value1: 40,
      };
      const filter1 = {
        ...DEFAULT.FILTER,
        p0: 0.6,
        p1: 0.8,
        percent0: 0.6,
        percent1: 0.8,
        value0: 60,
        value1: 80,
      };
      const expected = {
        ...DEFAULT.FILTER,
        p0: 0.2,
        p1: 0.8,
        percent0: 0.2,
        percent1: 0.8,
        value0: 20,
        value1: 80,
      };
      expect(utils.mergeFilters(filter0, filter1)).toStrictEqual(expected);
      expect(utils.mergeFilters(filter1, filter0)).toStrictEqual(expected);
    });

    it('should merge filters with NaN, Infinity and -Infinity', () => {
      const filter0 = {
        ...DEFAULT.FILTER,
        hasNaN: true,
        hasNegativeInfinity: false,
        hasPositiveInfinity: true,
      };
      const filter1 = {
        ...DEFAULT.FILTER,
        hasNaN: false,
        hasNegativeInfinity: true,
        hasPositiveInfinity: false,
      };
      const expected = {
        ...DEFAULT.FILTER,
        hasNaN: true,
        hasNegativeInfinity: true,
        hasPositiveInfinity: true,
      };
      expect(utils.mergeFilters(filter0, filter1)).toStrictEqual(expected);
      expect(utils.mergeFilters(filter1, filter0)).toStrictEqual(expected);
    });
  });

});
