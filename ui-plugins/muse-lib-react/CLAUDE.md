# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@ebay/muse-lib-react` is a **lib plugin** for the MUSE micro-frontends framework. It serves as the foundational React library plugin that:

1. **Bootstraps the React application** - Creates the React root and renders the app
2. **Provides shared modules** - Bundles popular React libraries (React Router, Redux, React Query, lodash, Nice Modal) as shared dependencies for other plugins
3. **Defines extension points** - Allows other plugins to extend routing, Redux store, providers, and UI components

As a lib plugin (`muse.type: "lib"` in package.json:6), this plugin loads before normal plugins and exports shared modules to avoid duplicate dependencies across the application.

## Common Commands

### Development

```bash
# Start development server (uses CRACO)
pnpm start

# Build for production
pnpm build

# Build for development (faster, no optimization)
pnpm build:dev

# Build for testing (with coverage instrumentation)
pnpm build:test
```

### Testing

```bash
# Run tests in CI mode (single run with coverage)
pnpm test

# Run tests in watch mode with coverage
pnpm test:dev

# View test configuration
pnpm test:config
```

### Deployment

```bash
# Build both prod and dev, then release and deploy
pnpm deploy

# Generate TypeDoc documentation for extension points
pnpm gen-muse-doc
```

## Architecture Overview

### Bootstrap Flow

The plugin follows this initialization sequence:

1. **Plugin registration** (`src/index.js:14`) - Registers plugin with js-plugin
2. **App entry push** (`src/index.js:36`) - Adds `renderApp` function to `window.MUSE_GLOBAL.appEntries`
3. **Root rendering** (`src/index.js:18-34`) - When triggered:
   - Invokes `root.beforeRender` extension point
   - Creates React root and renders `<Root />` component
   - Invokes `root.afterRender` and `onReady` extension points

### Core Components

#### Root Component (`src/Root.js`)

The Root component is responsible for:

- **Provider stack** (`src/Root.js:144-179`) - Creates ordered provider chain:
  1. React Query Provider (order: 10)
  2. Redux Provider (order: 20)
  3. SubApp Context Provider (order: 30)
  4. Nice Modal Provider (order: 40)
  5. React Router Provider (order: 50)

- **Extension point integration** - Uses `extendArray()` helper (`src/utils.js:15`) to allow plugins to:
  - Add/modify/remove providers via `root.preProcessProviders`, `root.getProviders`, `root.processProviders`, `root.postProcessProviders`
  - Customize router props via `routerProps` extension point

- **Router configuration** - Supports three router types via `window.MUSE_GLOBAL.appVariables.routerType`:
  - `browser` (default) - BrowserRouter with history object
  - `hash` - HashRouter
  - `memory` - MemoryRouter

- **Route rendering** - Converts React Router v3-style route config to v6 elements using `renderRouteConfigV3()` (`src/Root.js:35-102`)

#### Route Configuration (`src/common/routeConfig.js`)

Routes are assembled from multiple sources:

1. **Built-in feature routes** - `homeRoute`, `commonRoute`, `subAppRoute` (`src/common/routeConfig.js:12`)
2. **Plugin routes** - Collected via `plugin.invoke('!route')` (`src/common/routeConfig.js:87`)
3. **Homepage resolution** - Finds homepage component via `home.homepage` extension point (`src/common/routeConfig.js:94-111`)
4. **Route normalization** - Handles absolute paths, parent references, and path arrays (`src/common/routeConfig.js:32-82`)

**Important route handling**:
- Routes starting with `/` are moved to top level
- Routes with `parent` property are moved to correct parent's `childRoutes`
- Routes with array paths are expanded to multiple route objects

#### Redux Store (`src/common/configStore.js`, `src/common/rootReducer.js`)

Redux setup:

- **Middlewares** - Redux Thunk (always) + Redux Logger (dev only)
- **DevTools** - Enabled in development if extension installed
- **Hot reloading** - Supports reducer hot replacement in dev mode
- **Plugin reducers** - Plugins can contribute reducers via two extension points:
  - `reducer` - Adds plugin-level reducer under auto-generated key `plugin-<pluginName>`
  - `reducers` - Adds root-level reducers with custom keys

### Sub-App System

The sub-app feature (`src/features/sub-app/`) enables embedding external MUSE apps in iframes:

