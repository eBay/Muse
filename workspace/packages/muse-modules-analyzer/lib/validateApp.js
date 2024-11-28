const validateDeployment = require('./validateDeployment');

/**
 * Validate if all plugins have all required shared modules.
 * @param {*} appName
 * @param {*} envName
 * @param {*} mode
 * @returns
 */
async function validateApp(appName, envName, mode) {
  if (typeof appName === 'object') {
    ({ appName, envName, mode } = appName);
  }
  // Use a tricky to validate all plugins on app by empty deployment.
  return await validateDeployment(appName, envName, [], mode);
}

module.exports = validateApp;
