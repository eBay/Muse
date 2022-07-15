try {
  const buildCache = require('./buildCache');
  const expectEqual = (expected, actual) => {
    expected = JSON.stringify(expected);
    actual = JSON.stringify(actual);
    if (expected !== actual) {
      throw new Error(`Expected ${expected} equals to ${actual}`);
    }
  };

  const globalSharedModules = { modules: {} };
  const testData = {
    'lib1/src/index.js': [
      'lib1@1.0.3/src/index.js',
      'lib1@1.0.2/src/index.js',
      'lib1@1.0.6/src/index.js',
      'lib1@2.1.6/src/index.js',
    ],
    '@ebay/nice-lib/src/index.ts': [
      '@ebay/nice-lib@1.0.3/src/index.ts',
      '@ebay/nice-lib@1.0.2-beta.2/src/index.ts',
      '@ebay/nice-lib@1.0.6/src/index.ts',
      '@ebay/nice-lib@2.1.6-alpha.3/src/index.ts',
    ],
    'lib2/src/index.js': ['lib2@1.0.3/src/index.js'],
  };
  Object.values(testData).forEach((mids) => {
    mids.forEach((mid) => {
      globalSharedModules.modules[mid] = mid;
    });
  });
  buildCache(globalSharedModules);

  Object.keys(testData).forEach((id) => {
    console.log(`Test ${id}`);
    const expected = testData[id];
    const actual = globalSharedModules.cache[id].map((m) => m.museId);
    expectEqual(expected, actual);
  });

  console.log('✅ Test buildCache succeeded.');
} catch (err) {
  console.log('❌ Test buildCache failed: ', err);
}
