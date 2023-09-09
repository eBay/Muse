const _ = require('lodash');
const SharedModulesAnalyzer = require('./SharedModulesAnalyzer');

const analyzer = new SharedModulesAnalyzer();

module.exports = async () => {
  // const sharedLibs = await analyzer.getSharedModules('@ebay/muse-lib-react', '1.2.13', 'dist');
  // console.log(sharedLibs.packages);
  // const deps = await analyzer.getLibDeps('@ebay/muse-layout-antd', '1.1.11', 'dist');

  // console.log(deps);

  // await analyzer.verifyPlugin('@ebay/muse-layout-antd', '1.1.11');

  const result = await analyzer.verifyDeployment('musemanager', 'staging');
  console.log(result);
};
