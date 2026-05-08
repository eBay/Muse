/**
 * Vite plugin to eagerly load all modules in the dependency graph
 * during development mode
 */
export default function vitePluginEagerLoad() {
  let server;
  let moduleGraph = new Set();

  return {
    name: 'vite-plugin-eager-load',
    apply: 'serve', // Only apply in dev mode

    configureServer(_server) {
      server = _server;

      // After server starts, crawl and warmup all modules
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/') {
          // Trigger module graph collection on first page load
          setTimeout(() => {
            collectAndWarmupModules(server);
          }, 100);
        }
        next();
      });
    },

    transformIndexHtml(html) {
      // Inject preload links for all discovered modules
      if (moduleGraph.size > 0) {
        const preloadLinks = Array.from(moduleGraph)
          .map(mod => `<link rel="modulepreload" href="${mod}">`)
          .join('\n');

        return html.replace('</head>', `${preloadLinks}\n</head>`);
      }
      return html;
    },
  };
}

async function collectAndWarmupModules(server) {
  const visited = new Set();
  const queue = ['./src/index.jsx']; // Start from entry point

  while (queue.length > 0) {
    const id = queue.shift();

    if (visited.has(id)) continue;
    visited.add(id);

    try {
      // Transform the module to discover its imports
      const module = await server.transformRequest(id);

      if (module) {
        const moduleNode = server.moduleGraph.getModuleById(id);

        if (moduleNode) {
          // Add to module graph for preloading
          moduleGraph.add(moduleNode.url);

          // Collect all imported modules
          for (const imported of moduleNode.importedModules) {
            if (imported.id && !imported.id.includes('node_modules')) {
              queue.push(imported.id);
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to transform ${id}:`, error.message);
    }
  }

  console.log(`Eagerly loaded ${visited.size} modules`);
}
