const resizeObserverEntry = (
  target: HTMLElement,
  width = 1000,
  height = 500,
): ResizeObserverEntry => ({
  borderBoxSize: [],
  contentBoxSize: [],
  contentRect: {
    bottom: 0,
    height,
    left: 0,
    right: 0,
    toJSON: jest.fn(),
    top: 0,
    width,
    x: 0,
    y: 0,
  },
  target,
});

export default resizeObserverEntry;
