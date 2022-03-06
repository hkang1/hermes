const resizeObserverEntry = (target: HTMLElement): ResizeObserverEntry => ({
  borderBoxSize: [],
  contentBoxSize: [],
  contentRect: {
    bottom: 0,
    height: 500,
    left: 0,
    right: 0,
    toJSON: jest.fn(),
    top: 0,
    width: 1000,
    x: 0,
    y: 0,
  },
  target,
});

export default resizeObserverEntry;
