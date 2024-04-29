const fs = require('fs');
const path = require('path');
const muse = require('@ebay/muse-core');
const setupMuseDevServer = require('@ebay/muse-dev-utils/lib/setupMuseDevServer');
const { utils: devUtils } = require('@ebay/muse-dev-utils');
const museEsbuildPlugin = require('./museEsbuildPlugin');
const museRollupPlugin = require('./museRollupPlugin');

// We need to use originalUrl instead of url because the latter is modified by Vite 5+ (not modified in Vite 4)
// which causes server.middlewares.use(path, middleware) to not work as expected
const simpleRouteWrapperMiddleware = (path, middleware) => {
  return (req, res, next) => {
    if (!req?.originalUrl?.startsWith(path)) return next();
    req.url = req.originalUrl.replace(path, '');
    return middleware(req, res, next);
  };
};
module.exports = () => {
  let theViteServer;

  const musePluginVite = {
    name: 'muse-plugin-vite',
    museMiddleware: {
      app: {
        processMuseGlobal: (museGlobal) => {
          const pluginForDev = museGlobal.plugins.find((p) => p.dev);
          if (!pluginForDev) throw new Error(`Can't find dev plugin.`);
          const entry = devUtils.getEntryFile();
          if (!entry)
            throw new Error(
              'No entry found. There should be src/[index|main].[js|ts|jsx|tsx] file as entry.',
            );

          Object.assign(pluginForDev, { esModule: true, url: '/' + entry });
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
  return {
    name: 'muse-vite-plugin',
    config(config) {
      // Config https if possible
      if (!config.server) config.server = {};
      const server = config.server;
      if (!server.port && process.env.PORT) {
        server.port = process.env.PORT;
        // Prevent auto port so that it can be used with Muse Runner
        server.strictPort = true;
      }

      if (process.env.HTTPS === 'true') {
        if (!server.https) server.https = {};
        if (
          !server.https.cert &&
          !server.https.key &&
          fs.existsSync(sslCrtFile) &&
          fs.existsSync(sslKeyFile)
        ) {
          server.https.cert = fs.readFileSync(sslCrtFile);
          server.https.key = fs.readFileSync(sslKeyFile);
        }
      }

      if (!config.mode) {
        config.mode = 'development'; //process.env.NODE_ENV === 'production' ? 'production' : 'development';
      }

      // Esbuild config
      if (!config.optimizeDeps)
        config.optimizeDeps = {
          needsInterop: [],
          esbuildOptions: {
            plugins: [],
          },
        };

      if (!config.optimizeDeps.esbuildOptions) {
        config.optimizeDeps.esbuildOptions = {
          plugins: [],
        };
      }

      if (!config.optimizeDeps.esbuildOptions.plugins) {
        config.optimizeDeps.esbuildOptions.plugins = [];
      }

      if (!config.optimizeDeps.esbuildOptions.plugins.find((p) => p.name === 'muse-esbuild')) {
        config.optimizeDeps.esbuildOptions.plugins.unshift(museEsbuildPlugin());
      }

      // Rollup config
      if (!config.build) config.build = {};
      if (typeof config.build.sourcemap === 'undefined') config.build.sourcemap = true;
      config.build.outDir =
        process.env.MUSE_TEST_BUILD === 'true'
          ? 'build/test'
          : process.env.NODE_ENV === 'production'
          ? 'build/dist'
          : 'build/dev';
      if (!config.build.rollupOptions) config.build.rollupOptions = {};
      const entryFile = devUtils.getEntryFile();
      if (!entryFile) {
        throw new Error(
          'No entry file found. Please make sure you have a "src/[index|main].[jsx|tsx|js|ts]" file.',
        );
      }
      if (!config.build.rollupOptions.input) config.build.rollupOptions.input = entryFile;
      if (!config.build.rollupOptions.output) config.build.rollupOptions.output = {};
      Object.assign(config.build.rollupOptions.output, {
        entryFileNames: 'main.js',
        format: 'iife',
      });
      if (!config.build.rollupOptions.plugins) config.build.rollupOptions.plugins = [];
      if (!config.build.rollupOptions.plugins.find((p) => p.name === 'muse-rollup')) {
        config.build.rollupOptions.plugins.unshift(museRollupPlugin());
      }
    },

    configureServer(server) {
      theViteServer = server;
      try {
        // when hot reload, vite will call configureServer again, so don't repeat muse plugin registration
        muse.plugin.register(musePluginVite);
      } catch (err) {}
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
  };
};
