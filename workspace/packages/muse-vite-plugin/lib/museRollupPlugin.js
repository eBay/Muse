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
    generateBundle(options, bundle) {
      // For css assets, insert them to the header link
      let cssInject = `\nconst cssInject = (fileName) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = fileName;
  document.head.appendChild(link);
  return new Promise((resolve, reject) => {
    link.onload = resolve;
    link.onerror = reject;
  });
}\n`;
      Object.values(bundle).forEach((b) => {
        if (b.fileName?.endsWith('.css') && b.type === 'asset') {
          cssInject += `MUSE_GLOBAL.waitFor(cssInject(new URL("${b.fileName}",import.meta.url)));\n`;
        }
      });
      const entryBundle = Object.values(bundle).find((b) => b.isEntry);
      if (!entryBundle) throw new Error('cant find entry bundle');
      entryBundle.code += `\n${cssInject}\n`;
      // Generate deps manifest for deployment validation
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
