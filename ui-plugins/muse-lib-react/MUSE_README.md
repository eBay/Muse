# Plugin Integration Guide: @ebay/muse-lib-react

**Generated**: 2026-05-21
**Plugin Type**: lib

---

## 1. Plugin Purpose & Overview

### What This Plugin Does

`@ebay/muse-lib-react` is the foundational React lib plugin for the MUSE micro-frontends framework. It bootstraps the React application (creates the React DOM root and renders the app), assembles the provider stack (Redux, React Query, React Router, NiceModal, SubApp context), builds the route tree from contributions across all plugins, and combines Redux reducers from all loaded plugins into a single store.

### Key Features

- **App bootstrapping** — Creates and renders the React root into `#muse-react-root` on demand, invokes lifecycle hooks before and after render.
- **Provider stack** — Builds the ordered React provider chain (React Query → Redux → SubApp Context → NiceModal → Router) and makes it extensible via extension points.
- **Route assembly** — Collects route definitions from all loaded plugins, normalizes absolute/parent routes, resolves the homepage component, and renders with React Router v7.
- **Redux store** — Combines built-in reducers with plugin-contributed reducers (both plugin-scoped and root-level).
- **Shared module exports** — Bundles React ecosystem libraries (React Router, React Query, lodash, react-use, react-loadable) so all normal plugins can use them without duplicating them in their own bundles.
- **Utility primitives** — Exports `extendArray`, `useExtPoint`, and `Nodes` to help other plugins build their own extensible arrays and UI node lists.

### Plugin Type: lib

As a `lib` plugin with `muse.isAppEntry: true`, this plugin loads before all normal plugins and serves two roles: it **provides shared runtime modules** (React, Redux, React Router, etc.) to every normal plugin via the MUSE build system's module federation, and it **acts as the application entry point** that renders the React tree. Normal plugins must never bundle these libraries themselves; they receive them from this plugin at runtime.

---

## 2. Extension Points Exposed

This plugin exposes the following extension points that other plugins can implement to extend its functionality.

### Summary

- **Total Extension Points**: 15
- **Categories**: Root Lifecycle, Provider Stack, Routing, Redux, App Shell, Utility

### Extension Point List

#### `root.beforeRender`

- **Purpose**: Execute initialization logic before the React root is created and rendered. Use this for side effects that must complete before any React component mounts.
- **When Invoked**: Synchronously before `createRoot().render()` is called.
- **Context Parameters**: none
- **Expected Return**: ignored
- **Use Case Example**: Injecting global CSS variables, initializing an analytics library, or pre-fetching critical configuration.
- **File Reference**: `src/index.jsx:26`

#### `root.afterRender`

- **Purpose**: Execute logic immediately after `root.render()` is called (before React has painted).
- **When Invoked**: Synchronously after `root.render(<Root />)`.
- **Context Parameters**: none
- **Expected Return**: ignored
- **Use Case Example**: Starting a performance measurement timer or notifying a loading screen manager.
- **File Reference**: `src/index.jsx:31`

#### `onReady`

- **Purpose**: Execute logic after the application is fully mounted to the DOM.
- **When Invoked**: After `root.afterRender`, still synchronous on the same tick.
- **Context Parameters**: none
- **Expected Return**: ignored
- **Use Case Example**: Hiding a static HTML splash screen, signalling to an E2E test harness that the app is ready.
- **File Reference**: `src/index.jsx:33`

#### `root.renderChildren`

- **Purpose**: Wrap the rendered route tree in additional React components. Each implementer receives the current children and must return the (potentially wrapped) children.
- **When Invoked**: During `Root` render, before the provider chain is built.
- **Context Parameters**: `children` — `React.ReactNode` — the current route element tree
- **Expected Return**: `React.ReactNode` — the (wrapped or unchanged) children
- **Use Case Example**: Wrapping the entire app in an error boundary, a theme context, or a drag-and-drop context.
- **File Reference**: `src/Root.jsx:104`

