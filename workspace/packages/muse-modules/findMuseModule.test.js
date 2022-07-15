const findMuseModule = require('./findMuseModule');

const expectEqual = (a, b) => {
  if (a !== b) throw new Error(`Expected ${a}, but got ${b}`);
};
const getId = (id) => () => id;
const museIds = [
  'lib1@1.0.3/src/index.js',
  'lib1@1.0.4/src/index.js',
  'lib1@1.1.1/src/index.js',
  'lib1@2.1.1/src/index.js',
  'lib2@1.0.0/src/test.js',
  '@ebay/lib3@2.9.0/lib/index.js',
];
const museSharedModules = { modules: {} };

museIds.forEach((id) => {
  museSharedModules.modules[id] = getId(id);
});

const expectedResult = [
  ['lib1@1.0.3/src/index.js', 'lib1@1.0.3/src/index.js'],
  ['lib1@1.0.2/src/index.js', 'lib1@1.0.3/src/index.js'],
  ['lib1@1.0.6/src/index.js', 'lib1@1.0.4/src/index.js'],
  ['lib1@1.1.6/src/index.js', 'lib1@1.1.1/src/index.js'],
  ['lib1@3.1.6/src/index.js', 'lib1@2.1.1/src/index.js'],
  ['lib1@3.1.6-beta.1/src/index.js', 'lib1@2.1.1/src/index.js'],
  ['@ebay/lib3@1.0.0/lib/index.js', '@ebay/lib3@2.9.0/lib/index.js'],
  ['@ebay/lib3@2.9.0/lib/index.js', '@ebay/lib3@2.9.0/lib/index.js'],
  ['@ebay/lib3@200.9.0/lib/index.js', '@ebay/lib3@2.9.0/lib/index.js'],
];

expectedResult.forEach(([museId, resolvedMuseId]) => {
  console.log('Test: ', museId);
  expectEqual(findMuseModule(museId, museSharedModules)(), resolvedMuseId);
});

console.log('✅ Test success.');
