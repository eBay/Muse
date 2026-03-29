# Plugin Integration Guide: @ebay/muse-lib-react

**Generated**: 2026-03-28
**Plugin Type**: lib

---

## 1. Plugin Purpose & Overview

`@ebay/muse-lib-react` is the **foundational React library plugin** for MUSE applications. As a lib-type plugin with app entry capabilities, it serves three critical roles:

1. **React Application Bootstrap** - Creates the React root element, initializes the application, and renders the main component tree with all providers (Redux, React Router, React Query, Nice Modal)

2. **Shared Module Provider** - Exports commonly-used React libraries as shared modules to prevent duplicate dependencies across plugins:
   - `react-loadable` - Code splitting and lazy loading
   - `lodash` - Utility functions
   - `react-use` - Collection of React hooks
   - `react-router-dom` v6 - Client-side routing
   - `@tanstack/react-query` v4 - Server state management

3. **Extension Point Foundation** - Defines comprehensive extension points enabling other plugins to:
   - Customize routing and homepage
   - Extend Redux store with plugin-specific reducers
   - Modify the provider stack
   - Define main layout and root-level components
   - Hook into application lifecycle events

### Key Features

- **Provider Stack Management**: Ordered provider chain (React Query → Redux → SubApp Context → Nice Modal → React Router) with extension points at every stage
- **Flexible Routing**: Supports Browser, Hash, and Memory routers with React Router v6, backwards-compatible with v3-style route configuration
- **Redux Integration**: Pre-configured Redux store with Thunk middleware, Redux Logger (dev), and DevTools support
- **Sub-App Support**: Built-in iframe-based sub-application system for embedding external MUSE apps
- **Lifecycle Hooks**: Extension points for initialization (`beforeRender`, `afterRender`, `onReady`)

---

## 2. Extension Points Exposed

This plugin exposes extension points that allow other plugins to customize and extend the React application. Extension points are organized into four categories:

### 2.1 Application Lifecycle

Extension points for hooking into application initialization:

#### `root.beforeRender`
- **Type**: `Function`
- **Purpose**: Execute logic before the React root element is created and rendered
- **Use Case**: Early initialization tasks like setting up global state, registering event listeners, or configuring third-party libraries
- **Invocation**: Called in `src/index.js:26` before `createRoot()`
- **Context**: Runs after all plugins are loaded but before any React rendering

#### `root.afterRender`
- **Type**: `Function`
- **Purpose**: Execute logic immediately after the React root element is rendered
- **Use Case**: Post-render initialization like focusing elements, starting analytics, or triggering initial data fetches
- **Invocation**: Called in `src/index.js:31` after `root.render(<Root />)`
- **Context**: Runs before `onReady`, React tree is mounted but may not be fully painted

#### `onReady`
- **Type**: `Function`
- **Purpose**: Execute logic after the application is fully mounted to the DOM
- **Use Case**: Final initialization tasks that require the full component tree to be ready
- **Invocation**: Called in `src/index.js:33` as the last step of `renderApp()`
- **Context**: Complete application ready, all components mounted

### 2.2 Routing & Navigation

Extension points for customizing application routes and routing behavior:

