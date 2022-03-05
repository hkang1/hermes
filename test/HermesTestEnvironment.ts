import { EnvironmentContext } from '@jest/environment';
import { Config } from '@jest/types';
import JsDomEnvironment from 'jest-environment-jsdom';

class HermesTestEnvironment extends JsDomEnvironment {
  constructor(config: Config.ProjectConfig, options?: EnvironmentContext) {
    super(config, options);
    this.global.hermesTest = { element: undefined, error: undefined, hermes: undefined };
  }
}

module.exports = HermesTestEnvironment;