#### `routerProps`

- **Purpose**: Merge additional props directly into the `RouterProvider` component.
- **When Invoked**: During `Root` render, when the Router is configured.
- **Context Parameters**: none
- **Expected Return**: `Record<string, any>` — props merged into `RouterProvider`. Only the first contribution is used.
- **Use Case Example**: Providing a custom `future` flag object for React Router v7 feature flags.
- **File Reference**: `src/Root.jsx:140`

#### `root.preProcessProviders`

- **Purpose**: Inspect or mutate the initial providers array before additional providers from `root.getProviders` are added. Use this to remove or reorder built-in providers.
- **When Invoked**: During `Root` render, via `extendArray` before provider collection.
- **Context Parameters**: `{ providers: ProviderType[] }` — the current mutable array of built-in providers
- **Expected Return**: `string | boolean` — return value is used by `jsPlugin.sort` ordering
- **Use Case Example**: Removing the built-in Redux `Provider` to replace it with a custom store setup.
- **File Reference**: `src/Root.jsx:181`, `src/utils.js:17`

#### `root.getProviders`

- **Purpose**: Contribute one or more additional React context providers to be inserted into the provider stack at a specific order position.
- **When Invoked**: During `Root` render, via `extendArray` during provider collection.
- **Context Parameters**: `{ providers: ProviderType[] }` — the current providers array (after pre-processing)
- **Expected Return**: `ProviderType | ProviderType[] | void` — provider descriptor(s) to add
- **Use Case Example**: Adding an Apollo Client provider at `order: 25` (between Redux and SubApp context).
- **File Reference**: `src/Root.jsx:181`, `src/utils.js:18`

#### `root.processProviders`

- **Purpose**: Post-process the combined providers array after all `getProviders` contributions have been collected.
- **When Invoked**: During `Root` render, via `extendArray` after collection.
- **Context Parameters**: `{ providers: ProviderType[] }` — the full combined providers array
- **Expected Return**: `string | void` — used for sort ordering
- **Use Case Example**: Validating that required providers are present and throwing a descriptive error if not.
- **File Reference**: `src/Root.jsx:181`, `src/utils.js:20`

#### `root.postProcessProviders`

- **Purpose**: Final hook to inspect or modify the providers array after all processing is complete.
- **When Invoked**: During `Root` render, via `extendArray` as the last step.
- **Context Parameters**: `{ providers: ProviderType[] }` — the finalized providers array
- **Expected Return**: `void`
- **Use Case Example**: Logging the final provider stack in development for debugging.
- **File Reference**: `src/Root.jsx:181`, `src/utils.js:21`

#### `route`

- **Purpose**: Register one or more route definitions into the application's route tree.
- **When Invoked**: On every render of the `Root` component, when `routeConfig()` rebuilds the route tree.
- **Context Parameters**: none
- **Expected Return**: `MuseRoute | MuseRoute[]` — one or more route objects. See `MuseRoute` in `src/muse.d.ts:89`.
- **Use Case Example**: Adding `/settings`, `/reports`, or any feature page routes.
- **File Reference**: `src/common/routeConfig.jsx:87`

#### `home.homepage`

- **Purpose**: Replace the default homepage component rendered at the root path `/`.
- **When Invoked**: During route assembly in `routeConfig()`.
- **Context Parameters**: none
- **Expected Return**: `ComponentType` — the React component to render at `/`. Only one plugin should contribute this.
- **Use Case Example**: A dashboard plugin providing a `DashboardHomepage` component.
- **File Reference**: `src/common/routeConfig.jsx:96`

#### `home.mainLayout`

- **Purpose**: Provide the main layout shell component that wraps all page content. Only one plugin should contribute this — multiple contributions render an error message.
- **When Invoked**: On every render of the `App` shell component.
- **Context Parameters**: none
- **Expected Return**: `ComponentType` — a layout component that accepts `children`. Only the first contribution is used.
- **Use Case Example**: `muse-layout-antd` provides a sidebar/header layout via this extension point.
- **File Reference**: `src/features/home/App.jsx:10`

