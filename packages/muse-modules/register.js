const globalThis = require('./globalThis');
const parseMuseId = require('./parseMuseId');
/**
 * Register modules to muse module system.
 *
 * @param {Object} modules Key value object for Muse modules.
 * @param {Function} __require__ used to require the actual module, for example: __webpack_require__
 */
function register(modules, __require__) {
  for (const mid in modules) {
    // If it's not muse module, continue
    if (!parseMuseId(mid)) continue;
    const m = modules[mid];
    globalThis.MUSE_GLOBAL.__shared__.modules[mid] = {
      id: mid,
      __require__,
    };
  }
}
module.exports = register;
