# js-plugin Reference

`js-plugin` is a lightweight, general-purpose plugin engine for building extensible JavaScript applications. It provides the **extension point** pattern that lets independent features discover and integrate with each other without direct coupling.

Works in both browser and Node.js environments. If you need to understand internals (caching, registration ordering, invocation mechanics), read the source directly — it's ~150 lines.

---

## The Problem It Solves

Without a plugin system, adding features requires modifying shared files that every feature touches:

```javascript
// menu.js — WITHOUT js-plugin
function Menu() {
  return (
    <ul>
      <li>Profile</li>
      <li>Account</li>
      {/* Every new feature must edit this file */}
      <li>Blocked Users</li>
      <li>API Keys</li>
    </ul>
  );
}
```

**With js-plugin**, each feature registers its own contributions, and shared components collect them dynamically:

```javascript
// menu.js — WITH js-plugin
import plugin from 'js-plugin';

function Menu() {
  const items = plugin.invoke('menu.getItems');
  return <ul>{items.map(item => <li key={item.key}>{item.label}</li>)}</ul>;
}

// blocked-users/index.js
plugin.register({
  name: 'blocked-users',
  menu: { getItems: () => ({ key: 'blocked', label: 'Blocked Users' }) }
});

// api-keys/index.js
plugin.register({
  name: 'api-keys',
  menu: { getItems: () => ({ key: 'api-keys', label: 'API Keys' }) }
});
```

`menu.js` never changes when features are added or removed. Each feature's code stays self-contained.

---

## API Reference

### `plugin.register(pluginObject)`

Register a feature plugin. Call this at module top-level in the feature's entry file, before the app renders.

```javascript
import plugin from 'js-plugin';

plugin.register({
  name: 'notifications',    // Required: unique identifier
  deps: ['auth'],           // Optional: plugins that must be registered first
  initialize() {            // Optional: called immediately after registration
    console.log('notifications ready');
  },
  // Everything else is an extension point contribution:
  menu: {
    getItems: () => [{ key: 'notif', label: 'Notifications', order: 20 }]
  },
  route: { path: '/notifications', component: NotificationsPage }
});
```

- If a declared `deps` entry is missing from the registry, the plugin is excluded from all invocations and a console warning is logged.
- Never register conditionally — plugins should be statically registered.

---

### `plugin.invoke(extPoint, ...args)`

Collect contributions from all plugins that implement an extension point. Returns an array — one entry per contributing plugin.

| Syntax | Behavior |
|---|---|
| `plugin.invoke('a.b')` | Calls `a.b` as a function if it is one; otherwise returns the value |
| `plugin.invoke('!a.b')` | Always returns the value without calling, even if it's a function |
| `plugin.invoke('a.b!')` | Same as default, but throws errors instead of swallowing them |

```javascript
// Call a lifecycle hook on every feature
plugin.invoke('onInit');

// Collect plain values
const routes = plugin.invoke('!route');
// → [{ path: '/a', component: A }, { path: '/b', component: B }]

// Call with arguments
const items = plugin.invoke('menu.getItems', currentUser);
// → calls menu.getItems(currentUser) on each plugin that defines it

// Collect functions to call later
const getters = plugin.invoke('!getHeaderWidget');
// → [fn1, fn2] — call when ready: getters.map(fn => fn())
```

---

### `plugin.getPlugin(name)`

Look up a specific plugin by name. Returns the plugin object or `undefined`.

```javascript
const auth = plugin.getPlugin('auth');
if (auth) {
  const user = auth.exports.getCurrentUser();
}
```

**Never call at module top-level** — the registry populates as modules load, so other plugins may not be registered yet:

```javascript
// ❌ Too early
const auth = plugin.getPlugin('auth');

// ✅ Inside a function, called after all plugins are loaded
function handleLogin() {
  const auth = plugin.getPlugin('auth');
  auth?.exports.login();
}
```

---

### `plugin.getPlugins(extPoint?)`

Get all plugins contributing to an extension point. Omit the argument to get all registered plugins.

```javascript
const all = plugin.getPlugins();
const routed = plugin.getPlugins('route');
const contributors = plugin.getPlugins('menu.getItems');
```

Plugins with unresolved dependencies are automatically excluded.

---

### `plugin.sort(array, sortProp?)`

Sort an array of objects by a numeric property (default: `'order'`), in-place. Objects missing the property go to the end.

```javascript
const items = plugin.invoke('menu.getItems').flat();
plugin.sort(items);  // sorts by item.order
```

---

### `plugin.unregister(name)`

Remove a plugin from the registry. Mainly useful in tests and hot-reload scenarios.

---

### `plugin.config`

```javascript
plugin.config.throws = true;  // Make all invocations throw on error
```

---

## Exports Pattern

`exports` is a js-plugin convention for sharing APIs, utilities, components, or services between features. Define an `exports` property on your plugin registration — other features access it via `plugin.getPlugin()`.

```javascript
// feature-a/index.js
import plugin from 'js-plugin';
import * as hooks from './hooks';
import * as utils from './utils';
import apiClient from './apiClient';

plugin.register({
  name: 'feature-a',
  exports: {
    hooks,      // e.g. useFeatureAData, useFeatureAAuth
    utils,      // e.g. formatItem, parseConfig
    apiClient   // configured axios instance or similar
  }
});
```

```javascript
// feature-b/SomeComponent.jsx
import plugin from 'js-plugin';

function SomeComponent() {
  const { hooks, utils } = plugin.getPlugin('feature-a')?.exports || {};
  const data = hooks?.useFeatureAData();
  // ...
}
```

**When to use exports vs extension points:**

- Use **exports** when one feature needs to *consume* APIs or code owned by another — hooks, utilities, configured service clients, shared components.
- Use **extension points** when a feature wants to let others *contribute* capabilities to it. Exports create direct coupling; extension points stay loose.

**Avoid calling `plugin.getPlugin()` at module top level** — the registry may not be fully populated yet when the module first evaluates. Always call it inside a function, component, or hook.

```javascript
// ❌ Too early — feature-a may not be registered yet
const { hooks } = plugin.getPlugin('feature-a').exports;

// ✅ Inside a function — safe
function MyComponent() {
  const { hooks } = plugin.getPlugin('feature-a')?.exports || {};
}
```

Document your feature's exports in its `FEATURE_SPEC.md` so other features know what's available and how to access it.

---

## Extension Point Conventions

### Use nested objects, not string keys

Extension points are resolved by traversing object properties, not by parsing dot-notation strings:

```javascript
// ✅ Correct
plugin.register({
  name: 'my-feature',
  layout: { sidebar: { getItems: () => [...] } }
});

// ❌ Wrong — string path keys are not traversed
plugin.register({
  name: 'my-feature',
  'layout.sidebar.getItems': () => [...]
});
```

### Extension points are implicitly defined

There is no central registry of extension points. A point exists when a consumer calls `plugin.invoke('some.point')` and contributors register a matching property path. Document your feature's extension points in `FEATURE_SPEC.md` so other features know how to contribute.

### Two roles for every extension point

```javascript
// Provider — defines the extension point by consuming it
function Sidebar() {
  const items = plugin.invoke('sidebar.getItems').flat();
  plugin.sort(items);
  return <nav>{items.map(renderItem)}</nav>;
}

// Contributor — any feature that wants to appear in the sidebar
plugin.register({
  name: 'reports',
  sidebar: { getItems: () => [{ key: 'reports', label: 'Reports', order: 40 }] }
});
```
