import fs from 'fs';
import { transformWithEsbuild } from 'vite';
import path from 'path';
import muse from '@ebay/muse-core';
import setupMuseDevServer from '@ebay/muse-dev-utils/lib/setupMuseDevServer.js';
import devUtils from '@ebay/muse-dev-utils/lib/utils.js';
import museEsbuildPlugin from './museEsbuildPlugin.js';
import museRollupPlugin from './museRollupPlugin.js';
import { getMuseModuleCode, mergeObjects, getMuseModule } from './utils.js';

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

  const vitePlugin = {
    name: 'muse-vite-plugin',
    config(config) {
      const isHTTPS = process.env.HTTPS === 'true';
      const port = process.env.PORT;
      const host = config.server?.host || process.env.MUSE_LOCAL_HOST_NAME || 'localhost';
      const pkgJson = devUtils.getPkgJson();
      const entryFile = devUtils.getEntryFile();

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
        server: {
          host,
          // only port is set it can determin the full origin
          // it needs origin when used by muse-runner
          origin: port ? `${isHTTPS ? 'https' : 'http'}://${host}:${port}` : undefined,
          port,
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
          outDir: buildDir[config.mode || 'production'],
          rollupOptions: {
            input: entryFile,
            output: {
              entryFileNames: pkgJson.muse.type === 'boot' ? 'boot.js' : 'main.js',
              format: 'es',
            },
            plugins: !config.build?.rollupOptions?.plugins?.find((p) => p.name === 'muse-rollup')
              ? [museRollupPlugin()]
              : [],
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
    load(id) {
      // If pre-bundling is disabled, or if the module is from a dev time lib plugin
      // then we need this hook to find possible Muse shared module
      const museModule = getMuseModule(id);

      if (!museModule) return;
      const museCode = getMuseModuleCode(museModule, 'esm');

      if (museCode) {
        return museCode;
      }
      return null;
    },
  };

  // Special support for Vitest:
  // It needs to transform JSX to JS from Muse library plugins.
  // To be backward compatible, all React compoennts file extension is `.js` rather than `.jsx`
  // So we need to treat all js files as jsx files
  if (process.env.VITEST) {
    const libPlugins = devUtils.getMuseLibs();
    vitePlugin.transform = async (code, id) => {
      if (
        libPlugins.some((p) => id.startsWith(`${p.path}/src/`)) &&
        (id.endsWith('.js') || id.endsWith('.jsx') || id.endsWith('.ts') || id.endsWith('.tsx'))
      ) {
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        });
      }
    };
  }
  return vitePlugin;
}
