import { isError, isString } from '../utils/data';

export const MESSAGE_PREFIX = '[Hermes]';
export const DEFAULT_MESSAGE = 'Critical error encountered!';

class HermesError extends Error {
  constructor(e?: unknown) {
    const message = isError(e) ? e.message : (isString(e) ? e : DEFAULT_MESSAGE);
    super(`${MESSAGE_PREFIX} ${message}`);
  }
}

export default HermesError;
