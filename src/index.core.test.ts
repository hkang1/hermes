import * as utils from 'test/utils';

import HermesError from './classes/HermesError';
import * as t from './types';
import { clone } from './utils/data';

import Hermes from './index';

describe('Hermes Core', () => {
  describe('constructor', () => {
    let setup: utils.HermesSetup;

    afterEach(() => {
      utils.hermesTeardown(setup);
    });

    it('should draw chart if all the inputs are valid', () => {
      setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, {}, utils.DEFAULT_DATA);
      expect(setup.hermes).toBeInstanceOf(Hermes);
    });

    it('should create chart without config and data', () => {
      setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS);
      expect(setup.hermes).toBeInstanceOf(Hermes);
    });

    it('should create chart with element id', () => {
      const elementId = 'super-hermes';
      const element = document.createElement('div');
      element.id = elementId;
      document.body.appendChild(element);

      let hermes: utils.HermesTester | undefined;
      let error: HermesError | undefined;

      try {
        hermes = new utils.HermesTester(`#${elementId}`, utils.DEFAULT_DIMENSIONS);
      } catch (e) {
        error = e as HermesError;
      }

      expect(error).toBeUndefined();
      expect(hermes).toBeInstanceOf(Hermes);

      hermes?.destroy();
      document.body.removeChild(element);
    });

    it('should fail if target is invalid', () => {
      let hermes: utils.HermesTester | undefined;
      let error: HermesError | undefined;

      try {
        hermes = new utils.HermesTester('.nothing', utils.DEFAULT_DIMENSIONS);
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

      const setup = utils.hermesSetupWithError(utils.DEFAULT_DIMENSIONS);
      expect(setup.error?.message).toMatch(/unable to get context/i);

      utils.hermesTeardown(setup);

      // Restore `canvas.getContext`.
      HTMLCanvasElement.prototype.getContext = getContext;
    });

    it('should fail if the dimension list is empty', () => {
      const setup = utils.hermesSetupWithError([]);
      expect(setup.error?.message).toMatch(/need at least one dimension defined/i);
      expect(setup.hermes).toBeUndefined();
      utils.hermesTeardown(setup);
    });

    it('should fail if data sizes are not uniform across dimensions', () => {
      const nonuniformData = clone(utils.DEFAULT_DATA);
      const dimKeys = Object.keys(nonuniformData);

      // Make first series short one data point.
      if (dimKeys.length !== 0) {
        nonuniformData[dimKeys[0]].splice(1, 1);
      }

      const setup = utils.hermesSetupWithError(utils.DEFAULT_DIMENSIONS, {}, nonuniformData);
      expect(setup.error?.message).toMatch(/data are not uniform in size/i);
      expect(setup.hermes).toBeUndefined();
      utils.hermesTeardown(setup);
    });
  });

  describe('getTester', () => {
    it('should have `generateData` defined in tester', () => {
      const tester = utils.HermesTester.getTester();
      expect(tester.generateData).toBeDefined();
      expect(tester.generateDimensions).toBeDefined();
    });
  });

  describe('validateData', () => {
    it('should validate data to ensure all dimensions data have the same count', () => {
      const validData = { abc: [ 0, 1, 2 ], def: [ 0, 1, 2 ] };
      const check0 = utils.HermesTester.validateData(validData);
      expect(check0.count).toBe(3);
      expect(check0.valid).toBeTrue();

      const invalidData = { abc: [ 0, 1 ], def: [ 0, 1, 2 ] };
      const check1 = utils.HermesTester.validateData(invalidData);
      expect(check1.valid).toBeFalse();
    });
  });

  describe('dimension validation', () => {
    const validLinearDimension = { key: 'a', label: 'a', type: t.DimensionType.Linear };
    const invalidCategoricalDimension = { key: 'b', label: 'b', type: t.DimensionType.Categorical };
    const invalidLogarithmicDimension = { key: 'c', label: 'c', type: t.DimensionType.Logarithmic };

    describe('validateDimension', () => {
      it('should validate dimension config', () => {
        const check0 = utils.HermesTester.validateDimension(validLinearDimension);
        expect(check0.valid).toBeTrue();

        const check1 = utils.HermesTester.validateDimension(invalidCategoricalDimension);
        expect(check1.valid).toBeFalse();

        const check2 = utils.HermesTester.validateDimension(invalidLogarithmicDimension);
        expect(check2.valid).toBeFalse();
      });
    });

    describe('validateDimensions', () => {
      it('should validate dimensions config', () => {
        const validDimensions = [
          validLinearDimension,
          validLinearDimension,
          validLinearDimension,
        ];
        const check0 = utils.HermesTester.validateDimensions(validDimensions);
        expect(check0.valid).toBeTrue();

        const invalidDimensions = [
          validLinearDimension,
          invalidCategoricalDimension,
          invalidLogarithmicDimension,
        ];
        const check1 = utils.HermesTester.validateDimensions(invalidDimensions);
        expect(check1.valid).toBeFalse();
      });
    });
  });

  describe('setData', () => {
    let newData: t.Data;
    let spyRedraw: jest.SpyInstance<void, []>;
    let setup: utils.HermesSetup;

    beforeEach(() => {
      setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, {}, utils.DEFAULT_DATA);

      newData = clone(utils.DEFAULT_DATA);

      // Add copy and add the first few data points back into the dimension data.
      Object.keys(utils.DEFAULT_DATA).forEach(key => {
        const dimData = utils.DEFAULT_DATA[key];
        dimData.push(dimData[0], dimData[1], dimData[2]);
      });

      if (!setup.hermes) throw new Error('Hermes not initialized.');

      spyRedraw = jest.spyOn(setup.hermes, 'redraw');
    });

    afterEach(() => {
      spyRedraw.mockClear();
      utils.hermesTeardown(setup);
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
      const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, {}, utils.DEFAULT_DATA);
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
