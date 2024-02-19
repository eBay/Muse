const muse = require('@ebay/muse-core');
const setupMuseDevServer = require('@ebay/muse-dev-utils/lib/setupMuseDevServer');

// We need to use originalUrl instead of url because the latter is modified by Vite 5+ (not modified in Vite 4)
// which causes server.middlewares.use(path, middleware) to not work as expected
const simpleRouteWrapperMiddleware = (path, middleware) => {
  return (req, res, next) => {
    console.log('req.original', req.originalUrl, path);
    if (!req?.originalUrl?.startsWith(path)) return next();
    console.log('matched');
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
          Object.assign(pluginForDev, { esModule: true, url: '/src/index.js' });
        },
        processIndexHtml: async (ctx) => {
          // This is to get the vite server to transform the index.html
          ctx.indexHtml = await theViteServer.transformIndexHtml(ctx.req.url, ctx.indexHtml);
        },
      },
    },
  };

  return {
    name: 'muse-vite-plugin',
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
