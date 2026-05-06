import fs from 'fs-extra';
import path from 'path';
import { parseAst } from 'vite';
import _ from 'lodash';
import {
  getMuseIdByPath,
  getMuseModuleCode,
  getMuseModule,
  getLibNameByModule,
  isSharedMuseModule,
} from './utils.js';
import devUtils from '@ebay/muse-dev-utils/lib/utils.js';

// Virtual module IDs used to wire up shared module registration without circular self-imports.
// \0muse-virtual-entry  — wraps the real entry: imports actual entry then imports register module
// \0muse-shared-register — imports every collected lib module and calls MUSE_GLOBAL.__shared__.register()
export const MUSE_VIRTUAL_ENTRY = '\0muse-virtual-entry';
const MUSE_SHARED_REGISTER = '\0muse-shared-register';

// This helper is only used if a module has ExportAllDeclaration.
// Otherwise it gets exports meta directly from module info.
async function resolveExports(id, pluginContext) {
  // TODO?: improve performance.
  // The difficulty is: in a.js: export * from './b.js'; then if b.js is changed, result of a.js is also changed
  // So we can't cache the result by module id nor code.
  const info = pluginContext.getModuleInfo(id);
  if (!info?.code) return [];

  const ast = parseAst(info.code);
  const names = new Set();

  for (const node of ast.body) {
    if (node.type === 'ExportNamedDeclaration') {
      if (node.source) {
        // e.g. export { default as foo } from './bar' — recurse and also get the exported name
        node.specifiers.forEach((s) => names.add(s.exported.name));
      } else {
        // e.g. export { foo, bar }; export { foo } — just get the exported names
        node.specifiers?.forEach((s) => names.add(s.exported.name));

        // e.g. export const foo = 1; export function bar() {}; export class Baz {};
        node.declaration?.declarations?.forEach((d) => names.add(d.id.name));
        if (node.declaration?.id) names.add(node.declaration.id.name);
      }
    }
    if (node.type === 'ExportAllDeclaration' && node.source) {
      // e.g. export * from './bar' — recurse
      const subId = (await pluginContext.resolve(node.source.value, id)).id; //info.importedIds.find((i) => i.includes(node.source.value));
      const sub = await resolveExports(subId, pluginContext);
      sub.forEach((e) => names.add(e));
    }
    if (node.type === 'ExportDefaultDeclaration') {
      names.add('default');
    }
  }

  return [...names];
}

