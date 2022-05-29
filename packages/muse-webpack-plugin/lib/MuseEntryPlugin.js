'use strict';

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
      hooks.renderStartup.tap('MuseEntryPlugin', (source) => {
        const entryModules = Array.from(compilation.modules).filter((m) => this.entries.includes(m.rawRequest));
        const result = new ConcatSource(source.source());

        if (this.options.type === 'lib') {
          result.add('// For lib plugins, share all modules by MUSE_GLOBAL.\n');
          result.add(`MUSE_GLOBAL.__shared__.register(__webpack_modules__, __webpack_require__);\n`);
        }

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
