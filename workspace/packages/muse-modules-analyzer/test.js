const _ = require('lodash');
const SharedModulesAnalyzer = require('./SharedModulesAnalyzer');

const analyzer = new SharedModulesAnalyzer();

module.exports = async () => {
  // const sharedLibs = await analyzer.getSharedModules('@ebay/muse-lib-react', '1.2.13', 'dist');
  // console.log(sharedLibs.packages);
  // const deps = await analyzer.getDeps('@ebay/muse-layout-antd', '1.1.11', 'dist');

  // console.log(deps);

  // await analyzer.verifyPlugin('@ebay/muse-layout-antd', '1.1.11');

  // const result = await analyzer.validateDeployment(
  //   'musemanager',
  //   'staging',
  //   [
  //     {
  //       pluginName: '@ebay/muse-lib-react',
  //       version: '1.2.13',
  //       // type: 'remove',
  //     },
  //   ],
  //   'dist',
  // );

  // const result = await analyzer.validateApp(
  //   'musemanager',
  //   'staging',
  //   [
  //     {
  //       pluginName: '@ebay/muse-lib-react',
  //       version: '1.2.13',
  //       // type: 'remove',
  //     },
  //   ],
  //   'dist',
  // );
  // console.log(result.missingModules);

  const result = await analyzer.validateApp('museadmin', 'staging', 'dist');
  console.log(result.dist.changedModules);
  console.log(result.dist.missingModules.length > 0 ? '❌ Failed.' : '✅ Passed.');

  // const result = await analyzer.getDuplicatedLibs([
  //   {
  //     name: '@ebay/muse-lib-cc-compatible',
  //     version: '1.2.3',
  //   },
  //   {
  //     name: '@ebay/muse-lib-chart-compatible',
  //     version: '1.2.3',
  //   },
  //   {
  //     name: '@ebay/muse-lib-antd-compatible',
  //     version: '1.2.3',
  //   },
  // ]);

  // console.log(JSON.stringify(result, null, 2));
  // console.log(result);
};
