/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  collectCoverageFrom: [ './src/**' ],
  coverageDirectory: 'test-results',
  globals: { 'ts-jest': { tsconfig: 'tsconfig.test.json' } },
  moduleDirectories: [ 'node_modules', 'src' ],
  moduleFileExtensions: [ 'js', 'jsx', 'ts', 'tsx' ],
  moduleNameMapper: { 'test/(.*)': '<rootDir>/test/$1' },
  modulePathIgnorePatterns: [ './src/defaults.ts', './src/types.ts' ],
  preset: 'ts-jest',
  reporters: [
    'default',
    [ 'jest-junit', { outputDirectory: 'test-results', outputName: 'junit.xml' } ],
  ],
  setupFilesAfterEnv: [ './test/setup.ts', 'jest-extended/all' ],
  testEnvironment: './test/HermesTestEnvironment.ts',
  testMatch: [ '**/*.test.ts' ],
  transform: { '^.+\\.(ts|tsx)?$': 'ts-jest' },
};
