import { $ } from 'zx';
import { asyncInvoke } from '../utils.js';

const start = async () => {
  await $`muse create-app app1`;
  await asyncInvoke('mainFlow.appCreated', { appName: 'app1' });

  await $`muse create-env app1 env1`;
  await asyncInvoke('mainFlow.envCreated', { appName: 'app1', envName: 'env1' });

  await $`muse deploy app1 staging @ebay/muse-boot-default @ebay/muse-lib-react`;
  await asyncInvoke('mainFlow.pluginDeployed', {
    appName: 'app1',
    envName: 'staging',
    plugins: ['@ebay/muse-boot-default', '@ebay/muse-lib-react'],
  });

  // create a plugin
  await $`muse create-plugin plugin1`;
  await asyncInvoke('mainFlow.pluginCreated', { pluginName: 'plugin1' });

  // Create plugin project
  await $`muse create-plugin-project plugin1 project1`;

  // build a plugin
};

export default start;