- **Configuration** - Sub-apps defined in `window.MUSE_GLOBAL.plugins` under `subApps` array
- **Route generation** (`src/features/sub-app/route.js:22-36`) - Creates routes for each sub-app with `mountPoint: 'default'`
- **Container component** (`src/features/sub-app/SubAppContainer.js`) - Detects URL changes and loads matching sub-app in iframe
- **Context communication** - Parent-child messaging via `window.MUSE_GLOBAL.msgEngine` and `SubAppContext` (`src/features/sub-app/SubAppContext.js`)

**Important**: Sub-app implementation details are documented in `DEV.md`.

## Extension Points

This plugin defines extensive extension points for customization. Full documentation is auto-generated in `MUSE.md` via `pnpm gen-muse-doc`.

### Key Extension Points

**Root lifecycle**:
- `root.beforeRender` - Called before root element renders
- `root.afterRender` - Called after root element renders
- `onReady` - Called after app is mounted to DOM

**Provider customization**:
- `root.preProcessProviders` - Pre-process providers before collection
- `root.getProviders` - Contribute additional providers
- `root.processProviders` - Process collected providers
- `root.postProcessProviders` - Final provider processing

**Routing**:
- `route` - Contribute route definitions (can return single route or array)
- `routerProps` - Merge props into Router component
- `home.homepage` - Provide custom homepage component
- `home.mainLayout` - Provide custom main layout

**Redux**:
- `reducer` - Contribute plugin-level reducer
- `reducers` - Contribute root-level reducers

**Other**:
- `rootComponent` - Render initialization component (should return null, no UI)
- `root.renderChildren` - Wrap root element with custom components

## Build System

### CRACO (Create React App Configuration Override)

Uses CRACO to customize Create React App (`craco.config.js`):

- **Plugins**:
  - `CracoLessPlugin` - Adds Less support
  - `MuseCracoPlugin` - MUSE-specific webpack/babel configuration

- **Jest configuration** - Custom test setup:
  - Test environment: `jsdom`
  - Test pattern: `tests/**/*.test.js`
  - Setup file: `tests/setupAfterEnv.js`
  - Mock files for styles and assets

### Vite Support

Also supports Vite as build tool (`vite.config.js`):

- **Plugins**:
  - `@vitejs/plugin-react` - React support
  - `museVitePlugin` - MUSE integration for shared modules

- **JSX in .js files** - Configured to treat `.js` files in `src/` as JSX

### Shared Module Exports

As a lib plugin, exports these modules (`src/index.js:41`):
- `Loadable` - react-loadable for code splitting
- `_` - lodash utilities
- `reactUse` - react-use hooks collection
- `reactRouterDom` - React Router v6
- `reactQuery` - TanStack React Query v4

## Key Files

- `src/index.js` - Plugin registration and app entry point
- `src/Root.js` - Root React component with provider stack and routing
- `src/common/routeConfig.js` - Route assembly and normalization
- `src/common/rootReducer.js` - Redux reducer combination with plugin integration
- `src/common/configStore.js` - Redux store configuration
- `src/utils.js` - `extendArray()` helper for extension point integration
- `MUSE.md` - Auto-generated extension point documentation
- `DEV.md` - Sub-app implementation details

## Testing

Tests use Jest with React Testing Library:

- **Test location**: `tests/` directory (mirrors `src/` structure)
- **Setup**: `tests/setupAfterEnv.js` - Configures testing library and mocks
- **Mocks**:
  - `tests/__mocks__/msgEngine.js` - Mock message engine
  - `tests/__mocks__/fileMock.js` - Mock static assets
  - `tests/__mocks__/styleMock.js` - Mock CSS/Less imports

**Important**: `MUSE_GLOBAL` object must be mocked in tests as it's required by many components.

## Package Configuration

Key `package.json` fields:

- `muse.type: "lib"` - Identifies this as a lib plugin
- `muse.isAppEntry: true` - Marks plugin as app entry point (bootstrap)
- `muse.appConfig` - Default app configuration (routerType, noSSO)
- `muse.devConfig` - Development server configuration
- `files: ["build", "src"]` - Files included in published package

## Important Notes

1. **Extension point invocation** - Use `plugin.invoke('!extensionPoint')` with `!` prefix to get array of all contributions
2. **Provider order** - Lower order numbers render outer in the component tree
3. **Router types** - Router type is determined by `window.MUSE_GLOBAL.appVariables.routerType`
4. **Module federation** - Shared modules are exposed via MUSE build plugins (webpack/vite), not direct exports
5. **CRACO patch** - `muse-cra-patch` command must run before CRACO commands to apply necessary patches
