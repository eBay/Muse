# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Purpose

`@ebay/muse-core` is the singleton runtime for the MUSE micro-frontends platform. It manages apps, plugins, storage, and data for MUSE-based applications. All operations go through one shared instance — `lib/index.js` patches `Module.prototype.require` to enforce this singleton guarantee.

## Commands

```bash
# Run all tests
pnpm test

# Run a single test file
pnpm test -- lib/am/createApp.test.js

# Run tests matching a pattern
pnpm test -- --testPathPattern=createApp

# Run a single test by name
pnpm test -- --testNamePattern="should create app"

# Generate TypeScript declarations
pnpm gen-dts
```

## Architecture

### Entry Point and Singleton Pattern

`lib/index.js` is the only entry point. It enforces a singleton by monkey-patching `Module.prototype.require` so any `require('@ebay/muse-core')` always returns the same module export. **Never `require` internal paths directly from outside this package.**

Initialization sequence on first `require`:
1. Loads `.muse.env` (from cwd or `$HOME`)
2. Loads config via cosmiconfig
3. Runs `initPlugins.js` — registers built-in and user-configured plugins
4. Exposes the six subsystems: `am`, `pm`, `req`, `data`, `storage`, `plugin`

### Subsystems

| Export | Module | Purpose |
|--------|--------|---------|
| `museCore.am` | `lib/am/` | App Manager — CRUD for apps and environments |
| `museCore.pm` | `lib/pm/` | Plugin Manager — lifecycle for plugins and releases |
| `museCore.req` | `lib/req/` | Request tracker — async operation status tracking |
| `museCore.data` | `lib/data/` | Data layer — cached views over registry/assets |
| `museCore.storage` | `lib/storage/` | Storage abstraction — registry, assets, cache backends |
| `museCore.plugin` | `js-plugin` | Direct access to the js-plugin engine |

### Plugin System (`lib/plugins/`)

Built-in muse-core plugins are registered in `lib/initPlugins.js`. Each plugin implements `js-plugin` extension points. The extension point naming convention is hierarchical dot-notation:

- `museCore.registry.storage.get` / `.set` / `.del` / etc. — registry backend
- `museCore.assets.storage.get` / `.set` / etc. — assets backend
- `museCore.data.cache.get` / `.set` / `.del` — data cache
- `museCore.data.getBuilders` — contribute additional data builders
- `museCore.processMuse` — extend the `museCore` object itself
- `onReady` — called after all plugins are loaded

Built-in plugins (all auto-registered unless overridden):
- `registryFileStoragePlugin` — filesystem registry backend (default)
- `assetsFileStoragePlugin` — filesystem assets backend (default)
- `assetsLruCachePlugin` — LRU memory cache in front of assets storage
- `dataCachePlugin` — cache layer for data layer results
- `environmentVariablesPlugin` — per-app/per-plugin env variable management
- `registrySchemaPlugin` — validates registry entries against JSON schemas

### Storage Layer (`lib/storage/`)

`Storage` (base class) wraps all reads/writes through `js-plugin` extension points, enabling drop-in replacement of backends. Three storage instances are exposed:

- `museCore.storage.registry` — YAML files for app/plugin metadata
- `museCore.storage.assets` — binary blobs for plugin bundles
- `museCore.storage.cache` — key-value cache (optional)

Registry key structure (parsed by `utils.parseRegistryKey`):
```
apps/<appName>/<appName>.yaml          → app metadata
apps/<appName>/<env>/<plugin>.yaml     → deployed plugin config
plugins/<plugin>.yaml                  → plugin metadata
plugins/releases/<plugin>.yaml         → release history
requests/<id>.yaml                     → async request records
```

### Data Layer (`lib/data/`)

The data layer provides computed, cached views assembled from raw storage. It uses a **builder pattern**: each builder registers a key (or `match` function) and a `get` method.

Built-in builders: `muse.app`, `muse.app-by-url`, `muse.apps`, `muse.plugin`, `muse.plugins`, `muse.plugin-releases`, `muse.plugins.latest-releases`, `muse.request`, `muse.requests`.

External plugins can add builders via the `museCore.data.getBuilders` extension point.

Key API:
```js
museCore.data.get('muse.app')           // get from cache or build
museCore.data.refreshCache('muse.app')  // force rebuild and update cache
museCore.data.handleDataChange('registry', changedKeys)  // invalidate affected cache
```

### Configuration (`lib/config.js`)

Loaded once at startup via cosmiconfig. Search order: `.muserc`, `.muserc.json`, `.muserc.yaml`, `muse.config.yaml`, `muse.config.js`, `muse.config.cjs`, `muse.config.json`. Search stops at `process.cwd()`.

Override the config file with `MUSE_CONFIG_FILE` env var. Config values can reference env vars using `$env.VAR_NAME` syntax.

Supports `extends` for base config inheritance.

### Utility Helpers (`lib/utils.js`)

Key utilities used throughout the codebase:

- `asyncInvoke(extPoint, ...args)` — call all plugins implementing an extension point sequentially
- `asyncInvokeFirst(extPoint, ...args)` — call only the first plugin implementing an extension point
- `wrappedAsyncInvoke(extPath, method, ...args)` — wraps a storage operation with `before*`/`after*`/`failed*` hooks
- `batchAsync(tasks, { size, msg })` — runs async tasks in batches to avoid overwhelming I/O
- `makeRetryAble(fn, { times, checker })` — wraps a function with automatic retry logic
- `validate(schema, data)` — AJV schema validation with caching

### JSON Schemas (`lib/schemas/`)

Every public API method validates its arguments using a corresponding JSON schema in `lib/schemas/`. Schemas are organized by subsystem (`am/`, `pm/`, `req/`) and for core data types (`app.json`, `plugin.json`, `deployedPlugin.json`, etc.).

### Testing

Tests co-locate with source files as `*.test.js`. The `lib/__mocks__/` directory provides mock implementations of `fs` and `fs/promises` using `memfs`. `lib/setupTests.js` runs before each test suite.

Tests use Jest with a 30-second timeout. The `clearMocks: true` config resets all mocks between tests automatically.
