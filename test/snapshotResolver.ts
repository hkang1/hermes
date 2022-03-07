const resolveSnapshotPath = (testPath: string, snapshotExtension: string) => {
  return `${testPath}${snapshotExtension}`;
};

const resolveTestPath = (snapshotFilePath: string, snapshotExtension: string) => {
  return snapshotFilePath.replace(snapshotExtension, '');
};

const testPathForConsistencyCheck = 'some.test.js';

module.exports = {
  resolveSnapshotPath,
  resolveTestPath,
  testPathForConsistencyCheck,
};
