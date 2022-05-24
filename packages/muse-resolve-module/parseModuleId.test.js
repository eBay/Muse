try {
  const parseModuleId = require('./parseModuleId');
  const expectMatchObject = (obj1, obj2) => {
    for (const p in obj2) {
      if (obj1[p] !== obj2[p]) {
        throw new Exception(`Expect ${p} to be ${obj2[p]} but got ${obj1[p]}`);
      }
    }
  };

  const testData = [
    [
      'pname-1.2@1.0.3/index.js',
      { name: 'pname-1.2', modulePath: '/index.js', id: 'pname-1.2/index.js', version: [1, 0, 3] },
    ],
    [
      '@ebay/pname-1.2@1.0.3/index.js',
      { name: '@ebay/pname-1.2', modulePath: '/index.js', id: '@ebay/pname-1.2/index.js', version: [1, 0, 3] },
    ],
    [
      'name@1.0.4-beta.3/src/index.js',
      { name: 'name', modulePath: '/index.js', id: 'name/src/index.js', version: [1, 0, 4] },
    ],
    [
      '@ebay/name@1.0.4-beta.3/src/index.js',
      { name: '@ebay/name', modulePath: '/index.js', id: '@ebay/name/src/index.js', version: [1, 0, 4] },
    ],
    ['@ebay/lib1@1.a.1/src/index.js', null],
    ['lib1@2.1.1.2/src/index.js', null],
  ];

  testData.forEach(([moudleId, result]) => {
    expectMatchObject(parseModuleId(moudleId), result);
  });

  console.log('Test success.');
} catch (err) {
  console.log('Test failed: ', err);
}
