/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  coverageDirectory: 'test-results',
  preset: 'ts-jest',
  reporters: [
    'default',
    [ 'jest-junit', { outputDirectory: 'test-results', outputName: 'junit.xml' } ],
  ],
  testEnvironment: 'node',
  testMatch: [ '**/*.test.ts' ],
};
