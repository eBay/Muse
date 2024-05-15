import jsPlugin from 'js-plugin';
test('plugin register should succeed', async () => {
  await import('./index.js');
  expect(jsPlugin.getPlugin('@ebay/muse-layout-antd').name).toBe('@ebay/muse-layout-antd');
});
