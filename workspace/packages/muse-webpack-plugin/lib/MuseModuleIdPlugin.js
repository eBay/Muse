'use strict';
const { compareModulesByPreOrderIndexOrIdentifier } = require('webpack/lib/util/comparators');
const { getUsedModuleIdsAndModules } = require('webpack/lib/ids/IdHelpers');

/**
 * Based on original webpack's NaturalModuleIdsPlugin here: https://github.com/webpack/webpack/blob/main/lib/ids/NaturalModuleIdsPlugin.js
 *
 * In this plugin, we use npm package info as module id
 */
class MuseModuleIdsPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('MuseModuleIdsPlugin', (compilation) => {
      compilation.hooks.moduleIds.tap('MuseModuleIdsPlugin', () => {
        const chunkGraph = compilation.chunkGraph;
        const [usedIds, modules] = getUsedModuleIdsAndModules(compilation);
        const modulesInNaturalOrder = modules.sort(compareModulesByPreOrderIndexOrIdentifier(compilation.moduleGraph));
        for (const module of modulesInNaturalOrder) {
          if (!module.buildInfo?.museData?.id) continue;
          const moduleId = module.buildInfo.museData.id;
          chunkGraph.setModuleId(module, moduleId);
          usedIds.add(moduleId);
        }
      });
    });
  }
}

module.exports = MuseModuleIdsPlugin;
