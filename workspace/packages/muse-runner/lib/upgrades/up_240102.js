// Upgrade in 20240102
import _ from 'lodash';
import Conf from 'conf';
const config = new Conf({
  projectName: process.env.MUSE_RUNNER_CONFIG_NAME || 'muse-runner-ebay',
});

export default function upgrade240102() {
  console.log('Checking config data...');
  // upgrade plugin config data structure
  if (config.get('pluginDir') && !config.get('plugins')) {
    console.log('Updating config data...');
    const pluginDir = config.get('pluginDir');
    const linkedPlugins = config.get('linkedPlugins') || {};
    const plugins = _.mapValues(pluginDir, (value, key) => ({
      dir: value,
      linkedPlugins: linkedPlugins[key] || undefined,
    }));

    config.set('plugins', plugins);
    config.delete('pluginDir');
    config.delete('linkedPlugins');
    console.log('Config data updated.');
  }
}
