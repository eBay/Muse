# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MUSE is a micro-frontends solution from eBay that allows breaking down large SPA applications into independently developed, tested, built, and deployed plugins. This is a monorepo containing core packages, build tools, UI plugins, and CI infrastructure.

## Repository Structure

This is a multi-workspace repository with three main areas:

- **`workspace/packages/`** - Core npm packages (18 packages including muse-core, muse-cli, muse-runner, etc.)
- **`ui-plugins/`** - Official UI component plugins (muse-boot-default, muse-lib-react, muse-lib-antd, etc.)
- **`muse-ci-tools/`** - Testing and CI infrastructure
- **`muse-site/`** - Docusaurus documentation site
- **`examples/`** - Example plugin implementations

## Common Commands

### Development

```bash
# Install dependencies (from workspace/)
cd workspace && pnpm install

# Run tests for core packages (from workspace/)
cd workspace/packages/muse-core && pnpm test

# Start documentation site
cd muse-site && pnpm start

# Build documentation
cd muse-site && pnpm build
```

### CI Testing

```bash
# Run full integration tests in Docker (from muse-ci-tools/)
cd muse-ci-tools && pnpm docker:run

# Run demo in clean environment
cd muse-ci-tools && pnpm docker:demo

# Start local npm registry for testing
cd muse-ci-tools && pnpm start-local-registry
```

**IMPORTANT**: Never run `muse-ci-tools/src/index.js` directly locally as it modifies source code. Always use `pnpm docker:run` which runs tests in a containerized environment.

### Working with Workspace Packages

The workspace uses pnpm workspaces. Package dependencies use `workspace:^` protocol.

```bash
# Build a specific package (if it has a build script)
cd workspace/packages/muse-webpack-plugin && pnpm build

# Run tests for a specific package
cd workspace/packages/muse-core && pnpm test
```

## Architecture Overview

### Core Architecture Pattern

MUSE uses a layered architecture with these key components:

1. **Core Runtime (`muse-core`)** - Singleton module managing plugins, storage, app/env lifecycle
2. **CLI (`muse-cli`)** - Command-line interface for app/plugin management
3. **Runner (`muse-runner`)** - Development server with hot reloading and WebSocket updates
4. **Build Plugins** - `muse-webpack-plugin`, `muse-vite-plugin` for shared module integration
5. **Middleware (`muse-express-middleware`)** - Production serving of apps
6. **Storage** - Pluggable backends (file, git, S3) for registry and assets

### Plugin System

