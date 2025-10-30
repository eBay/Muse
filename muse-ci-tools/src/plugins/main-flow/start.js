import { $ } from 'zx';
import { asyncInvoke } from '../../utils.js';

/**
 * - create app `app1`
 * - create env `env1` for app `app1`
 * - deploy plugins `@ebay/muse-boot-default` and `@ebay/muse-lib-react` to env `staging` of app `app1`
 * - create plugin `plugin1`
 *
 * Extesion points:
 * - mainFlow.appCreated
 * - mainFlow.envCreated
 * - mainFlow.pluginDeployed
 * - mainFlow.pluginCreated
 */

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
  // await $`muse create-plugin-project plugin1 project1`;

  // build a plugin
};

export default start;
