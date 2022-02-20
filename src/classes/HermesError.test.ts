import HermesError, { DEFAULT_MESSAGE, MESSAGE_PREFIX } from './HermesError';

describe('HermesError class', () => {
  const ERROR_MESSAGE = 'this is a problem!';

  it('should create HermesError from an Error', () => {
    const error = new Error(ERROR_MESSAGE);
    const hermesError = new HermesError(error);
    expect(hermesError.message).toContain(ERROR_MESSAGE);
    expect(hermesError.message).toContain(MESSAGE_PREFIX);
  });

  it('should create HermesError from a string', () => {
    const hermesError = new HermesError(ERROR_MESSAGE);
    expect(hermesError.message).toContain(ERROR_MESSAGE);
    expect(hermesError.message).toContain(MESSAGE_PREFIX);
  });

  it('should create HermesError with a default message', () => {
    const hermesError = new HermesError();
    expect(hermesError.message).toContain(DEFAULT_MESSAGE);
    expect(hermesError.message).toContain(MESSAGE_PREFIX);
  });
});
