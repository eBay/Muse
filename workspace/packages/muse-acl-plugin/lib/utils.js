const museCore = require('@ebay/muse-core');
const { uniq, concat } = require('lodash');

async function getAdminMembers(params = {}) {
  // TODO:
  return [];
}

async function getAppMembers({ appName } = {}) {
  const keyPath = `/apps/${appName}/${appName}.yaml`;
  const yamlBuffer = await museCore.storage.registry.get(keyPath);
  const content = await museCore.utils.jsonByYamlBuff(yamlBuffer);
  return content?.owners || [];
}

async function getPluginMembers({ pluginName } = {}) {
  const pluginId = museCore.utils.getPluginId(pluginName);
  const keyPath = `/plugins/${pluginId}.yaml`;
  const yamlBuffer = await museCore.storage.registry.get(keyPath);
  const content = await museCore.utils.jsonByYamlBuff(yamlBuffer);
  // merge the owners of the app from which the plugin were created to plugin's owner list.
  let ownedAppOwners = [];
  if (content?.app) {
    ownedAppOwners = await getAppMembers({ appName: content?.app });
  }
  return uniq(concat(content?.owners || [], ownedAppOwners));
}

function isMember(user, list) {
  return list?.includes?.(user);
}

function errorUnlessCan(allowed, authorizedRoles, object, operation, args = {}) {
  if (allowed) return;
  // do not show admin in exception
  authorizedRoles = Object.keys(authorizedRoles);
  const roles =
    authorizedRoles.length === 1 && authorizedRoles[0] === 'admin'
      ? authorizedRoles
      : authorizedRoles.filter(t => t !== 'admin');
  const err = new Error(
    `No permission. Only ${roles
      .map(
        word => word,
        // .toLowerCase()
        // .split('_')
        // .join(' '),
      )
      .join(', ')} can ${operation} ${object}.
      Details: ${JSON.stringify(args || {})}`,
  );
  err.statusCode = 403;
  throw err;
}

module.exports = {
  getAdminMembers,
  getAppMembers,
  getPluginMembers,
  isMember,
  errorUnlessCan,
};
