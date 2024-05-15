import { getMuseModuleCode, getMuseModule, getLibNameByModule } from './utils.js';

export default function museRollupPlugin() {
  let usedSharedModules = {};
  return {
    name: 'muse-rollup',
    buildStart() {
      usedSharedModules = {};
    },
    load(filepath) {
      const museModule = getMuseModule(filepath);
      if (!museModule) return;
      usedSharedModules[museModule.id] = true;
      const museCode = getMuseModuleCode(museModule);
      return museCode;
    },
    generateBundle() {
      const depsManifestContent = {};
      for (const id in usedSharedModules) {
        const libName = getLibNameByModule(id);
        if (!libName) {
          throw new Error('cant find lib name for module', id);
        }
        if (!depsManifestContent[libName]) depsManifestContent[libName] = [];
        depsManifestContent[libName].push(id);
      }
      this.emitFile({
        type: 'asset',
        fileName: 'deps-manifest.json',
        source: JSON.stringify({ content: depsManifestContent }, null, 2),
      });
    },
  };
}
