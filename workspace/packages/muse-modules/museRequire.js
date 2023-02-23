const findMuseModule = require('./findMuseModule');

var __muse_module_cache__ = {};
module.exports = (museId) => {
  // Check if module is in cache
  var cachedModule = __muse_module_cache__[museId];
  if (!cachedModule) {
    museModule = cachedModule;
    __muse_module_cache__[museId] = findMuseModule(museId);
  }

  // Use module's require method to get the final module
  const m = __muse_module_cache__[museId];
  if (!m) throw new Error('Muse shared module not found: ' + museId);

  return m.__require__(m.id);
};
