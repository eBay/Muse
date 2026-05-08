# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Overview

`@ebay/muse-vite-plugin` is a Vite plugin that enables MUSE's shared module system for Vite-based builds. It integrates with MUSE's lib plugin architecture to provide runtime shared dependencies, avoiding duplicate bundles across micro-frontend plugins.

**Key responsibilities:**
1. Intercept module resolution for shared dependencies from lib plugins
2. Generate `lib-manifest.json` (lib plugins) and `deps-manifest.json` (normal plugins) tracking shared module usage
3. Configure Vite dev server with MUSE middleware for local development
4. Handle CSS injection for runtime-loaded stylesheets
5. Support both ESM and CommonJS module formats

## Development Commands

```bash
# Link package globally for local development
pnpm link -g

# In a plugin project, link this package
pnpm link @ebay/muse-vite-plugin

# Start Vite dev server (from plugin project)
NODE_PATH=./node_modules vite --host

# Lint code
pnpm eslint lib/
```

**Note:** This package has no build step. It exports ES modules directly from `lib/`.

## Architecture

### Plugin Composition

The plugin consists of two integrated sub-plugins returned as an array from `museVitePlugin()`:

1. **`museVitePlugin()`** (lib/museVitePlugin.js) - Main Vite plugin
   - Configures Vite server, build settings, and module resolution
   - Registers MUSE middleware for dev server
   - Manages lib server lifecycle for watch mode builds
   - Instantiates and passes `rolldownPluginInstance` to both `optimizeDeps` and `build`

2. **`museRolldownPlugin()`** (lib/museRolldownPlugin.js) - Rolldown build-time plugin
   - Implements the virtual entry / virtual register module pattern for lib plugins
   - Intercepts shared module imports in normal plugins
   - Collects shared modules via `transform`, signals graph completion via `moduleParsed`
   - Generates `lib-manifest.json` and `deps-manifest.json`
   - Injects CSS loading code into the entry bundle

The `museEsbuildPlugin` mentioned in older documentation no longer exists. Rolldown is used for both `optimizeDeps` pre-bundling and production builds via `rolldownOptions`.

### Shared Module Resolution Flow

**Development mode (`vite serve`):**
```
Import request → load() hook → getMuseModule() → Check lib-manifest.json →
Return MUSE_GLOBAL.__shared__.require() wrapper
```

**Production build (`vite build`):**
```
Import request → Rolldown load() hook → getMuseModule() → Check lib-manifest.json →
Return MUSE_GLOBAL.__shared__.require() wrapper → Track in usedSharedModules →
Generate deps-manifest.json
```

### Key Files

- **lib/museVitePlugin.js:25-210** - Main plugin, server configuration, middleware setup, lib server lifecycle
- **lib/museRolldownPlugin.js:60-322** - Rolldown plugin: virtual modules, shared module collection, manifest generation
- **lib/utils.js** - Module resolution (`getMuseModule()`), code generation (`getMuseModuleCode()`), manifest path resolution
- **lib/libServer.js** - Static file server for lib plugin watch mode builds

### Build Modes and Output Directories

