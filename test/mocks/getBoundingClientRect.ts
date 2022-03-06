import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from 'test/utils';

export const DEFAULT_DOM_RECT: DOMRect = {
  bottom: 0,
  height: DEFAULT_HEIGHT,
  left: 0,
  right: 0,
  toJSON: jest.fn(),
  top: 0,
  width: DEFAULT_WIDTH,
  x: 0,
  y: 0,
};

const getBoundingClientRect = (defaultRect = DEFAULT_DOM_RECT) => (): DOMRect => defaultRect;

export default getBoundingClientRect;
