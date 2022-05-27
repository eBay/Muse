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
        const entryModules = Array.from(compilation.modules).filter((m) => this.entries.includes(m.rawRequest));
        const result = new ConcatSource(source.source());
        //         result.add(`
        // //
        // // NOTE: if multiple Muse libs, any version of find method may be used
        //         `);
        if (this.options.type === 'lib') {
          result.add('// For lib plugins, share all modules by MUSE_GLOBAL.\n');
          result.add(`MUSE_GLOBAL.__shared__.register(__webpack_modules__, __webpack_require__);\n`);
          //           result.add(`
          // if (!g.__muse_shared_modules__) {
          //   g.__muse_shared_modules__ = {};
          //   Object.defineProperty(g.__muse_shared_modules__, 'cache', { writable: true, value: null });
          //   Object.defineProperty(g.__muse_shared_modules__, 'find', { writable: true, value: null });
          // }
          // for (const p in __webpack_modules__) {
          //   if (!p.includes('@')) continue;
          //   const m = __webpack_modules__[p];
          //   g.__muse_shared_modules__[p] = {
          //     id: p,
          //     __webpack_require__: __webpack_require__,
          //   };
          // }
          // g.__muse_shared_modules__.cache = null;
          // g.__muse_shared_modules__.find = __webpack_exports__;

          // `);
        }

        // result.add('const arr = MUSE_GLOBAL && MUSE_GLOBAL.pluginEntries || [];');
        entryModules
          .map((m) => m.buildInfo.museData.id)
          .forEach((mid) => {
            result.add(
              `MUSE_GLOBAL.pluginEntries.push({ id: "${mid}", func: () => __webpack_require__("${mid}") });\n`,
            );
          });

        return result;
      });
    });
  }
}

module.exports = MuseEntryPlugin;
