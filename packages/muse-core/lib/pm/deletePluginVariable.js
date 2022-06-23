const updatePlugin = require('./updatePlugin');
const { getPluginId, osUsername } = require('../utils');

module.exports = async (pluginName, variables, appName, envName = 'staging') => {
  const ctx = {};
  try {
    const pid = getPluginId(pluginName);
    if (!pid) {
      throw new Error(`Plugin ${pluginName} doesn't exist.`);
    }

    ctx.changes = {
      unset: [],
    };

    if (variables) {
      for (const vari of variables) {
        ctx.changes.unset.push(`variables.${vari}`);
      }

      await updatePlugin({
        pluginName,
        appName,
        envName,
        changes: ctx.changes,
        author: osUsername,
        msg: `Delete environment variables ${variables} for ${pluginName} ${
          appName ? ` on ${appName}${envName ? `/${envName}` : ''}` : ''
        }  by ${osUsername}.`,
      });
    }
  } catch (err) {
    ctx.error = err;
    throw err;
  }
};
