try {
  const parseModuleId = require('./parseModuleId');
  const expectMatchObject = (obj1, obj2) => {
    for (const p in obj2) {
      const s1 = JSON.stringify(obj1[p]);
      const s2 = JSON.stringify(obj2[p]);
      if (s1 !== s2) {
        throw new Error(`Expect ${p} to be ${s2} but got ${s1}`);
      }
    }
  };
  const expectEqual = (a, b) => {
    if (a !== b) throw new Error(`Expect ${a} equals to ${b}`);
  };

  const testData = [
    [
      'pname-1.2@1.0.3/index.js',
      { name: 'pname-1.2', path: 'index.js', id: 'pname-1.2/index.js', version: { major: 1, minor: 0, patch: 3 } },
    ],
    [
      '@ebay/pname-1.2@1.0.3/index.js',
      {
        name: '@ebay/pname-1.2',
        path: 'index.js',
        id: '@ebay/pname-1.2/index.js',
        version: { major: 1, minor: 0, patch: 3 },
      },
    ],
    [
      'name@1.0.4-beta.3/src/index.js',
      { name: 'name', path: 'src/index.js', id: 'name/src/index.js', version: { major: 1, minor: 0, patch: 4 } },
    ],
    [
      '@ebay/name@1.0.4-beta.3/src/index.js',
      {
        name: '@ebay/name',
        path: 'src/index.js',
        id: '@ebay/name/src/index.js',
        version: { major: 1, minor: 0, patch: 4 },
      },
    ],
    ['@ebay/lib1@1.a.1/src/index.js', null],
    ['lib1@2.1.1.2/src/index.js', null],
  ];

  testData.forEach(([moudleId, result]) => {
    console.log('Test module id: ', moudleId);
    const value = parseModuleId(moudleId);
    if (!result) expectEqual(value, null);
    else expectMatchObject(value, result);
  });

  console.log('Test success.');
} catch (err) {
  console.log('Test failed: ', err);
}