#### `route`
- **Type**: `MuseRoute | MuseRoute[]`
- **Purpose**: Register route definitions for plugin-specific pages
- **Use Case**: Add new pages/routes to the application
- **Collection**: Routes collected in `src/common/routeConfig.js:87` via `plugin.invoke('!route')`
- **Route Structure**:
  - `path`: URL path (string or array of strings)
  - `component`: React component to render
  - `childRoutes`: Nested routes
  - `parent`: ID of parent route (moves route to parent's `childRoutes`)
  - `isIndex`: Mark as index route (duplicated to path='')
  - `id`: Unique identifier for route (enables `parent` references)
- **Special Behavior**:
  - Routes with `path` starting with `/` are moved to top level
  - Routes with `parent` property are relocated to parent's `childRoutes`
  - Array paths are expanded to multiple route objects
- **File Reference**: `src/common/routeConfig.js:32-132`

#### `routerProps`
- **Type**: `Record<string, any>`
- **Purpose**: Merge additional props into the React Router `RouterProvider` component
- **Use Case**: Customize router behavior (e.g., future flags, error handlers)
- **Collection**: First contribution used via `plugin.invoke('!routerProps')[0]` in `src/Root.js:140`
- **Note**: Props are merged with defaults (`basename`, `router`, `navigator`)
- **File Reference**: `src/Root.js:140-177`

### 2.3 Provider Stack Customization

Extension points for modifying the provider chain that wraps the application. Providers execute in order from outer to inner (lower order = outer wrapper).

#### `root.preProcessProviders`
- **Type**: `(context: { providers: ProviderType[] }) => void`
- **Purpose**: Modify or remove built-in providers before custom providers are collected
- **Use Case**: Disable default providers (e.g., remove Redux if using alternative state management)
- **Invocation Order**: 1st - called by `extendArray()` in `src/Root.js:181`
- **Context**: `{ providers }` array of default providers (React Query, Redux, SubApp Context, Nice Modal, React Router)
- **File Reference**: `src/utils.js:17`, `src/Root.js:144-181`

#### `root.getProviders`
- **Type**: `(context: { providers: ProviderType[] }) => ProviderType | ProviderType[] | void`
- **Purpose**: Contribute additional providers to wrap the application
- **Use Case**: Add custom providers (e.g., theme provider, i18n provider, custom context)
- **Invocation Order**: 2nd - called by `extendArray()` in `src/Root.js:181`
- **Return**: Single provider, array of providers, or nothing
- **Provider Structure**:
  - `order`: Rendering order (lower = outer, default sort)
  - `key`: Unique identifier
  - `provider`: React component (must accept `children` prop)
  - `props`: Props object for provider
  - `renderProvider`: Custom render function `(children) => ReactNode` (alternative to `provider`)
- **File Reference**: `src/utils.js:18`, `src/Root.js:144-192`

#### `root.processProviders`
- **Type**: `(context: { providers: ProviderType[] }) => void`
- **Purpose**: Modify the collected providers array after all contributions
- **Use Case**: Reorder providers, modify provider props, or conditionally add/remove providers
- **Invocation Order**: 3rd - called by `extendArray()` in `src/Root.js:181`
- **Context**: `{ providers }` includes both built-in and contributed providers
- **File Reference**: `src/utils.js:20`, `src/Root.js:181`

#### `root.postProcessProviders`
- **Type**: `(context: { providers: ProviderType[] }) => void`
- **Purpose**: Final opportunity to modify providers before rendering
- **Use Case**: Last-minute adjustments or validations
- **Invocation Order**: 4th (final) - called by `extendArray()` in `src/Root.js:181`
- **Note**: After this, providers are sorted by `order` and rendered
- **File Reference**: `src/utils.js:21`, `src/Root.js:181`

#### `root.renderChildren`
- **Type**: `(children: ReactNode) => ReactNode`
- **Purpose**: Wrap the root element with custom components
- **Use Case**: Alternative to `getProviders` for wrapping the app (less recommended)
- **Collection**: All contributions applied sequentially in `src/Root.js:105-110`
- **Note**: Prefer `getProviders` for adding providers; this is for non-provider wrappers
- **File Reference**: `src/Root.js:104-111`

### 2.4 Layout & UI

Extension points for customizing the application's visual structure:

#### `home.homepage`
- **Type**: `ComponentType<Object>`
- **Purpose**: Provide a custom homepage component for the root route `/`
- **Use Case**: Replace default "Welcome to Muse" page with application-specific homepage
- **Resolution**: Single contribution used; if multiple, checks `window.MUSE_GLOBAL.homepage` for preference
- **Collection**: Via `plugin.getPlugins('home.homepage')` in `src/common/routeConfig.js:96-111`
- **Default**: If not provided, uses built-in `Homepage` component (`src/features/home/Homepage.js`)
- **File Reference**: `src/common/routeConfig.js:94-116`

#### `home.mainLayout`
- **Type**: `ComponentType<{ children: ReactNode }>`
- **Purpose**: Provide a main layout component that wraps all routes
- **Use Case**: Define application shell (header, sidebar, footer) that persists across pages
- **Collection**: Via `plugin.invoke('!home.mainLayout')` in `src/features/home/App.js:10`
- **Constraint**: Only one layout allowed; multiple contributions will show error message
- **Note**: When using custom layout, undeploy `@ebay/muse-layout-antd` if present
- **File Reference**: `src/features/home/App.js:9-22`

#### `rootComponent`
- **Type**: `ComponentType<Object>`
- **Purpose**: Render initialization components at app root (should return `null`, no UI)
- **Use Case**: Global initialization logic that needs component lifecycle (e.g., modal managers, global listeners)
- **Collection**: All contributions rendered in `src/features/home/App.js:26-29`
- **Important**: Components should not render visible UI, only invisible initialization/context
- **File Reference**: `src/features/home/App.js:6-30`

### 2.5 State Management

Extension points for extending the Redux store:

#### `reducer`
- **Type**: `Reducer<any, AnyAction>`
- **Purpose**: Contribute a plugin-level reducer to the Redux store
- **Use Case**: Add plugin-specific state management to Redux
- **Storage Key**: Auto-generated as `camelCase('plugin-' + pluginName)`
- **Example**: Plugin `@ebay/my-plugin` → state key `pluginEbayMyPlugin`
- **Collection**: Via `plugin.getPlugins('reducer')` in `src/common/rootReducer.js:24-31`
- **File Reference**: `src/common/rootReducer.js:23-31`

#### `reducers`
- **Type**: `Record<string, Reducer<any, AnyAction>>`
- **Purpose**: Contribute root-level reducers with custom state keys
- **Use Case**: Add multiple reducers or control exact state key names
- **Example**: `{ myData: myDataReducer, config: configReducer }` → `state.myData`, `state.config`
- **Collection**: Via `plugin.getPlugins('reducers')` in `src/common/rootReducer.js:33-37`
- **Note**: Provides more control than `reducer` extension point
- **File Reference**: `src/common/rootReducer.js:33-39`

---

## 3. Extension Points Contributed

This plugin does not contribute to extension points from other plugins. As a foundational lib plugin, it defines the extension point architecture but does not extend external plugins.

---

## 4. Exported Functionality

As a lib-type plugin, `@ebay/muse-lib-react` exports shared modules and utilities for use by other plugins.

### 4.1 Shared Modules (Module Federation)

These modules are exported via the default export in `src/index.js:41` and made available to other plugins through MUSE's module sharing system (webpack/vite plugin externalization):

#### `Loadable`
- **Source**: `react-loadable` package
- **Purpose**: Code splitting and lazy loading of React components
- **Use Case**: Improve bundle size and load time by dynamically importing components
- **File Reference**: `src/index.js:7,41`

#### `_` (lodash)
- **Source**: `lodash` package
- **Purpose**: Utility functions for arrays, objects, strings, etc.
- **Use Case**: Common data manipulation without importing lodash separately
- **File Reference**: `src/index.js:8,41`

#### `reactUse`
- **Source**: `react-use` package
- **Purpose**: Collection of essential React hooks
- **Use Case**: Access common hooks (useMount, useToggle, etc.) without separate package
- **File Reference**: `src/index.js:9,41`

#### `reactRouterDom`
- **Source**: `react-router-dom` v6
- **Purpose**: React Router v6 routing library
- **Use Case**: Navigation components (`Link`, `Navigate`) and hooks (`useNavigate`, `useParams`)
- **File Reference**: `src/index.js:11,41`

#### `reactQuery`
- **Source**: `@tanstack/react-query` v4
- **Purpose**: Server state management (data fetching, caching, synchronization)
- **Use Case**: Manage API calls and server state with hooks (`useQuery`, `useMutation`)
- **File Reference**: `src/index.js:12,41`

### 4.2 Utility Components

These components can be imported from the plugin's `build/` directory by other plugins:

#### `Nodes`
- **Source**: `src/features/common/Nodes.js`
- **Type**: `ComponentType<{ items: any[], extName: string, extBase: string, extArgs: any }>`
- **Purpose**: Render a list of components with extension point integration
- **Use Case**: Create extendable UI component lists (e.g., toolbar buttons, menu items)
- **Behavior**: Uses `extendArray()` to allow plugins to contribute additional nodes
- **Exported**: `src/features/common/index.js:3`
- **File Reference**: `src/features/common/Nodes.js:1-21`

#### `useExtPoint`
- **Source**: `src/features/common/useExtPoint.js`
- **Type**: `(extPointName: string, extArgs?: any) => { extNode: ReactNode, values: any[] }`
- **Purpose**: React hook for consuming extension points within components
- **Use Case**: Render extension point contributions as React elements and collect callback values
- **Returns**:
  - `extNode`: React fragment containing all extension point components
  - `values`: Array of values passed to callbacks
- **Exported**: `src/features/common/index.js:4`
- **File Reference**: `src/features/common/useExtPoint.js:1-29`

#### `ErrorBoundary`
- **Source**: `src/features/common/ErrorBoundary.js`
- **Type**: `ComponentType<{ children: ReactNode }>`
- **Purpose**: React error boundary component
- **Use Case**: Catch and handle React errors gracefully
- **Exported**: `src/features/common/index.js:2`

#### `PageNotFound`
- **Source**: `src/features/common/PageNotFound.js`
- **Type**: `ComponentType<Object>`
- **Purpose**: Default 404 page component
- **Use Case**: Fallback for unmatched routes
- **Exported**: `src/features/common/index.js:1`

### 4.3 Sub-App Utilities

Components and utilities for the sub-application feature:

#### `SubAppContainer`
- **Source**: `src/features/sub-app/SubAppContainer.js`
- **Type**: `ComponentType<{ subApp: SubAppConfig, subApps: SubAppConfig[] }>`
- **Purpose**: Renders an external MUSE app in an iframe
- **Use Case**: Embed other MUSE applications within the main app
- **Exported**: `src/features/sub-app/index.js:1`

#### `FixedSubAppContainer`
- **Source**: `src/features/sub-app/FixedSubAppContainer.js`
- **Type**: `ComponentType<Object>`
- **Purpose**: Fixed-position sub-app container
- **Use Case**: Persistent sub-app that doesn't follow routing
- **Exported**: `src/features/sub-app/index.js:2`

#### `SubAppContext`
- **Source**: `src/features/sub-app/SubAppContext.js`
- **Type**: `React.Context<any>`
- **Purpose**: React context for parent-child sub-app communication
- **Use Case**: Share data between parent app and embedded sub-apps
- **Exported**: `src/features/sub-app/index.js:4`

#### `LoadingSkeleton`
- **Source**: `src/features/sub-app/LoadingSkeleton.js`
- **Type**: `ComponentType<Object>`
- **Purpose**: Loading placeholder for sub-apps
- **Use Case**: Display loading state while sub-app loads
- **Exported**: `src/features/sub-app/index.js:3`

#### `C2SProxyFailed`
- **Source**: `src/features/sub-app/C2SProxyFailed.js`
- **Type**: `ComponentType<Object>`
- **Purpose**: Error component for sub-app proxy failures
- **Use Case**: Display when C2S proxy configuration fails
- **Exported**: `src/features/sub-app/index.js:5`

#### `useSetSubAppState`
- **Source**: `src/features/sub-app/redux/setSubAppState.js`
- **Type**: `() => (state: any) => void`
- **Purpose**: Hook for setting sub-app state from Redux
- **Use Case**: Update sub-app context from parent app
- **Exported**: `src/features/sub-app/redux/hooks.js:1`

### 4.4 Common Utilities

#### `extendArray`
- **Source**: `src/utils.js:15-24`
- **Type**: `(arr: any[], extName: string, extBase: string, ...args: any[]) => any[]`
- **Purpose**: Makes an array extensible via js-plugin extension points
- **Use Case**: Internal utility for provider/route extension, can be used by other plugins for custom extension points
- **Behavior**: Invokes `preProcess`, `get`, `process`, `postProcess` extension points, flattens contributions, sorts by order
- **Example**:
  ```javascript
  const items = [];
  extendArray(items, 'items', 'myPlugin.customExt', { context: 'data' });
  // Invokes: myPlugin.customExt.preProcessItems
  //          myPlugin.customExt.getItems
  //          myPlugin.customExt.processItems
  //          myPlugin.customExt.postProcessItems
  ```
- **Exported**: `src/utils.js:26`
- **File Reference**: `src/utils.js:15-24`

### 4.5 Redux Store Access

#### `store`
- **Source**: `src/common/store.js`
- **Type**: Redux Store wrapper
- **Purpose**: Access to the global Redux store
- **Use Case**: Dispatch actions or access state outside React components
- **Methods**:
  - `getStore()`: Returns the Redux store instance
  - `getState()`: Returns current state
  - `dispatch(action)`: Dispatches an action
  - `subscribe(listener)`: Subscribes to store changes
  - `replaceReducer(reducer)`: Hot-swaps reducers
- **File Reference**: `src/common/store.js:1-21`

#### `history`
- **Source**: `src/common/history.js`
- **Type**: History object (from `history` package)
- **Purpose**: Programmatic navigation outside React components
- **Use Case**: Navigate to routes from Redux actions or non-React code
- **File Reference**: `src/common/history.js`

---

## 5. Integration Examples

**CRITICAL**: Extension points are **nested object properties**, NOT string paths!

### Example 1: Adding a Custom Route

```javascript
// ✅ CORRECT - nested object properties
plugin.register({
  name: 'my-plugin',
  route: {
    path: '/my-page',
    component: MyPageComponent,
    childRoutes: [
      {
        path: 'details/:id',
        component: DetailsComponent
      }
    ]
  }
});

// ❌ INCORRECT - DO NOT use string paths
plugin.register({
  name: 'my-plugin',
  'route': { ... }  // Works, but 'route' doesn't need quotes
});
```

### Example 2: Contributing Multiple Routes

```javascript
plugin.register({
  name: 'my-plugin',
  route: [
    { path: '/page1', component: Page1 },
    { path: '/page2', component: Page2 },
    { path: '/page3', component: Page3, parent: 'some-route-id' }
  ]
});
```

### Example 3: Customizing Homepage

```javascript
import MyHomepage from './MyHomepage';

plugin.register({
  name: 'my-plugin',
  home: {
    homepage: MyHomepage
  }
});
```

### Example 4: Adding Custom Layout

```javascript
import MyLayout from './MyLayout';

plugin.register({
  name: 'my-plugin',
  home: {
    mainLayout: MyLayout  // Should accept children prop
  }
});
```

### Example 5: Adding Redux Reducer (Plugin-Level)

```javascript
import myReducer from './redux/reducer';

plugin.register({
  name: '@ebay/my-plugin',
  reducer: myReducer
});

// Redux state will be accessible at:
// state.pluginEbayMyPlugin
```

### Example 6: Adding Redux Reducers (Root-Level)

```javascript
import userReducer from './redux/userReducer';
import configReducer from './redux/configReducer';

plugin.register({
  name: 'my-plugin',
  reducers: {
    user: userReducer,
    appConfig: <USER_NAME>
  }
});

// Redux state accessible at:
// state.user
// state.appConfig
```

### Example 7: Adding a Custom Provider

```javascript
import { ThemeProvider } from 'my-theme-library';

plugin.register({
  name: 'my-plugin',
  root: {
    getProviders: () => ({
      order: 15,  // Between React Query (10) and Redux (20)
      key: 'theme-provider',
      provider: ThemeProvider,
      props: { theme: myTheme }
    })
  }
});
```

### Example 8: Modifying Existing Providers

```javascript
plugin.register({
  name: 'my-plugin',
  root: {
    preProcessProviders: ({ providers }) => {
      // Remove Redux provider
      const reduxIndex = providers.findIndex(p => p.key === 'redux-provider');
      if (reduxIndex >= 0) {
        providers.splice(reduxIndex, 1);
      }
    }
  }
});
```

### Example 9: Lifecycle Hooks

```javascript
plugin.register({
  name: 'my-plugin',
  root: {
    beforeRender: () => {
      console.log('App is about to render');
      // Initialize analytics, set up listeners, etc.
    },
    afterRender: () => {
      console.log('App has rendered');
      // Post-render tasks
    }
  },
  onReady: () => {
    console.log('App is fully ready');
    // Final initialization
  }
});
```

### Example 10: Using Shared Modules

```javascript
// In your plugin code
const { exports } = plugin.getPlugin('@ebay/muse-lib-react');
const { _, reactRouterDom, reactQuery } = exports;

// Use lodash
const uniqueItems = _.uniq(items);

// Use React Router
const { useNavigate, Link } = reactRouterDom;

// Use React Query
const { useQuery, useMutation } = reactQuery;
```

### Example 11: Using Utility Components

```javascript
import { Nodes, useExtPoint } from '@ebay/muse-lib-react/build/features/common';

// Using Nodes component
function MyToolbar() {
  const items = [
    { key: 'btn1', component: Button1, props: { label: 'Click' } }
  ];

  return (
    <Nodes
      items={items}
      extName="buttons"
      extBase="myPlugin.toolbar"
    />
  );
}

// Using useExtPoint hook
function MyComponent() {
  const { extNode, values } = useExtPoint('myPlugin.customPoint', { data: 123 });

  return <div>{extNode}</div>;
}
```

### Example 12: Root Component for Initialization

```javascript
function MyInitComponent() {
  useEffect(() => {
    // Initialize something globally
    window.myGlobalState = { ... };
  }, []);

  return null;  // IMPORTANT: No UI rendering
}

plugin.register({
  name: 'my-plugin',
  rootComponent: MyInitComponent
});
```

### Example 13: Custom Router Props

```javascript
plugin.register({
  name: 'my-plugin',
  routerProps: {
    future: {
      v7_startTransition: true
    }
  }
});
```

---

## Integration Checklist

When integrating with `@ebay/muse-lib-react`:

- [ ] Ensure plugin type is compatible (normal or lib plugins can extend this)
- [ ] Use nested object properties for extension points, not string paths
- [ ] Only one plugin should provide `home.homepage` and `home.mainLayout`
- [ ] Provider `order` values: lower = outer wrapper (10, 20, 30...)
- [ ] Redux reducer keys via `reducer` are auto-generated; use `reducers` for custom keys
- [ ] `rootComponent` must return `null` (no UI)
- [ ] Routes with absolute paths (`/`) are moved to top level
- [ ] Shared modules accessed via `plugin.getPlugin('@ebay/muse-lib-react').exports`
- [ ] Sub-app configuration goes in `window.MUSE_GLOBAL.plugins` under this plugin's `subApps` array
