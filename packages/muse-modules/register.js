const globalThis = require('./globalThis');

/**
 * Register modules to muse module system.
 *
 * @param {Object} modules Key value object for Muse modules.
 * @param {Function} __require__ used to require the actual module, for example: __webpack_require__
 */
function register(modules, __require__) {
  for (const p in modules) {
    // If it's not muse module, continue
    if (!p.includes('@')) continue;
    const m = modules[p];
    globalThis.MUSE_GLOBAL.__shared_modules__.modules[p] = {
      id: p,
      __require__,
    };
  }
}
module.exports = register;
