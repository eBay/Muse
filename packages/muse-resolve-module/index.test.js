const findMuseModule = require('./index');

const expectEqual = (a, b) => {
  if (a !== b) throw new Error(`Expect ${a} equals to ${b}`);
};
const getId = (id) => () => id;
const moduleIds = [
  'lib1@1.0.3/src/index.js',
  'lib1@1.0.4/src/index.js',
  'lib1@1.1.1/src/index.js',
  'lib1@2.1.1/src/index.js',
  'lib2@1.0.0/src/test.js',
  '@ebay/lib3@2.9.0/lib/index.js',
];
const all = {};
global.window = { __muse_shared_modules__: all };
Object.defineProperty(all, '__muse_cache__', { value: null, writable: true });
moduleIds.forEach((id) => {
  all[id] = getId(id);
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

expectedResult.forEach(([a, b]) => {
  expectEqual(findMuseModule(a, all)(), b);
});

console.log('Test success.');
