const fs = require('fs');
const path = require('path');
const muse = require('@ebay/muse-core');
const setupMuseDevServer = require('@ebay/muse-dev-utils/lib/setupMuseDevServer');
const { utils: devUtils } = require('@ebay/muse-dev-utils');
const museEsbuildPlugin = require('./museEsbuildPlugin');
const museRollupPlugin = require('./museRollupPlugin');
const { mergeObjects } = require('./utils');

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
      const entryFile = devUtils.getEntryFile();
      if (!entryFile) {
        throw new Error(
          'No entry file found. Please make sure you have a "src/[index|main].[jsx|tsx|js|ts]" file.',
        );
      }
      mergeObjects(config, {
        mode: 'production',
        server: {
          port: process.env.PORT,
          strictPort: !!process.env.PORT,
          https: process.env.HTTPS === 'true' &&
            fs.existsSync(sslCrtFile) &&
            fs.existsSync(sslKeyFile) && {
              cert: fs.readFileSync(sslCrtFile),
              key: fs.readFileSync(sslKeyFile),
            },
        },
        optimizeDeps: {
          needsInterop: [],
          esbuildOptions: {
            plugins: !config.optimizeDeps?.esbuildOptions?.plugins?.find(
              (p) => p.name === 'muse-esbuild',
            )
              ? [museEsbuildPlugin()]
              : [],
          },
        },
        build: {
          sourcemap: true,
          outDir: buildDir[config.mode],
          rollupOptions: {
            input: entryFile,
            output: {
              entryFileNames: 'main.js',
              format: 'iife',
            },
            plugins: !config.build?.rollupOptions?.plugins?.find((p) => p.name === 'muse-rollup')
              ? [museRollupPlugin()]
              : [],
          },
        },
      });
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
  };
};
