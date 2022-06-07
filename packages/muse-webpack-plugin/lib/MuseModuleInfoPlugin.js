'use strict';
const { getUsedModuleIdsAndModules } = require('webpack/lib/ids/IdHelpers');
const path = require('path');
const fs = require('fs');

const pkgJsonCache = {};
// Add muse info to module's buildInfo
class MuseModuleInfoPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('MuseModuleInfoPlugin', (compilation) => {
      compilation.hooks.beforeModuleIds.tap('MuseModuleInfoPlugin', () => {
        const [, modules] = getUsedModuleIdsAndModules(compilation);
        for (const module of modules) {
          // if a module is used by a loader, then it's a loader module, should not be shared
          // remove first two chars because some rawReqest starts with '!!'
          if (!module.request || module.rawRequest?.slice(2).includes('!')) continue;

          const rrd = module.resourceResolveData;
          const dfd = rrd?.descriptionFileData;
          let pkgJson = dfd;

          // Need special logic to get correct descriptionFileData
          // For example: @babel/runtime/helpers/esm/toArray.js. Its descriptionFileData is just { type: 'module' }
          if (
            dfd &&
            dfd.type === 'module' &&
            (!dfd.version || !dfd.name) &&
            module.request &&
            path.isAbsolute(module.request)
          ) {
            // if package.json is just used for claim esm module, then need to find the correct package info
            let p = module.request;
            const arrPaths = [p];
            while (!p.endsWith(`${path.sep}node_modules`)) {
              if (pkgJsonCache[p]) {
                pkgJson = pkgJsonCache[p];
                break;
              }
              const pkgJsonPath = path.join(p, 'package.json');
              if (fs.existsSync(pkgJsonPath)) {
                try {
                  const json = JSON.parse(fs.readFileSync(pkgJsonPath));
                  if (json.name && json.version) {
                    // it's a normal package.json
                    json._pkg_context = p;
                    pkgJson = json;
                    break;
                  }
                } catch (err) {
                  console.log('warning: failed to read ', pkgJsonPath);
                }
              }
              p = path.resolve(p, '..');
              arrPaths.push(p);
            }
            if (pkgJson) {
              arrPaths.forEach((s) => {
                pkgJsonCache[s] = pkgJson;
              });
            }
          }

          if (pkgJson && pkgJson.name && pkgJson.version) {
            const relativePath = pkgJson._pkg_context
              ? module.request.replace(pkgJson._pkg_context, '')
              : rrd?.relativePath;

            const museModuleId = `${pkgJson.name}@${pkgJson.version}/${relativePath
              .replace(/[\/]/g, '/')
              .replace(/^\.?[\/]/, '')}`;
            module.buildInfo.museData = {
              id: museModuleId,
            };
          }
        }
      });
    });
  }
}

module.exports = MuseModuleInfoPlugin;
