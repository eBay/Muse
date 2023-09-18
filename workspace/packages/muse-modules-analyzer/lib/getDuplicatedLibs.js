const getLibs = require('./getLibs');
/**
 * Get duplicated shared pkgs of plugins. If a plugin has multiple lib plugins dependencies, it
 * could be optimized potentially if there's overlapped shared pkgs.
 *
 * @param {*} plugins
 * @param {*} mode
 */
async function getDuplicatedLibs(plugins, mode = 'dist') {
  const pkgs = {};
  const allLibs = await Promise.all(
    plugins.map(async (p) => {
      return await getLibs(p.name, p.version, mode);
    }),
  );

  allLibs.forEach((lib) => {
    Object.entries(lib.packages).forEach(([name, { version }]) => {
      if (!pkgs[name]) pkgs[name] = [];
      pkgs[name].push({
        name: lib.name,
        version,
      });
    });
  });

  for (const name in pkgs) {
    if (pkgs[name].length === 1) {
      delete pkgs[name];
    }
  }
  return pkgs;
}

module.exports = getDuplicatedLibs;
