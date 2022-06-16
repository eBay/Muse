const { asyncInvoke, jsonByYamlBuff } = require('../utils');
const { registry } = require('../storage');
const { validate } = require('schema-utils');
const schema = require('../schemas/am/getApp.json');

/**
 * @module muse-core/am/getApp
 */

/**
 * @description get conetent of <appName>.yaml
 * @param {string} appName the app name
 * @returns {object} appObject
 */

module.exports = async (appName) => {
  validate(schema, appName);
  const ctx = {};
  await asyncInvoke('museCore.am.beforeGetApp', ctx, appName);

  try {
    const keyPath = `/apps/${appName}/${appName}.yaml`;
    ctx.app = jsonByYamlBuff(await registry.get(keyPath));
    await asyncInvoke('museCore.am.getApp', ctx, appName);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedGetApp', ctx, appName);
    throw err;
  }
  await asyncInvoke('museCore.am.afterGetApp', ctx, appName);
  return ctx.app;
};

// module.exports = async () => {
//   return {
//     name: 'testapp',
//     envs: {
//       staging: {
//         url: '',
//         pluginList: [
//           { name: '@ebay/muse-boot', type: 'boot', version: '1.0.0' },
//           { name: '@ebay/muse-react', version: '1.0.0' },
//           { name: '@ebay/muse-antd', version: '1.0.0' },
//           { name: 'muse-layout', version: '1.0.0' },
//         ],
//       },
//     },
//   };
// };
