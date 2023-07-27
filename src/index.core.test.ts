import getBoundingClientRect from 'test/mocks/getBoundingClientRect';
import getTextSize from 'test/mocks/getTextSize';
import * as utils from 'test/utils';

import HermesError from './classes/HermesError';
import * as t from './types';
import * as canvas from './utils/canvas';
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

    it.each`
      property    | value
      ${'width'}  | ${0}
      ${'height'} | ${0}
    `('should fail if target element has $property of $value', ({ property, value }) => {
      const elementId = 'super-hermes';
      const element = document.createElement('div');
      element.id = elementId;
      document.body.appendChild(element);

      const boundingRect = { ...utils.DEFAULT_BOUNDING_CLIENT_RECT, [property]: value };
      const originalBoundingClientRect = Element.prototype.getBoundingClientRect;
      Element.prototype.getBoundingClientRect = getBoundingClientRect(boundingRect);

      const consoleWarn = console.warn;

      console.warn = jest.fn();

      const hermes = new utils.HermesTester(`#${elementId}`, utils.DEFAULT_DIMENSIONS);

      expect(console.warn).toHaveBeenCalledWith('Target element width and height must both be greater than 0px.');
      expect(hermes).toBeDefined();

      hermes?.destroy();
      document.body.removeChild(element);

      Element.prototype.getBoundingClientRect = originalBoundingClientRect;

      console.warn = consoleWarn;
    });

    it('should use existing canvas in element', () => {
      const elementId = 'canvas-already';
      const element = document.createElement('div');
      element.id = elementId;
      document.body.appendChild(element);

      const canvas = document.createElement('canvas');
      element.appendChild(canvas);

      let hermes: utils.HermesTester | undefined;
      let error: HermesError | undefined;

      try {
        hermes = new utils.HermesTester(`#${elementId}`, utils.DEFAULT_DIMENSIONS);
      } catch (e) {
        error = e as HermesError;
      }

      expect(error).toBeUndefined();
      expect(hermes).toBeInstanceOf(Hermes);
      expect(hermes?.getCanvas()).toBe(canvas);

      hermes?.destroy();
      document.body.removeChild(element);
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
      expect(setup.error?.message).toMatch(/is not uniform with other dimension data length/i);
      expect(setup.hermes).toBeUndefined();
      utils.hermesTeardown(setup);
    });
  });

  describe('deepMerge', () => {
    it('should have `deepMerge` defined statically', () => {
      expect(utils.HermesTester.deepMerge).not.toBeUndefined();
    });

    it('should perform deep merge', () => {
      const a: t.NestedObject = { a: { b: 1, c: { d: 2 } } };
      const b: t.NestedObject = { a: { c: { d: 3, e: 4 } }, f: 5 };
      const c = { a: { b: 1, c: { d: 3, e: 4 } }, f: 5 };
      expect(utils.HermesTester.deepMerge(a, b)).toStrictEqual(c);
    });
  });

  describe('obj2str and str2obj', () => {
    const obj = { abc: { a: 5, b: NaN, c: [ true, Infinity, -Infinity ] } };
    const str = `{
  "abc": {
    "a": 5,
    "b": Number.NaN,
    "c": [
      true,
      Number.Infinity,
      -Number.Infinity
    ]
  }
}`;

    describe('obj2str', () => {
      it('should have `obj2str` defined statically', () => {
        expect(utils.HermesTester.obj2str).not.toBeUndefined();
      });

      it('should convert object to string', () => {
        expect(utils.HermesTester.obj2str(obj)).toBe(str);
      });
    });

    describe('str2obj', () => {
      it('should have `str2obj` defined statically', () => {
        expect(utils.HermesTester.str2obj).not.toBeUndefined();
      });

      it('should convert string to object', () => {
        expect(utils.HermesTester.str2obj(str)).toMatchObject(obj);
      });
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
    const dimensions: t.Dimension[] = [
      { key: 'abc', label: 'abc', type: t.DimensionType.Linear },
      { key: 'def', label: 'def', type: t.DimensionType.Linear },
    ];

    it('should check that all dimension data have the same number of data points', () => {
      const validData = { abc: [ 0, 1, 2 ], def: [ 0, 1, 2 ] };
      const check = utils.HermesTester.validateData(validData, dimensions);
      expect(check.count).toBe(3);
      expect(check.valid).toBeTrue();
    });

    it('should report the data is invalid when dimension data are not uniform', () => {
      const invalidData = { abc: [ 0, 1 ], def: [ 0, 1, 2 ] };
      const check = utils.HermesTester.validateData(invalidData, dimensions);
      expect(check.valid).toBeFalse();
    });

    it('should report the data is invalid when the data contains null or undefined', () => {
      const invalidData = { abc: [ 0, 1, null ], def: [ 0, 1, 2 ] };
      const check = utils.HermesTester.validateData(invalidData, dimensions);
      expect(check.valid).toBeFalse();
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

  describe('setConfig', () => {
    let spyRedraw: jest.SpyInstance<void, []>;
    let setup: utils.HermesSetup;

    beforeEach(() => {
      setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, {}, utils.DEFAULT_DATA);

      if (!setup.hermes) throw new Error('Hermes not initialized.');

      spyRedraw = jest.spyOn(setup.hermes, 'redraw');
    });

    afterEach(() => {
      utils.hermesTeardown(setup);
    });

    it('should set config', () => {
      expect(setup.hermes.getConfig().debug).toBeFalse();

      setup.hermes.setConfig({ debug: true });

      expect(setup.hermes.getConfig().debug).toBeTrue();
    });

    it('should set config and redraw', () => {
      expect(spyRedraw).not.toHaveBeenCalled();

      setup.hermes.setConfig({ debug: true });

      expect(spyRedraw).toHaveBeenCalled();
    });

    it('should set config and not redraw', () => {
      expect(spyRedraw).not.toHaveBeenCalled();

      setup.hermes.setConfig({ debug: true }, false);

      expect(spyRedraw).not.toHaveBeenCalled();
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

    it('should throw an error if the data is not uniform across dimensions', () => {
      // Remove one data point from the first dimension data series.
      const invalidData = clone(utils.DEFAULT_DATA);
      const dimensionKey = utils.DEFAULT_DIMENSIONS[0].key;
      invalidData[dimensionKey].pop();

      const setData = () => setup.hermes?.setData(invalidData);
      expect(setData).toThrowWithMessage(HermesError, /is not uniform with other dimension data length/i);
    });

    it('should throw an error if the data is missing data points for a dimension key', () => {
      const invalidData = clone(utils.DEFAULT_DATA);
      const dimensionKey = utils.DEFAULT_DIMENSIONS[0].key;
      delete invalidData[dimensionKey];

      const setData = () => setup.hermes?.setData(invalidData);
      expect(setData).toThrowWithMessage(HermesError, /data for .* is missing/i);
    });
  });

  describe('disable', () => {
    let spyGetTextSize: jest.SpyInstance<t.Size, [
      ctx: CanvasRenderingContext2D,
      text: string,
      font?: string | undefined
    ]>;

    beforeAll(() => {
      jest.useFakeTimers();
      spyGetTextSize = jest.spyOn(canvas, 'getTextSize').mockImplementation(getTextSize);
    });

    afterAll(() => {
      spyGetTextSize.mockClear();
      jest.useRealTimers();
    });

    it('should prevent any interactions when disabled', () => {
      const onDimensionMove = jest.fn();
      const config: t.RecursivePartial<t.Config> = {
        hooks: { onDimensionMove },
        interactions: {
          throttleDelayMouseMove: 0,
          throttleDelayResize: 0,
        },
      };
      const setup = utils.hermesSetup(utils.DEFAULT_DIMENSIONS, config, utils.DEFAULT_DATA);

      jest.runOnlyPendingTimers();
      expect(onDimensionMove).not.toHaveBeenCalled();

      // Disable interactions.
      setup.hermes.disable();

      // Move dimension from right to left.
      utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 961, clientY: 38 });
      utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 577, clientY: 38 });
      utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 577, clientY: 38 });

      jest.runOnlyPendingTimers();
      expect(onDimensionMove).not.toHaveBeenCalled();

      // Enable interactions
      setup.hermes.enable();

      // Move dimension from right to left.
      utils.dispatchMouseEvent('mousedown', setup.element, { clientX: 961, clientY: 38 });
      utils.dispatchMouseEvent('mousemove', setup.element, { clientX: 577, clientY: 38 });
      utils.dispatchMouseEvent('mouseup', setup.element, { clientX: 577, clientY: 38 });

      jest.runOnlyPendingTimers();
      expect(onDimensionMove).toHaveBeenCalled();
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
