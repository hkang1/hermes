import {
  DEFAULT_DATA, DEFAULT_DIMENSIONS, HermesSetup, hermesSetup, hermesTeardown, HermesTester,
} from 'test/utils';

import HermesError from './classes/HermesError';
import * as t from './types';
import { clone } from './utils/data';

import Hermes from './index';

describe('Hermes Core', () => {
  describe('constructor', () => {
    let setup: HermesSetup;

    afterEach(() => {
      hermesTeardown(setup);
    });

    it('should draw chart if all the inputs are valid', () => {
      setup = hermesSetup(DEFAULT_DIMENSIONS, {}, DEFAULT_DATA);
      expect(setup.error).toBeUndefined();
      expect(setup.hermes).toBeInstanceOf(Hermes);
    });

    it('should create chart without config and data', () => {
      setup = hermesSetup(DEFAULT_DIMENSIONS);
      expect(setup.error).toBeUndefined();
      expect(setup.hermes).toBeInstanceOf(Hermes);
    });

    it('should create chart with element id', () => {
      const elementId = 'super-hermes';
      const element = document.createElement('div');
      element.id = elementId;
      document.body.appendChild(element);

      let hermes: HermesTester | undefined;
      let error: HermesError | undefined;

      try {
        hermes = new HermesTester(`#${elementId}`, DEFAULT_DIMENSIONS);
      } catch (e) {
        error = e as HermesError;
      }

      expect(error).toBeUndefined();
      expect(hermes).toBeInstanceOf(Hermes);

      hermes?.destroy();
      document.body.removeChild(element);
    });

    it('should fail if target is invalid', () => {
      let hermes: HermesTester | undefined;
      let error: HermesError | undefined;

      try {
        hermes = new HermesTester('.nothing', DEFAULT_DIMENSIONS);
      } catch (e) {
        error = e as HermesError;
      }

      expect(error?.message).toMatch(/selector did not match anything/i);
      expect(hermes).toBeUndefined();
    });

    it('should fail if unable to get canvas 2d context', () => {
      // Save original `canvas.getContext`.
      const getContext = HTMLCanvasElement.prototype.getContext;

      // Force `canvas.getContext` to return `null`.
      HTMLCanvasElement.prototype.getContext = () => null;

      const setup = hermesSetup(DEFAULT_DIMENSIONS);
      expect(setup.error?.message).toMatch(/unable to get context/i);
      expect(setup.hermes).toBeUndefined();
      hermesTeardown(setup);

      // Restore `canvas.getContext`.
      HTMLCanvasElement.prototype.getContext = getContext;
    });

    it('should fail if the dimension list is empty', () => {
      const setup = hermesSetup([]);
      expect(setup.error?.message).toMatch(/need at least one dimension defined/i);
      expect(setup.hermes).toBeUndefined();
      hermesTeardown(setup);
    });

    it('should fail if data sizes are not uniform across dimensions', () => {
      const nonuniformData = clone(DEFAULT_DATA);
      const dimKeys = Object.keys(nonuniformData);

      // Make first series short one data point.
      if (dimKeys.length !== 0) {
        nonuniformData[dimKeys[0]].splice(1, 1);
      }

      const setup = hermesSetup(DEFAULT_DIMENSIONS, {}, nonuniformData);
      expect(setup.error?.message).toMatch(/data are not uniform in size/i);
      expect(setup.hermes).toBeUndefined();
      hermesTeardown(setup);
    });
  });

  describe('getTester', () => {
    it('should have `generateData` defined in tester', () => {
      const tester = HermesTester.getTester();
      expect(tester.generateData).toBeDefined();
      expect(tester.generateDimensions).toBeDefined();
    });
  });

  describe('setData', () => {
    let newData: t.Data;
    let spyRedraw: jest.SpyInstance<void, []>;
    let setup: HermesSetup;

    beforeEach(() => {
      setup = hermesSetup(DEFAULT_DIMENSIONS, {}, DEFAULT_DATA);

      newData = clone(DEFAULT_DATA);

      // Add copy and add the first few data points back into the dimension data.
      Object.keys(DEFAULT_DATA).forEach(key => {
        const dimData = DEFAULT_DATA[key];
        dimData.push(dimData[0], dimData[1], dimData[2]);
      });

      if (!setup.hermes) throw new Error('Hermes not initialized.');

      spyRedraw = jest.spyOn(setup.hermes, 'redraw');
    });

    afterEach(() => {
      spyRedraw.mockClear();
      hermesTeardown(setup);
    });

    it('should set data', () => {
      setup.hermes?.setData(newData);
      expect(setup.hermes?.getData()).toStrictEqual(newData);
      expect(spyRedraw).toHaveBeenCalled();
    });

    it('should set data and not redraw', () => {
      setup.hermes?.setData(newData, false);
      expect(setup.hermes?.getData()).toStrictEqual(newData);
      expect(spyRedraw).not.toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('should clean up during destroy', () => {
      const setup = hermesSetup(DEFAULT_DIMENSIONS, {}, DEFAULT_DATA);
      if (!setup.hermes) throw new Error('Hermes not initialized.');

      // Should contain a canvas element.
      const children = [].slice.call(setup.element?.children) as HTMLElement[];
      expect(children.length).toBe(1);
      expect(children[0] instanceof HTMLCanvasElement).toBe(true);

      // Children list should be empty after `destroy`.
      setup.hermes?.destroy();
      expect([].slice.call(setup.element?.children).length).toBe(0);
    });
  });
});