MUSE is built on [js-plugin](https://github.com/rekit/js-plugin), a lightweight (~150 lines) plugin engine inspired by Eclipse's extension points.

**Key concept**: Extension points are property paths in plugin objects. Plugins contribute to extension points, and consumers collect contributions via `jsPlugin.invoke('extension.point.name')`.

**File reference**: `workspace/packages/muse-core/lib/plugins/index.js`

### Plugin Types

There are four plugin types with specific loading order and capabilities:

| Type | Purpose | Load Order | Can Share Modules |
|------|---------|------------|-------------------|
| **boot** | Bootstraps app, loads other plugins | First | No |
| **init** | Pre-initialization (auth, analytics) | Parallel with boot | No |
| **lib** | Provides shared modules (React, Redux) | Before normal | Yes (provides) |
| **normal** | Business features | After lib | Yes (consumes) |

**Bootstrap flow**:
```
index.html → boot plugin → init plugins (parallel) → lib + normal plugins (parallel) → app entry
```

**File reference**: `workspace/packages/muse-core/lib/schemas/pm/createPlugin.json`

### Storage Architecture

MUSE uses two storage types:

1. **Registry Storage** - Metadata (apps, envs, plugin configs) in YAML format
2. **Assets Storage** - Plugin bundles (JS, static files)

Both support pluggable backends:
- File system (default)
- Git (`muse-plugin-git-storage`)
- S3 (`muse-plugin-s3-storage`)

**Storage structure**:
```
muse-storage/
├── registry/
│   ├── apps/<app-name>/<app-name>.yaml
│   ├── apps/<app-name>/<env>/<plugin>.yaml
│   └── plugins/releases/<plugin>.yaml
└── assets/
    └── p/<plugin-name>/v<version>/
        ├── dist/main.js
        └── dev/main.js
```

**File references**:
- `workspace/packages/muse-core/lib/storage/FileStorage.js`
- `workspace/packages/muse-plugin-git-storage/lib/GitStorage.js`

### Shared Modules System

**Key innovation**: Lib plugins provide shared modules at runtime to avoid duplicate dependencies.

**Build artifacts**:
- `lib-manifest.json` - Modules exported by lib plugins
- `deps-manifest.json` - Dependencies of normal plugins

The webpack/vite plugins use these manifests to:
1. Mark lib plugin modules as externals in normal plugins
2. Generate runtime module resolution code

**File references**:
- `workspace/packages/muse-webpack-plugin/lib/index.js:56-120`
- `workspace/packages/muse-vite-plugin/lib/museVitePlugin.js`

### App/Environment Model

- **App**: Logical grouping with metadata and multiple environments
- **Environment**: Deployment stage (staging, prod) with specific plugin versions

**API methods** (from `muse-core`):
```js
museCore.am.getApp(appName)
museCore.am.createApp(appName)
museCore.am.createEnv(appName, envName)
museCore.pm.deployPlugin(appName, env, plugin, version)
```

**File reference**: `workspace/packages/muse-core/lib/am/`

### Data Layer

MUSE includes a caching layer for performance:

```js
museCore.data.get(key)           // Get from cache or builder
museCore.data.refreshCache(key)  // Rebuild cache
```

**File reference**: `workspace/packages/muse-core/lib/data/index.js`

## Development Workflow

### Creating and Deploying Plugins

1. **Create plugin**: `muse create-plugin <name>` - Registers in registry
2. **Build plugin**: Run build command in plugin directory (creates dist/ and dev/)
3. **Release plugin**: `muse release <plugin> <version>` - Uploads assets to storage
4. **Deploy plugin**: `muse deploy <app> <env> <plugin> [version]` - Updates env config

### Local Development

1. **Start dev server**: `muse serve <app>[@env]` - Launches muse-runner
2. **Link libraries**: Development uses `dev/` builds with faster rebuilds
3. **Hot reloading**: WebSocket connection auto-refreshes on changes

### Testing in CI

The `muse-ci-tools/` package provides comprehensive E2E testing:

1. Clones muse-next repo
2. Builds all workspace packages
3. Publishes to local Verdaccio registry
4. Runs integration tests (app creation, plugin deployment, etc.)
5. Uses Docker for clean environment

**Test flow documented in**: `muse-ci-tools/README.md:34-116`

## Configuration

MUSE uses cosmiconfig for configuration. Files are searched in this order:

1. `.muserc`, `.muserc.json`, `.muserc.yaml`
2. `muse.config.js`, `muse.config.cjs`
3. `muse.config.json`

**Common config**:
```js
module.exports = {
  plugins: [],      // Core plugins to load
  presets: [],      // Plugin presets
  assetsDir: './muse-assets',
  registryDir: './muse-registry',
};
```

**File reference**: `workspace/packages/muse-core/lib/config.js`

## Key CLI Commands

```bash
muse init                           # Initialize with default plugins
muse create-app <name>              # Create app
muse add-env <app> <env>            # Add environment
muse create-plugin <name>           # Register plugin
muse release <plugin> <version>     # Release plugin version
muse deploy <app> <env> <plugin>    # Deploy plugin to env
muse serve <app>[@env]              # Start dev server
muse export <app> <env> <path>      # Export static build
muse manager                        # Start Muse Manager UI
```

**File reference**: `workspace/packages/muse-cli/bin/muse.js`

## Important Notes

### Working with muse-core

`muse-core` is a singleton module that manages all core functionality. Most operations go through `museCore`:

```js
const museCore = require('@ebay/muse-core');

// App management
museCore.am.getApp('myapp');

// Plugin management
museCore.pm.getPlugin('myplugin');

// Storage access
museCore.storage.registry.get('apps/myapp');
museCore.storage.assets.upload(/* ... */);
```

### Express Middleware Endpoints

When working with `muse-express-middleware`, these are the key endpoints:

- `GET /muse-apps` - List all apps
- `GET /muse-apps/:name/:env` - Get app config with plugins
- `GET /muse-assets/*` - Serve plugin assets
- `POST /muse-data/*` - Data layer operations

**File reference**: `workspace/packages/muse-express-middleware/lib/index.js`

### Plugin Development

When creating plugins, remember:

1. Plugin type is declared in `package.json` under `muse.type`
2. Entry point can be customized via `muse.entry` field
3. Build outputs must go to `dist/` (production) and `dev/` (development)
4. Shared modules in lib plugins must be declared in `muse.exposes`

### Muse Runner

The development server (`muse-runner`) runs on port 6066 by default and provides:

- App/plugin execution management
- WebSocket for live updates
- Terminal integration via node-pty
- Git status monitoring
- Hot reloading support

**File reference**: `workspace/packages/muse-runner/lib/server.js`

## Testing Considerations

1. **Unit tests**: Most packages use Jest (see `muse-core/lib/**/*.test.js`)
2. **E2E tests**: Use `muse-ci-tools` Docker environment
3. **Integration tests**: Use local Verdaccio registry to test full flow
4. **Always run in Docker**: Never run `muse-ci-tools/src/index.js` directly

## Build System Integration

### Webpack Plugin

The webpack plugin handles:
- Shared module externalization
- Lib manifest generation
- Dev/dist build modes
- Assets optimization

**File reference**: `workspace/packages/muse-webpack-plugin/lib/index.js`

### Vite Plugin

Similar functionality for Vite-based builds:
- Module federation-like shared dependencies
- Manifest generation
- Dev server integration

**File reference**: `workspace/packages/muse-vite-plugin/lib/museVitePlugin.js`

## Documentation Site

The documentation uses Docusaurus 3.5.2. Key directories:

- `muse-site/docs/` - Documentation markdown files
- `muse-site/blog/` - Blog posts
- `muse-site/src/` - Custom React components
- `muse-site/static/` - Static assets

Commands are in the project overview section above.
