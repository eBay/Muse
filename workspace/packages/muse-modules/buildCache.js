const parseMuseId = require('./parseMuseId');

/* 
  Group modules by module's id (pkgName/path) to support multiple versions.
  For example:
  cache: {
    'loadash/lib/get.js': [
      { moduleId: 'lodash@1.0.1/lib/get.js, name, version, ...},
      { moduleId: 'lodash@4.0.0/lib/get.js, name, version, ...},
    ]
  }
*/
function buildCache(obj) {
  if (!obj.cache) obj.cache = {};
  if (!obj.modules) obj.modules = {};

  Object.keys(obj.modules).forEach((mid) => {
    const m = parseMuseId(mid);
    if (!m) return;
    if (!obj.cache[m.id]) obj.cache[m.id] = [];
    obj.cache[m.id].push(m);
  });
}

module.exports = buildCache;