#### `rootComponent`

- **Purpose**: Mount an invisible initialization React component into the app root. The component should return `null` — it exists only for side effects (subscriptions, global listeners, etc.).
- **When Invoked**: On every render of the `App` shell component.
- **Context Parameters**: none
- **Expected Return**: `ComponentType` — a component that renders `null`. All contributing plugins' components are rendered simultaneously.
- **Use Case Example**: A plugin that listens for global WebSocket messages and dispatches Redux actions.
- **File Reference**: `src/features/home/App.jsx:7`

#### `reducer`

- **Purpose**: Contribute a plugin-scoped Redux reducer. The reducer is automatically mounted under the key `plugin-<pluginName>` (camelCased) in the store.
- **When Invoked**: When the Redux store is created (once at startup).
- **Context Parameters**: none
- **Expected Return**: `Reducer<any, AnyAction>` — a Redux reducer function
- **Use Case Example**: A plugin contributing its own Redux slice under `pluginMyPlugin` in the store.
- **File Reference**: `src/common/rootReducer.js:24`

#### `reducers`

- **Purpose**: Contribute one or more root-level Redux reducers with custom store branch keys (unlike `reducer` which auto-generates the key).
- **When Invoked**: When the Redux store is created (once at startup).
- **Context Parameters**: none
- **Expected Return**: `Record<string, Reducer<any, AnyAction>>` — a map of store key → reducer
- **Use Case Example**: A plugin that needs its state at `store.auth` or `store.featureFlags` instead of an auto-generated key.
- **File Reference**: `src/common/rootReducer.js:33`

### Usage Example

```javascript
// Extension points use nested object properties — NOT string paths
plugin.register({
  name: 'my-plugin',

  // Lifecycle hooks
  onReady: () => {
    console.log('App is ready');
  },

  // Route contribution
  route: [
    { path: 'settings', component: SettingsPage },
    { path: 'reports', component: ReportsPage },
  ],

  // Redux reducer
  reducer: myPluginReducer,

  // Provider injection
  root: {
    getProviders: ({ providers }) => ({
      order: 25,
      key: 'my-context',
      provider: MyContextProvider,
      props: { value: myContextValue },
    }),
    beforeRender: () => {
      initAnalytics();
    },
  },

  // Layout/homepage
  home: {
    homepage: MyHomepageComponent,
    mainLayout: MyLayoutComponent, // WARNING: only one plugin should provide this
  },

  // Invisible init component
  rootComponent: MyGlobalListenerComponent,
});
```

---

## 3. Extension Points Contributed

This plugin does not extend other plugins via extension points. It is the foundational bootstrap plugin — it only **exposes** extension points for others to implement.

---

## 4. Exported Functionality

This plugin exports the following functionality for use by other plugins.

**Access via**: Shared modules are available automatically in normal plugins via the MUSE build system. Direct exports are accessible via `plugin.getPlugin('@ebay/muse-lib-react').exports` or direct source imports.

### Shared Modules (Module Federation)

As a `lib` plugin, `@ebay/muse-lib-react` makes the following libraries available as shared singletons to all normal plugins at runtime. Normal plugins must **not** bundle these themselves — they receive them from this plugin via the MUSE vite/webpack build plugin.

The shared module set is determined by the transitive imports of `src/index.jsx`. The following are explicitly re-exported:

| Shared Module | Package | Version | Export Key |
|---|---|---|---|
| `Loadable` | `react-loadable` | 5.5.0 | `Loadable` |
| `_` (lodash) | `lodash` | 4.18.1 | `_` |
| `reactUse` | `react-use` | 17.6.0 | `reactUse` |
| `reactRouterDom` | `react-router-dom` | 7.15.0 | `reactRouterDom` |
| `reactQuery` | `@tanstack/react-query` | 5.100.9 | `reactQuery` |

