import Hermes from '../src';
import HermesError from '../src/classes/HermesError';
import * as t from '../src/types';

export const CLOSE_PRECISION = 8;

/**
 * Test Wrapper Classes and Related Functions
 */

export class HermesTester extends Hermes {
  public getData(): t.Data { return this.data; }
  public getDataCount(): number { return this.dataCount; }
}

export type HermesTesterDestroy = () => void;

export const tryHermes = (
  target: HTMLElement | string,
  dimensions: t.Dimension[],
  config: t.RecursivePartial<t.Config> = {},
  data: t.Data = {},
): { destroy: HermesTesterDestroy, error?: HermesError, hermes?: HermesTester } => {
  let hermes: HermesTester | undefined;
  let error: HermesError | undefined;
  try {
    hermes = new HermesTester(target, dimensions, config, data);
  } catch (e) {
    error = e as HermesError;
  }

  const destroy = () => hermes?.destroy();
  return { destroy, error, hermes };
};

/**
 * Helper Functions
 */

export const getContext = (): CanvasRenderingContext2D => {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 400;

  let ctx: CanvasRenderingContext2D | null = null;
  while (ctx === null) {
    ctx = canvas.getContext('2d');
  }

  return ctx;
};
