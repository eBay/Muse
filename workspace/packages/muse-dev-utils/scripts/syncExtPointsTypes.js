const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const { utils, storage, data: museData } = require('@ebay/muse-core');

/**
 * @description Sync ext-points.d.ts files for the specified plugins or all deployed plugins on the app.
 * The ext-points.d.ts files are downloaded from the storage service and saved to the local file system.
 * The files are saved in the .ext-points-types folder in the root of the project.
 * The file name is the pluginId.d.ts.
 * The file is overwritten if it already exists.
 * The version number is added as a comment in the first line of the file.
 * Usage:
 *  pnpm sync-ext-points-types [pluginName@version] [pluginName@version] ...
 */
module.exports = async function syncExtPointsTypeFiles() {
  // Analyze the plugins's version and get the corresponding ext-points.d.ts file
  const pkg = fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8');
  const pkgJson = JSON.parse(pkg);
  const app = pkgJson.muse?.devConfig?.app;
  const env = pkgJson.muse?.devConfig?.env;
  if (!app || !env) {
    console.log(chalk.red('Error: app or env not specified in "muse.devConfig" in package.json.'));
    return;
  }

  const pluginNameArgs = process.argv.slice(3);
  if (pluginNameArgs.length === 0) {
    // no plugin specified, download all deployed plugins
    console.log(
      chalk.cyan(
        `No plugin specified. Will download each ext-points.d.ts for all deployed plugins on app "${app}" in env "${env}".`,
      ),
    );
    const appRegistryData = await museData.get(`muse.app.${app}`);
    if (!appRegistryData) {
      console.log(
        chalk.red(
          `Error: app "${app}" does not exist. Please check your muse.devConfig.app in package.json.`,
        ),
      );
      return;
    }
    const deployedPlugins = appRegistryData?.envs?.[env]?.plugins;
    if (!deployedPlugins || deployedPlugins.length === 0) {
      console.log(
        chalk.red(`Error: app "${app}" does not have any deployed plugins in env "${env}".`),
      );
      return;
    }

    for (const plugin of deployedPlugins) {
      const pluginName = plugin.name;
      const pluginVersion = plugin.version;
      await downloadExtPointsTypesFile(pluginName, pluginVersion);
    }
  } else {
    // plugin specified, dowload for the specified plugins
    console.log(chalk.cyan('Downloading ext-points.d.ts for plugin: ', pluginNameArgs.join(', ')));
    const pluginsLatestRelease = await museData.get(`muse.plugins.latest-releases`);
    const regex = /^(@?[^@]+)@(.+)$/; // match pluginName@version
    for (const plugin of pluginNameArgs) {
      const match = plugin.match(regex);
      const pluginName = match?.[1] || plugin;
      const version = match?.[2] || pluginsLatestRelease?.[plugin]?.version;
      if (!version) {
        console.log(
          chalk.yellow(
            `Warning: The plugin "${pluginName}" could not locate a version number. Skipping this plugin`,
          ),
        );
        continue;
      }
      await downloadExtPointsTypesFile(pluginName, version);
    }
  }
};

/**
 * Download ext-point-type.d.ts file for the plugin
 * @param {string} pluginName
 * @param {string} pluginVersion
 * @returns
 */
async function downloadExtPointsTypesFile(pluginName, pluginVersion) {
  let res;
  try {
    res = await storage.assets.get(
      `/p/${utils.getPluginId(pluginName)}/v${pluginVersion}/dev/ext-points.d.ts`,
    );
  } catch (e) {
    console.log(
      chalk.red(`Error: failed to download file ext-point-type.d.ts for plugin "${pluginName}".`),
    );
    return;
  }
  if (!res) {
    console.log(
      chalk.yellow(`Warn: file ext-points.d.ts for plugin "${pluginName}" does not exist.`),
    );
    return;
  }
  const dir = path.join(process.cwd(), '.ext-points-types');
  mkdirp.sync(dir);
  const filePath = path.join(dir, `${utils.getPluginId(pluginName)}.d.ts`);
  // delete the file first
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  // write to file .ext-points-types/<plugin>.d.ts
  // Add the version number in the top comment
  res = `// Version: ${pluginVersion}\n${res}`;
  fs.writeFileSync(filePath, res, 'utf-8');
  console.log(chalk.cyan(`File written: ${filePath}`));
}
