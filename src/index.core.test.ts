import { hermesSetup, HermesTester, tryHermes } from 'test/utils';

import HermesError from './classes/HermesError';
import * as t from './types';
import { clone } from './utils/data';

import Hermes from './index';

describe('Hermes Core', () => {
  describe('constructor', () => {
    hermesSetup();

    it('should draw chart if all the inputs are valid', () => {
      tryHermes(hermesTest.dimensions, {}, hermesTest.data);
      expect(hermesTest.error).toBeUndefined();
      expect(hermesTest.hermes).toBeInstanceOf(Hermes);
    });

    it('should create chart without config and data', () => {
      tryHermes(hermesTest.dimensions);
      expect(hermesTest.error).toBeUndefined();
      expect(hermesTest.hermes).toBeInstanceOf(Hermes);
    });

    it('should create chart with element id', () => {
      const elementId = 'super-hermes';
      const element = document.createElement('div');
      element.id = elementId;
      document.body.appendChild(element);

      let hermes: HermesTester | undefined;
      let error: HermesError | undefined;

      try {
        hermes = new HermesTester(`#${elementId}`, hermesTest.dimensions);
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
        hermes = new HermesTester('.nothing', hermesTest.dimensions);
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

      tryHermes(hermesTest.dimensions);
      expect(hermesTest.error?.message).toMatch(/unable to get context/i);
      expect(hermesTest.hermes).toBeUndefined();

      // Restore `canvas.getContext`.
      HTMLCanvasElement.prototype.getContext = getContext;
    });

    it('should fail if the dimension list is empty', () => {
      tryHermes([]);
      expect(hermesTest.error?.message).toMatch(/need at least one dimension defined/i);
      expect(hermesTest.hermes).toBeUndefined();
    });

    it('should fail if data sizes are not uniform across dimensions', () => {
      const nonuniformData = clone(hermesTest.data);
      const dimKeys = Object.keys(nonuniformData);

      // Make first series short one data point.
      if (dimKeys.length !== 0) {
        nonuniformData[dimKeys[0]].splice(1, 1);
      }

      tryHermes(hermesTest.dimensions, {}, nonuniformData);
      expect(hermesTest.error?.message).toMatch(/data are not uniform in size/i);
      expect(hermesTest.hermes).toBeUndefined();
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

    hermesSetup();

    beforeEach(() => {
      tryHermes(hermesTest.dimensions, {}, hermesTest.data);
      newData = clone(hermesTest.data);

      // Add copy and add the first few data points back into the dimension data.
      Object.keys(hermesTest.data).forEach(key => {
        const dimData = hermesTest.data[key];
        dimData.push(dimData[0], dimData[1], dimData[2]);
      });

      if (hermesTest.hermes) {
        spyRedraw = jest.spyOn(hermesTest.hermes, 'redraw');
      }
    });

    it('should set data', () => {
      if (!hermesTest.hermes) throw new Error('Hermes not initialized.');
      hermesTest.hermes?.setData(newData);
      expect(hermesTest.hermes.getData()).toStrictEqual(newData);
      expect(spyRedraw).toHaveBeenCalled();
    });

    it('should set data and not redraw', () => {
      if (!hermesTest.hermes) throw new Error('Hermes not initialized.');
      hermesTest.hermes?.setData(newData, false);
      expect(hermesTest.hermes.getData()).toStrictEqual(newData);
      expect(spyRedraw).not.toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    hermesSetup();

    it('should clean up during destroy', () => {
      tryHermes(hermesTest.dimensions, {}, hermesTest.data);
      if (!hermesTest.hermes) throw new Error('Hermes not initialized.');

      // Should contain a canvas element.
      const children = [].slice.call(hermesTest.element?.children) as HTMLElement[];
      expect(children.length).toBe(1);
      expect(children[0] instanceof HTMLCanvasElement).toBe(true);

      // Children list should be empty after `destroy`.
      hermesTest.hermes?.destroy();
      expect([].slice.call(hermesTest.element?.children).length).toBe(0);
    });
  });
});
