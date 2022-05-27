// let globalThis;
// try {
//   globalThis = this || new Function('return this')();
// } catch (e) {
//   if (typeof window === 'object') globalThis = typeof window !== 'undefined' ? window : global;
// }
// globalThis.__muse_shared_modules__ = { modules: {}, cache: {} };

module.exports = window;
