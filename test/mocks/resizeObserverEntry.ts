const resizeObserverEntry = (
  target: HTMLElement,
  width = 1000,
  height = 500,
): ResizeObserverEntry => ({
  borderBoxSize: [ { blockSize: height, inlineSize: width } ],
  contentBoxSize: [ { blockSize: height, inlineSize: width } ],
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
  devicePixelContentBoxSize: [ { blockSize: height, inlineSize: width } ],
  target,
});

export default resizeObserverEntry;
