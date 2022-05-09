// boot plugin is used to load other plugins based on the app config
import { loadInParallel, getPluginId } from './utils';

async function start() {
  const {
    cdn = '',
    pluginList = [],
    entry = 'muse-react',
    pluginEntries = [],
    appEntries = [],
    isDev = false,
  } = window.MUSE_GLOBAL;
  window.MUSE_CONFIG = window.MUSE_GLOBAL;
  window.MUSE_GLOBAL.getUser = () => ({});

  // Print app plugins in dev console
  const bootPlugin = pluginList.find((p) => p.type === 'boot');
  if (!bootPlugin) {
    throw new Error('Boot plugin not found.');
  }
  console.log(`Loading Muse app by ${bootPlugin.name}@${bootPlugin.version}...`);
  console.log(`Plugins(${pluginList.length}):`);
  pluginList.forEach((p) => console.log(`  * ${p.name}@${p.version}`));

  // Load plugins bundles
  const pluginUrls = pluginList
    .filter((p) => p.type !== 'boot')
    .map((p) => p.url || `${cdn}/p/${getPluginId(p.name)}/v${p.version}/${isDev ? 'dev' : 'dist'}/main.js`);

  // Load plugin bundles
  await loadInParallel(pluginUrls);

  // Init plugins
  console.log('Execution plugin entries...');
  pluginEntries.forEach((entry) => entry.func());

  // Start the application
  const entryApp = appEntries.find((e) => e.name === entry);
  console.log(`Starting the app from ${entry}...`);
  await entryApp.func();
}

start()
  .then(() => {
    console.log(`Muse app started.`);
  })
  .catch((err) => {
    console.log('Failed to start app.');
    console.error(err);
  });
