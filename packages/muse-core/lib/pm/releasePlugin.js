// Release a plugin:
// core feature:
//   Create a release item in <registry-storage>/plugins/releases/<plugin-name>.yaml
// other:
// ...
const fs = require('fs-extra');
const yaml = require('js-yaml');
const path = require('path');
const { asyncInvoke, jsonByBuff, getPluginId } = require('../utils');
const { registry } = require('../storage');

module.exports = async (params) => {
  const ctx = {};
  await asyncInvoke('museCore.pm.beforeReleasePlugin', ctx, params);

  const { pluginName, buildDir, version, author } = params;
  const pid = getPluginId(pluginName);
  const releasesKeyPath = `/plugins/releases/${pid}.yaml`;
  // Get existing releases
  const releasesObj = jsonByBuff(await registry.get(releasesKeyPath)) || { releases: [] };
  if (releasesObj.releases.find((r) => r.version === version)) {
    throw new Error(`Plugin ${pluginName} version ${version} already exists.`);
  }

  ctx.release = {
    version: version || '1.0.0',
    branch: '',
    sha: '',
    createdAt: Date.now(),
    author,
    description: '',
    info: (await fs.readJson(path.join(buildDir, 'info.json'), { throws: false })) || {},
  };

  // TODO: upload resources to static storage

  await asyncInvoke('museCore.pm.releasePlugin', ctx, params);

  releasesObj.releases.unshift(ctx.release);
  if (releasesObj.releases.length > 50) {
    // TODO: archive old releases?
    // Keep up to 50 releases
    releasesObj.releases.length = 50;
  }

  // Save releases to registry
  await registry.set(
    releasesKeyPath,
    Buffer.from(yaml.dump(releasesObj)),
    `Create release ${pluginName}@${version} by ${author}`,
  );
  await asyncInvoke('museCore.pm.afterReleasePlugin', ctx, params);
};