The plugin recognizes three build modes (configured via Vite's `config.mode`):

| Mode | Output Directory | Purpose |
|------|------------------|---------|
| `production` | `build/dist` | Production deployments |
| `development` | `build/dev` | Development builds |
| `e2e-test` | `build/test` | E2E testing |

Configured in lib/museVitePlugin.js:20-24.

### Lib Plugin Build: Virtual Entry Pattern

For lib plugins, the build input is redirected from the real entry file to a virtual module to avoid a circular self-import when appending the shared module registration call.

**Build input** (lib/museVitePlugin.js:132):
- Normal plugins: `entryFile` (real entry, e.g. `src/index.ts`)
- Lib plugins: `\0muse-virtual-entry` (virtual)

**`\0muse-virtual-entry`** (lib/museRolldownPlugin.js:143-149) generates:
```js
import "/abs/path/to/src/index.ts";
import "\0muse-shared-register";
```

**`\0muse-shared-register`** (lib/museRolldownPlugin.js:153-166) generates:
```js
const _all = {};
import * as m0 from "/abs/path/to/moduleA.js";
_all['pkg@1.0.0/moduleA.js'] = m0;
import * as m1 from "/abs/path/to/moduleB.js";
_all['pkg@1.0.0/moduleB.js'] = m1;
MUSE_GLOBAL.__shared__.register(_all, (id) => _all[id]);
```

The static `import * as m` syntax is required to obtain module namespace objects that Rolldown bundles.

### Shared Module Graph Completion Signal

**Problem:** Rolldown resolves the two imports in `\0muse-virtual-entry` concurrently. The `\0muse-shared-register` load hook fires before all `transform` hooks for the real entry's dependency graph complete, so `sharedModules` is not yet fully populated.

**Solution:** A deferred promise + `moduleParsed` BFS traversal (lib/museRolldownPlugin.js:66-69, 212-240):

```js
// Deferred promise
let makeSharedModulesReady;
const sharedModulesReady = new Promise((r) => { makeSharedModulesReady = r; });

// moduleParsed: fires after each module's load+transform complete
moduleParsed(info) {
  parsedModules.add(info.id);
  // BFS from actualEntry through importedIds
  // When every reachable node is in parsedModules → makeSharedModulesReady()
}

// load for \0muse-shared-register:
await sharedModulesReady; // suspends until moduleParsed signals graph is complete
```

`\0muse-shared-register`'s `load` hook suspends on `await sharedModulesReady`. After each module is parsed, a BFS walks `importedIds` from `actualEntry`. When every reachable node is in `parsedModules`, `makeSharedModulesReady()` is called, unblocking the load hook with `sharedModules` fully populated.

The BFS starts from `actualEntry` (not `\0muse-virtual-entry`), so the virtual modules themselves are excluded from the traversal and do not cause false positives.

See `shared_modules_solution.md` for a detailed write-up of the problem, failed approaches, and the final solution.

### Manifest System

**lib-manifest.json** (generated by lib plugins in `generateBundle`):
```json
{
  "name": "muse-lib-react",
  "type": "lib",
  "count": 2,
  "content": {
    "react@18.2.0/index.js": {
      "id": "react@18.2.0/index.js",
      "exports": ["default", "useState", "useEffect"]
    }
  }
}
```

**deps-manifest.json** (generated by all plugins in `generateBundle`):
```json
{
  "name": "my-plugin",
  "type": "normal",
  "count": 2,
  "content": {
    "muse-lib-react@1.0.0": [
      "react@18.2.0/index.js",
      "react-dom@18.2.0/client.js"
    ]
  }
}
```

In serve mode, `lib-manifest.json` is written to `node_modules/.muse/dev/lib-manifest.json` during watch builds and copied there by `closeBundle` (lib/museVitePlugin.js:193-206).

### Module Code Generation

When a shared module is detected in a normal plugin's imports, the plugin generates wrapper code instead of bundling the real file:

**For ESM modules:**
```javascript
const m = MUSE_GLOBAL.__shared__.require("react@18.2.0/index.js");
export const useState = m.useState;
export const useEffect = m.useEffect;
export default m.default || m;
```

**For CommonJS default exports:**
```javascript
const m = MUSE_GLOBAL.__shared__.require("lodash@4.17.21/index.js");
module.exports = m.default;
```

See lib/utils.js `getMuseModuleCode()`.

### Development Server Integration

The plugin integrates with MUSE dev server via two mechanisms:

1. **MUSE middleware registration** (lib/museVitePlugin.js:148-165)
   - Calls `setupMuseDevServer()` from `@ebay/muse-dev-utils`
   - Wraps middleware with `simpleRouteWrapperMiddleware` to handle Vite 5+ URL behavior
   - Provides endpoints for app management and asset serving

2. **MUSE plugin registration** (lib/museVitePlugin.js:32-55)
   - Registers `museMiddleware.app.processMuseGlobal` hook
   - Sets `esModule: true` flag for dev plugins
   - Transforms index.html via `theViteServer.transformIndexHtml()`

### Lib Server (Watch Mode)

When a lib plugin is built in watch mode (`vite build --watch`), the plugin starts a local static file server (`lib/libServer.js`) to serve the build output to linked normal plugins during development.

Lifecycle (lib/museVitePlugin.js:176-206):
- `buildStart`: starts the lib server, signals build started
- `buildEnd`: signals build finished (even on error) so the server stops holding requests
- `closeBundle`: copies `build/dev/lib-manifest.json` → `node_modules/.muse/dev/lib-manifest.json`

### Linked Library Support

During development, lib plugins can be linked locally using `pnpm link`. The plugin handles this by:

1. **Alias resolution** (lib/museVitePlugin.js:89-98)
   - In `serve` mode, creates Vite aliases for linked libs
   - Maps package names to local filesystem paths

2. **Manifest path resolution** (lib/utils.js)
   - Linked: `node_modules/.muse/dev/lib-manifest.json`
   - Released: `build/{mode}/lib-manifest.json`

### CSS Injection

For CSS assets generated during build, the plugin appends runtime loading code to the entry bundle in `generateBundle` (lib/museRolldownPlugin.js:299-317):

```javascript
const cssInject = (fileName) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = fileName;
  document.head.appendChild(link);
  return new Promise((resolve, reject) => {
    link.onload = resolve;
    link.onerror = reject;
  });
}
MUSE_GLOBAL.waitFor(cssInject(new URL("style.css", import.meta.url)));
```

This ensures CSS is loaded before plugin initialization completes, preventing FOUC.

### HTTPS/SSL Support

The plugin supports HTTPS for local development:

- **Enable:** Set `HTTPS=true` environment variable
- **Certificate paths:**
  - Default: `./node_modules/.muse/certs/muse-dev-cert.{crt,key}`
  - Override: `SSL_CRT_FILE` and `SSL_KEY_FILE` env vars

Configured in lib/museVitePlugin.js:57-114.

## Important Implementation Details

### Version Matching Strategy

The plugin uses **major version matching** for shared modules (lib/utils.js):
```javascript
config.matchVersion = 'major';
```

This means `react@18.2.0` and `react@18.3.5` are considered compatible, enabling more aggressive deduplication.

### Module Format Detection

A module is treated as ESM if (lib/utils.js):
1. Root package has `"type": "module"` in package.json
2. File extension is `.mjs`
3. File extension is `.ts` or `.tsx`

This determines whether to generate ESM or CommonJS wrapper code.

### Custom Libraries Exclusion

Plugins can exclude specific dependencies from shared module resolution via `package.json`:
```json
{
  "muse": {
    "customLibs": ["my-private-lib"]
  }
}
```

### Vite 5+ URL Handling

Vite 5+ modifies `req.url` internally, breaking Express middleware path matching. The plugin works around this by:
1. Using `req.originalUrl` instead of `req.url`
2. Wrapping middleware with `simpleRouteWrapperMiddleware`

See lib/museVitePlugin.js:12-18.

### `transform` Exclusion Rules

The `transform` hook skips modules that should not be registered as shared (lib/museRolldownPlugin.js:178-195):
- Not a lib plugin build
- Virtual modules (id starts with `\0`)
- MUSE asset paths (`/muse-assets/`, `/@`)
- Vite internals (`node_modules/.vite/deps/`, `node_modules/vite/dist`)
- Already-shared modules (detected by `isSharedMuseModule()`)
- JSON/JSON5 files in serve mode (too complex for dev-time sharing)

## Common Modifications

### Adding New Build Modes

To add a new build mode:
1. Add entry to `buildDir` object (lib/museVitePlugin.js:20-24)
2. Add the corresponding entry in `lib/utils.js` build dir map

### Changing Module Resolution Behavior

Module resolution logic is in `getMuseModule()` (lib/utils.js):
- Modify `findRoot()` to change how package roots are detected
- Update `findMuseModule()` call to change version matching strategy
- Add filters before returning to exclude certain modules

### Customizing Generated Code

Code generation happens in `getMuseModuleCode()` (lib/utils.js):
- Modify ESM template for different export patterns
- Adjust CommonJS logic for edge cases

### Adding Dynamic Import Support to Graph Traversal

The `moduleParsed` BFS (lib/museRolldownPlugin.js:212-240) currently only follows `importedIds` (static imports). To include dynamic imports, also iterate `moduleInfo.dynamicallyImportedIds` in the BFS loop.

## Related Packages

- **@ebay/muse-core** - Provides `MUSE_GLOBAL.__shared__.require()` and `register()` runtime
- **@ebay/muse-dev-utils** - Provides `setupMuseDevServer()`, `getMuseLibs()`, `getEntryFile()`, `getPkgJson()`
- **@ebay/muse-modules** - Provides `findMuseModule()` for version matching
- **@ebay/muse-webpack-plugin** - Equivalent functionality for Webpack builds

## Testing Strategy

This package has no unit tests (`"test": "echo \"Error: no test specified\" && exit 1"`).

Testing is performed via:
1. **Integration tests** in `muse-ci-tools` (see root CLAUDE.md)
2. **Manual testing** by linking into plugin projects and running Vite dev server
3. **Production validation** by building plugins and checking generated manifests