Additionally, all transitive dependencies (including `react`, `react-dom`, `redux`, `react-redux`, `@ebay/nice-modal-react`, `history`) are shared automatically by the MUSE build system.

**File Reference**: `src/index.jsx:41`

### Utilities

#### `extendArray(arr, extName, extBase, ...args)`

Makes any array extensible by js-plugin extension points. Invokes four lifecycle hooks in order — `preProcess<Name>`, `get<Name>`, `process<Name>`, `postProcess<Name>` — then sorts the array by `order`.

- **Parameters**: `arr` (mutable array), `extName` (string, capitalized to form hook names), `extBase` (string prefix for hook names), `...args` (passed through to each hook invocation)
- **Returns**: the mutated `arr`
- **File Reference**: `src/utils.js:15`

### React Hooks

#### `useExtPoint(extPointName, extArgs)`

A React hook that invokes any extension point and renders all contributed components into a JSX fragment. Returns `{ extNode, values }` where `extNode` is the rendered fragment of all contributions and `values` is state updated when a contribution calls its `callback` prop.

- **Parameters**: `extPointName` (string), `extArgs` (object passed as props to each contributed component)
- **Returns**: `{ extNode: ReactNode, values: any[] }`
- **File Reference**: `src/features/common/useExtPoint.jsx:7`

### React Components

#### `Nodes`

Renders an extensible list of nodes where each node can be a render function, raw content, or component. Internally uses `extendArray` to allow other plugins to inject items.

- **Props**: `items` (array), `extName` (string), `extBase` (string), `extArgs` (object)
- **File Reference**: `src/features/common/Nodes.jsx:8`

### Using Shared Modules

In normal plugins built with `@ebay/muse-vite-plugin` or `@ebay/muse-webpack-plugin`, these modules are automatically externalized and resolved from `@ebay/muse-lib-react` at runtime:

```javascript
// In a normal plugin — these are resolved from muse-lib-react at runtime,
// NOT bundled into the plugin's own bundle.
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
```

**Note**: Exports create tight coupling. Prefer extension points for loose coupling when possible.

---

## 5. Consumed Exports (Runtime Dependencies)

This plugin does not consume exports from other plugins. All inter-plugin collaboration is done through extension points (loose coupling).

---

## 6. Integration Examples

### Extending This Plugin

```javascript
// Extension points use nested object properties — NOT string paths
plugin.register({
  name: 'my-plugin',

  // Add application routes
  route: [
    { path: 'my-feature', component: MyFeaturePage },
  ],

  // Redux integration
  reducer: myFeatureReducer,

  // Root lifecycle
  onReady: () => {
    console.log('App mounted');
  },

  // Provider injection
  root: {
    getProviders: ({ providers }) => ({
      order: 25,
      key: 'my-context',
      provider: MyContextProvider,
      props: { store: myStore },
    }),
  },

  // Layout/homepage
  home: {
    homepage: MyHomepageComponent,
    mainLayout: MyLayoutComponent, // WARNING: only one plugin should provide this
  },

  // Invisible init component
  rootComponent: MyGlobalListenerComponent,
});
```

### Building Your Own Extensible Array

```javascript
import { extendArray } from '@ebay/muse-lib-react/src/utils';

// In your component:
const menuItems = [...defaultItems];
extendArray(menuItems, 'menuItems', 'myPlugin', { context: someContext });
// Now other plugins can implement:
//   myPlugin.preProcessMenuItems
//   myPlugin.getMenuItems  (return additional items)
//   myPlugin.processMenuItems
//   myPlugin.postProcessMenuItems
```

### Using the useExtPoint Hook

```javascript
import useExtPoint from '@ebay/muse-lib-react/src/features/common/useExtPoint';

function MyToolbar() {
  const { extNode } = useExtPoint('myPlugin.toolbarItems', { context: 'main' });
  return <div className="toolbar">{extNode}</div>;
}
```