function museRolldownPlugin({ entryFile } = {}) {
  const pkgJson = devUtils.getPkgJson();
  const isLibPlugin = pkgJson?.muse?.type === 'lib';
  const usedSharedModules = {};
  const sharedModules = {};

  let makeSharedModulesReady;
  const sharedModulesReady = new Promise((r) => {
    makeSharedModulesReady = r;
  });
  // let debounceTimer;

  let viteConfig;

  const getLibManifest = async (pluginContext) => {
    const libManifestContent = {};
    if (viteConfig.command === 'serve') {
      // In serve mode, we can not collect shared module by "load" hook because of vite's pre-bundling,
      // so we need to merge the pre-generated lib manifest during deps optimization phase.
      const preBundleLibManifestPath = path.join(
        process.cwd(),
        'node_modules/.muse/dev/lib-manifest-pre-bundle.json',
      );
      if (fs.existsSync(preBundleLibManifestPath)) {
        const preBundleLibManifest = fs.readJsonSync(preBundleLibManifestPath);
        Object.assign(libManifestContent, preBundleLibManifest.content || {});
      }
    }

    for (const [mid, id] of Object.entries(sharedModules)) {
      if (libManifestContent[mid]?.exports) continue;
      // exports seems not used
      const info = pluginContext.getModuleInfo?.(id);

      let exports = [];
      try {
        exports = info?.exports || [];
      } catch (err) {
        console.log('error getting exports for module', id, info, err?.message);
      }
      if (exports?.includes('*')) {
        // This means the module re-exports everything from another module, we need to resolve it to get the real export names.
        exports = await resolveExports(id, pluginContext);
      }

      libManifestContent[mid] = { id: mid, exports: exports?.filter((name) => name !== '*') };
    }

    return {
      name: pkgJson.name,
      type: 'lib',
      count: Object.keys(libManifestContent).length,
      content: libManifestContent,
    };
  };

  const checkAndGenerateDevTimeLibManifest = _.debounce(async (pluginContext, filePath) => {
    if (isLibPlugin && viteConfig?.command === 'serve') {
      const libManifest = await getLibManifest(pluginContext);
      fs.outputFileSync(
        filePath || path.join(process.cwd(), 'node_modules/.muse/dev/lib-manifest.json'),
        JSON.stringify(libManifest, null, 2),
      );
      console.log(`Generated lib-manifest.json for serve mode2.`);
    }
  }, 30);

  const parsedModules = new Set();

  return {
    name: 'rolldown-plugin-muse',
    enforce: 'pre',
    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    },
    async resolveId(id) {
      if (id === MUSE_VIRTUAL_ENTRY || id === MUSE_SHARED_REGISTER) return id;
    },

    async load(id) {
      if (process.env.VITEST) return;

      // Virtual entry: imports the actual entry then the shared-register side-effect module.
      if (id === MUSE_VIRTUAL_ENTRY) {
        const actualEntryPath = path.resolve(process.cwd(), entryFile);
        return [
          `import ${JSON.stringify(actualEntryPath)};`,
          `import ${JSON.stringify(MUSE_SHARED_REGISTER)};`,
        ].join('\n');
      }
      // Shared-register module: emit import stubs for pre-scanned modules plus a sentinel.
      // The sentinel is replaced with the final register() call in renderChunk, after all
      // transform hooks have run and sharedModules is fully populated.
      if (id === MUSE_SHARED_REGISTER) {
        await sharedModulesReady;
        const entries = Object.entries(sharedModules);
        console.log();
        console.log('entries length: ', entries.length);
        const lines = ['const _all = {};'];
        entries.forEach(([, filePath], i) => {
          lines.push(`import * as m${i} from ${JSON.stringify(filePath)};`);
          lines.push(`_all['${getMuseIdByPath(filePath)}'] = m${i};`);
        });
        // Sentinel replaced by renderChunk once sharedModules is complete.
        lines.push(`MUSE_GLOBAL.__shared__.register(_all, (id) => _all[id]);\n`);
        return lines.join('\n');
      }

      // Consumer side: intercept imports of shared modules in normal plugins and return
      // a MUSE_GLOBAL.__shared__.require() wrapper instead of the real file.
      const museModule = getMuseModule(id);
      if (!museModule) return;
      usedSharedModules[museModule.id] = true; // this is to generate deps manifest
      const museCode = getMuseModuleCode(museModule);
      return museCode;
    },

    transform(code, id) {
      if (
        !isLibPlugin ||
        id.startsWith('\0') ||
        id.startsWith('/muse-assets/') ||
        id.startsWith('/@') ||
        id.includes('node_modules/.vite/deps/') ||
        id.includes('node_modules/vite/dist') ||
        // if the module is already a shared module, no need to register it as a shared module again
        isSharedMuseModule(id)
      ) {
        return;
      }

      if (viteConfig.command === 'serve' && (id.endsWith('.json') || id.endsWith('.json5'))) {
        // We don't share json asset at dev time since it's a bit complicated
        // But for build time, json used in a lib plugin are shared
        return;
      }

      setTimeout(() => {
        checkAndGenerateDevTimeLibManifest(this);
      }, 0);

      // clearTimeout(debounceTimer);
      // debounceTimer = setTimeout(makeSharedModulesReady, 50);

      const mid = getMuseIdByPath(id);
      sharedModules[mid] = id;

      // Registration is handled centrally by \0muse-shared-register — no per-module
      // code injection needed here. This avoids the circular self-import pattern that
      // produced an empty namespace in bundled ESM output.
    },

    moduleParsed(info) {
      parsedModules.add(info.id);

      // Walk the graph from the actual entry
      const queue = [path.resolve(process.cwd(), entryFile)];
      const visited = new Set();
      let complete = true;

      while (queue.length) {
        const id = queue.shift();
        if (visited.has(id)) continue;
        visited.add(id);

        if (!parsedModules.has(id)) {
          complete = false;
          break;
        }

        const info = this.getModuleInfo(id);
        if (!info) {
          complete = false;
          break;
        }

        for (const imp of info.importedIds) queue.push(imp);
      }

      if (complete && visited.size > 0) makeSharedModulesReady();
    },

    async generateBundle(options, bundle) {
      console.log();
      if (viteConfig.command === 'serve') {
        await checkAndGenerateDevTimeLibManifest(
          this,
          path.join(process.cwd(), 'node_modules/.muse/dev/lib-manifest-pre-bundle.json'),
        );
        return;
      }
      // Generate lib-manifest.json for lib plugins
      if (isLibPlugin) {
        const libManifest = await getLibManifest(this);
        this.emitFile({
          type: 'asset',
          fileName: 'lib-manifest.json',
          source: JSON.stringify(libManifest, null, 2),
        });

        // NOTE: generateBundle will be called for deps prebundling in serve mode,
        // this is necessary to generate lib-manifest for dev purpose
        console.log(
          'Lib manifest generated, provided ' +
            Object.keys(libManifest.content).length +
            ' shared modules',
        );
      }

      // Always generate deps manifest
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
        source: JSON.stringify(
          {
            name: pkgJson.name,
            type: pkgJson?.muse?.type || 'normal',
            count: Object.keys(usedSharedModules).length,
            content: depsManifestContent,
          },
          null,
          2,
        ),
      });
      console.log(
        'Deps manifest generated, used ' +
          Object.keys(usedSharedModules).length +
          ' shared modules',
      );

      // For css assets, insert them to the header as links so that they can be loaded before Muse app startst and avoid FOUC.
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
          cssInject += `MUSE_GLOBAL.waitFor(cssInject(new URL("${b.fileName}", import.meta.url)));\n`;
        }
      });
      const entryBundle = Object.values(bundle).find((b) => b.isEntry);
      if (!entryBundle) throw new Error('cant find entry bundle');
      entryBundle.code += `\n${cssInject}\n`;
    },
  };
}

export default museRolldownPlugin;
