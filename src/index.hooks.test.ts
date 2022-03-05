import { tryHermes } from 'test/utils';

import * as t from './types';
import * as tester from './utils/tester';

const ELEMENT_ID = 'chart';
const DIMENSION_COUNT = 4;
const DATA_COUNT = 50;

describe('Hermes Hooks', () => {
  let element: HTMLDivElement;
  let dimensions: t.Dimension[];
  let data: t.Data;
  const dblclick = new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window });

  beforeEach(() => {
    element = document.createElement('div');
    element.id = ELEMENT_ID;
    document.body.appendChild(element);

    dimensions = tester.generateDimensions(DIMENSION_COUNT);
    data = tester.generateData(dimensions, DATA_COUNT);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  describe('onReset', () => {
    it('should call `onReset` hook when double clicking chart', () => {
      const onReset = jest.fn();
      const config: t.RecursivePartial<t.Config> = { hooks: { onReset } };
      const { destroy } = tryHermes(element, dimensions, config, data);

      expect(onReset).not.toHaveBeenCalled();

      element.dispatchEvent(dblclick);
      expect(onReset).toHaveBeenCalled();

      destroy();
    });
  });
});
