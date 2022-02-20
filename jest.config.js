/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  collectCoverageFrom: [ './src/**' ],
  coverageDirectory: 'test-results',
  modulePathIgnorePatterns: [ './src/defaults.ts', './src/types.ts' ],
  preset: 'ts-jest',
  reporters: [
    'default',
    [ 'jest-junit', { outputDirectory: 'test-results', outputName: 'junit.xml' } ],
  ],
  setupFiles: [ './testSetup.js' ],
  testEnvironment: 'jsdom',
  testMatch: [ '**/*.test.ts' ],
};
