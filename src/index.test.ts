import HermesError from './classes/HermesError';
import * as t from './types';
import { clone } from './utils/data';
import * as tester from './utils/tester';

import Hermes from './index';

const ELEMENT_ID = 'chart';
const DIMENSION_COUNT = 4;
const DATA_COUNT = 50;

class HermesTester extends Hermes {}

const tryHermes = (
  target: HTMLElement | string,
  dimensions: t.Dimension[],
  config: t.RecursivePartial<t.Config> = {},
  data: t.Data = {},
): { error?: HermesError, hermes?: HermesTester } => {
  let hermes: Hermes | undefined;
  let error: HermesError | undefined;
  try {
    hermes = new HermesTester(target, dimensions, config, data);
  } catch (e) {
    error = e as HermesError;
  }
  return { error, hermes };
};

describe('Hermes class', () => {
  let element: HTMLDivElement;
  let dimensions: t.Dimension[];
  let data: t.Data;

  beforeAll(() => {
    element = document.createElement('div');
    element.id = ELEMENT_ID;
    document.body.appendChild(element);

    dimensions = tester.generateDimensions(DIMENSION_COUNT);
    data = tester.generateData(dimensions, DATA_COUNT);
  });

  describe('constructor', () => {
    it('should draw chart if all the inputs are valid', () => {
      const { error, hermes } = tryHermes(element, dimensions, {}, data);
      expect(error).toBeUndefined();
      expect(hermes).toBeInstanceOf(Hermes);
    });

    it('should create chart without data', () => {
      const { error, hermes } = tryHermes(element, dimensions, {});
      expect(error).toBeUndefined();
      expect(hermes).toBeInstanceOf(Hermes);
    });

    it('should create chart with element id', () => {
      const { error, hermes } = tryHermes(`#${ELEMENT_ID}`, dimensions, {});
      expect(error).toBeUndefined();
      expect(hermes).toBeInstanceOf(Hermes);
    });

    it('should fail if target is invalid', () => {
      const { error, hermes } = tryHermes('.nothing', dimensions, {});
      expect(error?.message).toMatch(/selector did not match anything/i);
      expect(hermes).toBeUndefined();
    });

    it('should fail if unable to get canvas 2d context', () => {
      // Save original `canvas.getContext`.
      const getContext = HTMLCanvasElement.prototype.getContext;

      // Force `canvas.getContext` to return `null`.
      HTMLCanvasElement.prototype.getContext = () => null;

      const { error, hermes } = tryHermes(element, dimensions, {});
      expect(error?.message).toMatch(/unable to get context/i);
      expect(hermes).toBeUndefined();

      // Restore `canvas.getContext`.
      HTMLCanvasElement.prototype.getContext = getContext;
    });

    it('should fail if the dimension list is empty', () => {
      const { error, hermes } = tryHermes(element, [], {});
      expect(error?.message).toMatch(/need at least one dimension defined/i);
      expect(hermes).toBeUndefined();
    });

    it('should fail if data sizes are not uniform across dimensions', () => {
      const nonuniformData = clone(data);
      const dimKeys = Object.keys(nonuniformData);

      // Make first series short one data point.
      if (dimKeys.length !== 0) {
        nonuniformData[dimKeys[0]].splice(1, 1);
      }

      const { error, hermes } = tryHermes(element, dimensions, {}, nonuniformData);
      expect(error?.message).toMatch(/data are not uniform in size/i);
      expect(hermes).toBeUndefined();
    });
  });

  describe('getTester', () => {
    it('should have `generateData` defined in tester', () => {
      const tester = HermesTester.getTester();
      expect(tester.generateData).toBeDefined();
      expect(tester.generateDimensions).toBeDefined();
    });
  });
});
