import fs from 'fs-extra';
import path from 'path';
import muse from '@ebay/muse-core';
import setupMuseDevServer from '@ebay/muse-dev-utils/lib/setupMuseDevServer.js';
import devUtils from '@ebay/muse-dev-utils/lib/utils.js';
import museRolldownPlugin from './museRolldownPlugin.js';
import { mergeObjects, setViteMode } from './utils.js';
import startLibServer from './libServer.js';

// We need to use originalUrl instead of url because the latter is modified by Vite 5+ (not modified in Vite 4)
// which causes server.middlewares.use(path, middleware) to not work as expected
const simpleRouteWrapperMiddleware = (path, middleware) => {
  return (req, res, next) => {
    if (!req?.originalUrl?.startsWith(path)) return next();
    req.url = req.originalUrl.replace(path, '');
    return middleware(req, res, next);
  };
};

const buildDir = {
  production: 'build/dist',
  development: 'build/dev',
  'e2e-test': 'build/test',
};
export default function museVitePlugin() {
  const entryFile = devUtils.getEntryFile(); //'/@muse-virtual-entry/' +
  const pkgJson = devUtils.getPkgJson();
  const isLibPlugin = pkgJson?.muse?.type === 'lib';
  let theViteServer;
  // Shared rolldown plugin instance used by both the dev server load hook and the build pipeline.
  // const devServerRolldownPlugin = museRolldownPlugin();
  const musePluginVite = {
    name: 'muse-plugin-vite',
    museMiddleware: {
      app: {
        processMuseGlobal: (museGlobal) => {
          const pluginForDev = museGlobal.plugins.find((p) => p.dev);
          if (!pluginForDev) throw new Error(`Can't find dev plugin.`);
          if (!entryFile)
            throw new Error(
              'No entry found. There should be src/[index|main].[js|ts|jsx|tsx] file as entry.',
            );

          Object.assign(pluginForDev, {
            esModule: true,
            url: entryFile,
          });
        },
        processIndexHtml: async (ctx) => {
          // This is to get the vite server to transform the index.html
          ctx.indexHtml = await theViteServer.transformIndexHtml(ctx.req.url, ctx.indexHtml);
        },
      },
    },
  };

  const sslCrtFile =
    process.env.SSL_CRT_FILE ||
    path.join(process.cwd(), './node_modules/.muse/certs/muse-dev-cert.crt');
  const sslKeyFile =
    process.env.SSL_KEY_FILE ||
    path.join(process.cwd(), './node_modules/.muse/certs/muse-dev-cert.key');

  const rolldownPluginInstance = museRolldownPlugin({});
  const vitePlugin = {
    name: 'muse-vite-plugin',
    config(config, { command, mode }) {
      const isHTTPS = process.env.HTTPS === 'true';
      const port = process.env.PORT;
      const host = config.server?.host || process.env.MUSE_LOCAL_HOST_NAME || 'localhost';
      const pkgJson = devUtils.getPkgJson();

      setViteMode(mode || 'production');

      if (!entryFile) {
        throw new Error(
          'No entry file found. Please make sure you have a "src/[index|main].[jsx|tsx|js|ts]" file.',
        );
      }

      const configToBeMerged = {
        base: './',
        define: {
          __MUSE_PLUGIN_NAME__: JSON.stringify(pkgJson.name),
        },
        resolve: {
          // For linked libs, should make the folder alias of the package
          // alias is only used at dev time
          alias:
            command === 'serve'
              ? devUtils
                  .getMuseLibs()
                  .filter((lib) => lib.isLinked)
                  .reduce((acc, lib) => {
                    acc[lib.name] = lib.path;
                    return acc;
                  }, {})
              : {},
        },
        server: {
          host,
          // only port is set it can determin the full origin
          // it needs origin when used by muse-runner
          origin: port ? `${isHTTPS ? 'https' : 'http'}://${host}:${port}` : undefined,
          port,
          cors: true,

          strictPort: !!port,
          https: process.env.HTTPS === 'true' &&
            fs.existsSync(sslCrtFile) &&
            fs.existsSync(sslKeyFile) && {
              cert: fs.readFileSync(sslCrtFile),
              key: fs.readFileSync(sslKeyFile),
            },
        },

        optimizeDeps: {
          needsInterop: [],
          force: true,
          rolldownOptions: {
            input: entryFile,
            plugins: [rolldownPluginInstance],
          },
        },
        build: {
          minify: false,
          sourcemap: true,
          outDir: buildDir[config.mode || 'production'],
          rolldownOptions: {
            input: entryFile,
            treeshake: false,
            output: {
              entryFileNames: pkgJson.muse.type === 'boot' ? 'boot.js' : 'main.js',
              format: 'es',
              codeSplitting: false,
            },
            // plugins: [rolldownPluginInstance],
          },
        },
      };
      // NOTE: mergeObjects is a helper function that merges two objects recursively
      // it only set the values if the key doesn't exist in the first object
      // that's why not return a partial config object used by vite plugin config hook
      mergeObjects(config, configToBeMerged);
    },

    configureServer(server) {
      theViteServer = server;
      try {
        // when hot reload, vite will call configureServer again, so don't repeat muse plugin registration
        muse.plugin.register(musePluginVite);
      } catch (err) {} // eslint-disable-line
      return () => {
        // setupMuseDevServer() returns an array of middlewares
        // It's kind of hack since setupMuseDevServer was originally designed for webpack
        return setupMuseDevServer([]).forEach((m) => {
          if (typeof m === 'object') {
            server.middlewares.use(simpleRouteWrapperMiddleware(m.path, m.middleware));
          } else {
            server.middlewares.use(m);
          }
        });
      };
    },

    handleHotUpdate({ file, server }) {
      // for entry file, no HMR but full reload
      // This is IMPORTANT for Muse plugin
      if (file === path.join(process.cwd(), entryFile)) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },

    buildStart() {
      // if under watch mode and it's lib plugin, start the lib server
      if (isLibPlugin && this.meta.watchMode) {
        startLibServer();
      }
    },

    closeBundle() {
      // when under watch mode and it's lib plugin, copy lib-manifest.json to the node_modules/.muse/dev folder for dev time usage
      if (!isLibPlugin || !this.meta.watchMode) return;
      const src = path.join(process.cwd(), 'build/dev/lib-manifest.json');
      const dest = path.join(process.cwd(), 'node_modules/.muse/dev/lib-manifest.json');
      if (fs.existsSync(src)) {
        fs.outputFileSync(dest, fs.readFileSync(src));
        console.log('Copied lib-manifest.json to node_modules/.muse/dev/');
      } else {
        console.log(
          'Warning: lib-manifest.json not found in build/dev/, make sure the lib plugin is built successfully.',
        );
      }
    },
  };

  return [vitePlugin, rolldownPluginInstance];
}
