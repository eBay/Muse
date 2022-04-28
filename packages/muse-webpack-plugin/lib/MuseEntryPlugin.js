/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

'use strict';

const RuntimeGlobals = require('webpack/lib/RuntimeGlobals');
const { ConcatSource } = require('webpack-sources');
const EntryDependency = require('webpack/lib/dependencies/EntryDependency');
const JavascriptModulesPlugin = require('webpack/lib/javascript/JavascriptModulesPlugin');
const MuseModuleFactory = require('./MuseModuleFactory');
const MuseEntryDependency = require('./MuseEntryDependency');

class MuseEntryPlugin {
  constructor(context, entries, options) {
    this.context = context;
    this.entries = entries;
    this.options = options;
    if (this.entries.length !== 1) throw new Error('Muse plugin only supports one entry point.');
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('MuseEntryPlugin', (compilation, { normalModuleFactory }) => {
      const museModuleFactory = new MuseModuleFactory();
      compilation.dependencyFactories.set(MuseEntryDependency, museModuleFactory);
      compilation.dependencyFactories.set(EntryDependency, normalModuleFactory);
    });
    compiler.hooks.make.tapAsync('MuseEntryPlugin', (compilation, callback) => {
      compilation.addEntry(
        this.context,
        new MuseEntryDependency(
          this.entries.map((e, idx) => {
            const dep = new EntryDependency(e);
            dep.loc = {
              name: this.options.name,
              index: idx,
            };
            return dep;
          }),
          this.options.name,
        ),
        this.options,
        callback,
      );
    });

    compiler.hooks.thisCompilation.tap('MuseEntryPlugin', (compilation) => {
      const hooks = JavascriptModulesPlugin.getCompilationHooks(compilation);
      hooks.renderStartup.tap('MuseEntryPlugin', (source, module, renderContext) => {
        const entryModule = Array.from(compilation.modules).find(
          (m) => this.entries[0] === m.rawRequest,
        );
        const result = new ConcatSource(source.source());
        result.add('// Expose the method from Muse lib to find Muse modules\n');
        result.add('// NOTE: if multiple Muse libs, any version of find method may be used\n');
        result.add(`var globalThis = ${RuntimeGlobals.global}\n`);
        result.add(
          `if (!globalThis.__muse_shared_modules__) {
  globalThis.__muse_shared_modules__ = {};
  Object.defineProperty(globalThis.__muse_shared_modules__, 'cache', { writable: true, value: null });
  Object.defineProperty(globalThis.__muse_shared_modules__, 'find', { writable: true, value: null });
}
for (const p in __webpack_modules__) {
  if (!p.includes('@')) continue;
  const m = __webpack_modules__[p];
  globalThis.__muse_shared_modules__[p] = {
    id: p,
    __webpack_require__: __webpack_require__,
  };
}
globalThis.__muse_shared_modules__.cache = null;
`,
        );
        result.add(`globalThis.__muse_shared_modules__.find = __webpack_exports__;`);
        result.add(
          `window.MUSE_LIB_ENTRIES && window.MUSE_LIB_ENTRIES.push(() => {__webpack_exports__('${entryModule.buildInfo.museData.id}')})`,
        );
        return result;
      });
    });
  }
}

module.exports = MuseEntryPlugin;
