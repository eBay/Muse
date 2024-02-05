const muse = require('@ebay/muse-core');
const setupMuseDevServer = require('@ebay/muse-dev-utils/lib/setupMuseDevServer');

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

module.exports = () => {
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
            server.middlewares.use(m.path, m.middleware);
          } else {
            server.middlewares.use(m);
          }
        });
      };
    },
  };
};
