try {
  const parseMuseId = require('./parseMuseId');
  const expectMatchObject = (obj1, obj2) => {
    for (const p in obj2) {
      const s1 = JSON.stringify(obj1[p]);
      const s2 = JSON.stringify(obj2[p]);
      if (s1 !== s2) {
        throw new Error(`Expected ${p} to be ${s2} but got ${s1}`);
      }
    }
  };
  const expectEqual = (a, b) => {
    if (a !== b) throw new Error(`Expected ${a} equals to ${b}`);
  };

  const testData = [
    [
      'pname-1.2@1.0.3/src/index.ts',
      {
        name: 'pname-1.2',
        path: 'src/index.ts',
        id: 'pname-1.2/src/index.ts',
        version: [1, 0, 3],
      },
    ],
    [
      '@ebay/pname-1.2@1.0.3/index.js',
      {
        name: '@ebay/pname-1.2',
        path: 'index.js',
        id: '@ebay/pname-1.2/index.js',
        version: [1, 0, 3],
      },
    ],
    [
      'name@1.0.4-beta.3/src/index.js',
      {
        name: 'name',
        path: 'src/index.js',
        id: 'name/src/index.js',
        version: [1, 0, 4],
        preRelease: 'beta.3',
      },
    ],
    [
      '@ebay/name@1.0.4-beta.3/src/index.js',
      {
        name: '@ebay/name',
        path: 'src/index.js',
        id: '@ebay/name/src/index.js',
        version: [1, 0, 4],
      },
    ],
    [
      'lib1@3.1.6-beta.1/src/index.js',
      {
        name: 'lib1',
        path: 'src/index.js',
        id: 'lib1/src/index.js',
        version: [3, 1, 6],
      },
    ],
    [
      'lib2@1.0.3/src/index.js',
      { name: 'lib2', path: 'src/index.js', id: 'lib2/src/index.js', version: [1, 0, 3] },
    ],
    [('@ebay/lib1@1.a.1/src/index.js', null)],
    ['lib1@2.1.1.2/src/index.js', null],
    [
      'lib1@2.1.1-alpha.1/src/index.js',
      {
        name: 'lib1',
        path: 'src/index.js',
        id: 'lib1/src/index.js',
        museId: 'lib1@2.1.1-alpha.1/src/index.js',
        version: [2, 1, 1],
        preRelease: 'alpha.1',
      },
    ],
  ];

  testData.forEach(([moudleId, result]) => {
    console.log('Test module id: ', moudleId);
    const value = parseMuseId(moudleId);
    if (!result) expectEqual(value, null);
    else expectMatchObject(value, result);
  });

  console.log('✅ Test parseMuseId succeeded.');
} catch (err) {
  console.log('❌ Test parseMuseId failed: ', err);
}
