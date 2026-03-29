# Plugin Integration Guide: @ebay/muse-boot-default

**Generated**: 2026-03-28
**Plugin Type**: boot

---

## 1. Plugin Purpose & Overview

### Purpose

`@ebay/muse-boot-default` is the default bootstrap plugin for MUSE applications. It orchestrates the entire application startup sequence, loading plugins in the correct order and initializing the MUSE runtime environment.

### Key Capabilities

**Bootstrap Orchestration**
- Loads and executes plugins in the correct order: boot → init → lib → normal
- Manages the plugin loading lifecycle with parallel loading for optimal performance
- Provides loading progress feedback to users
- Handles error states and recovery during bootstrap

**MUSE Global Environment Setup**
- Initializes `window.MUSE_GLOBAL` with core utilities and configuration
- Sets up the shared modules system (`__shared__`)
- Configures app variables, plugin variables, and configuration merging
- Provides message engine for parent-child communication (sub-app scenarios)

**Plugin Loading System**
- Supports multiple plugin sources: CDN, local development, linked plugins
- Implements parallel loading for lib and normal plugins
- Handles ES module and UMD plugin formats
- Supports `forcePlugins` query parameter for debugging/testing

**Service Worker Registration**
- Registers service workers for offline support
- Manages service worker lifecycle

**Error Handling & Loading UI**
- Displays loading progress during bootstrap
- Shows error messages when bootstrap fails
- Provides fallback UI for failed states

### Integration Role

As a **boot plugin**, this plugin:
- **MUST be the first plugin loaded** in any MUSE application
- Does not use the js-plugin extension point system (it runs before plugins are loaded)
- Provides the foundational environment that allows other plugins to function
- Is typically referenced in `index.html` as the entry script

---

## 2. Extension Points Exposed

This plugin does not expose extension points. As a boot plugin, it runs before the js-plugin system is initialized and focuses solely on loading other plugins and setting up the runtime environment.

---

## 3. Extension Points Contributed

This plugin does not contribute to extension points from other plugins. As the first plugin to load, there are no other plugins available to extend when this plugin runs.

### Bootstrap Integration Points

While this plugin doesn't use extension points, it provides several integration mechanisms through `window.MUSE_GLOBAL`:

#### `waitForLoaders`
**Type**: `Array<Promise | AsyncFunction>`
**File Reference**: `src/boot.js:23, 273-286`

Plugins can register async loaders that must complete before the app starts:

```javascript
// In an init plugin
window.MUSE_GLOBAL.waitFor(async () => {
  await performAuth();
  return true; // Return false to prevent app from starting
});
```

---

#### `initEntries`
**Type**: `Array<{ func: Function, order?: number }>`
**File Reference**: `src/boot.js:44, 201-208`

Init plugins can register initialization functions executed after init plugins load:

```javascript
// In an init plugin
window.MUSE_GLOBAL.initEntries.push({
  order: 10,
  func: async () => {
    await initialize();
    // Return false to prevent app from starting
  }
});
```

---

#### `appEntries`
**Type**: `Array<{ name: string, func: Function }>`
**File Reference**: `src/boot.js:43, 289-314`

Lib plugins can register app entry points (typically from `@ebay/muse-lib-react`):

```javascript
// In a lib plugin with isAppEntry: true
window.MUSE_GLOBAL.appEntries.push({
  name: '@ebay/muse-lib-react',
  func: renderApp
});
```

---

#### `pluginEntries`
**Type**: `Array<{ func: Function }>`
**File Reference**: `src/boot.js:45, 267-270`

Build system can register plugin initialization code:

```javascript
window.MUSE_GLOBAL.pluginEntries.push({
  func: () => {
    // Plugin initialization
  }
});
```

---

## 4. Exported Functionality

This plugin sets up `window.MUSE_GLOBAL` with the following utilities and systems:

### Global Utilities

#### `msgEngine`
**File Reference**: `src/boot.js:38`, `src/msgEngine.js`
**Purpose**: Message passing system for parent-child window communication

**Why it exists**: Enables MUSE apps embedded in iframes to communicate with their parent windows.

**Methods**:
- `sendToParent(message)` - Send message to parent window
- `addListener(key, handler)` - Listen for messages
- `removeListener(key)` - Remove message listener

---

#### `loading`
**File Reference**: `src/boot.js:39`, `src/loading.js`
**Purpose**: Loading UI management

**Why it exists**: Provides user feedback during the bootstrap process.

**Methods**:
- `init()` - Initialize loading UI
- `showMessage(message)` - Display loading message
- `hide()` - Hide loading UI

---

#### `error`
**File Reference**: `src/boot.js:40`, `src/error.js`
**Purpose**: Error UI management

**Why it exists**: Displays error messages when bootstrap fails.

**Methods**:
- `showMessage(message)` - Display error message

---

#### `getPublicPath(pluginName, assetPath)`
**File Reference**: `src/boot.js:51-76`
**Purpose**: Resolve public asset paths for plugins

**Why it exists**: Allows plugins to reference their public assets (images, fonts, etc.) correctly regardless of deployment environment.

**Usage**:
```javascript
const logoUrl = window.MUSE_GLOBAL.getPublicPath('@ebay/my-plugin', 'logo.png');
// Returns: /muse-assets/cdn/p/my-plugin/v1.0.0/dist/logo.png
```

---

#### `waitFor(asyncFuncOrPromise)`
**File Reference**: `src/boot.js:47-49`
**Purpose**: Register async operations that must complete before app starts

**Why it exists**: Allows init plugins to perform async initialization (auth, config loading) before the main app renders.

**Usage**:
```javascript
// In init plugin
window.MUSE_GLOBAL.waitFor(async () => {
  const user = await fetchUser();
  window.MUSE_GLOBAL.currentUser = user;
});
```

---

#### `getUser()`
**File Reference**: `src/boot.js:42`
**Purpose**: Get current user (default returns null, overridden by init plugins)

**Why it exists**: Provides a standard way to access user information across plugins.

---

### Shared Modules System

#### `__shared__`
**File Reference**: `src/boot.js:78-83`
**Purpose**: Runtime module sharing container

**Why it exists**: Enables lib plugins to provide shared modules (React, Redux, etc.) that other plugins consume without bundling.

**Properties**:
- `modules` - Container for shared modules
- `register(id, module)` - Register a shared module
- `require(id)` - Require a shared module
- `parseMuseId(id)` - Parse MUSE module identifier

**Note**: This is managed by `@ebay/muse-modules` package.

---

### Configuration System

#### `appConfig`
**File Reference**: `src/boot.js:27-37`
**Purpose**: Merged app and environment configuration

**Why it exists**: Provides a single source of truth for app configuration, with env config overriding app config.

**Usage**:
```javascript
const routerType = window.MUSE_GLOBAL.appConfig.routerType;
```

---

#### `appVariables`
**File Reference**: `src/boot.js:35`
**Purpose**: App-level runtime variables

---

#### `pluginVariables`
**File Reference**: `src/boot.js:36`
**Purpose**: Plugin-level runtime variables

---

### Environment Flags

#### `isSubApp`
**File Reference**: `src/boot.js:41`
**Purpose**: Boolean indicating if app is running in an iframe

**Why it exists**: Allows plugins to adjust behavior when embedded as a sub-app.

---

#### `isDev`
**File Reference**: `src/boot.js:86`
**Purpose**: Boolean indicating development mode

---

#### `isLocal`
**File Reference**: From `MUSE_GLOBAL`
**Purpose**: Boolean indicating local development mode

---

#### `isE2eTest`
**File Reference**: `src/boot.js:86`
**Purpose**: Boolean indicating E2E test mode

---

## 5. Integration Examples

**Note**: This boot plugin does not use the js-plugin extension point system. The examples below show how to integrate with the bootstrap environment it provides.

### Example 1: Creating an Init Plugin

Init plugins run after boot and before lib/normal plugins. They're perfect for authentication, configuration loading, or permission checks.

```javascript
// src/index.js in an init plugin
const initFunc = async () => {
  // Perform authentication
  const user = await fetch('/api/user').then(r => r.json());

  // Make user available globally
  window.MUSE_GLOBAL.getUser = () => user;

  // If auth fails, return false to prevent app from starting
  if (!user) {
    window.MUSE_GLOBAL.error.showMessage('Authentication failed');
    return false;
  }

  return true; // Continue startup
};

// Register init entry
window.MUSE_GLOBAL.initEntries.push({
  order: 10, // Lower numbers run first
  func: initFunc
});
```

---

### Example 2: Using waitFor for Async Initialization

```javascript
// In an init plugin
window.MUSE_GLOBAL.waitFor(async () => {
  // Load configuration from API
  const config = await fetch('/api/config').then(r => r.json());

  // Store in MUSE_GLOBAL
  window.MUSE_GLOBAL.appVariables.apiEndpoint = config.apiEndpoint;

  // Return false to prevent app start if config fails
  if (!config) return false;
});
```

---

### Example 3: Registering an App Entry (Lib Plugin)

```javascript
// In a lib plugin like @ebay/muse-lib-react
const renderApp = () => {
  const root = createRoot(document.getElementById('root'));
  root.render(<App />);
};

window.MUSE_GLOBAL.appEntries.push({
  name: '@ebay/muse-lib-react',
  func: renderApp
});
```

---

### Example 4: Using getPublicPath for Assets

```javascript
// In any plugin after bootstrap
import React from 'react';

const MyComponent = () => {
  const logoPath = window.MUSE_GLOBAL.getPublicPath(
    '@ebay/my-plugin',
    'images/logo.png'
  );

  return <img src={logoPath} alt="Logo" />;
};
```

---

### Example 5: Force Loading Specific Plugin Versions

For debugging or testing, use the `forcePlugins` query parameter:

```
https://myapp.com?forcePlugins=@ebay/my-plugin@1.2.3;other-plugin@2.0.0
```

This overrides the deployed plugin versions with specific versions.

---

## Notes

- **This is a boot plugin** (`muse.type: "boot"`) - it MUST be loaded first via `index.html`
- Does not use js-plugin extension points (runs before plugin system is initialized)
- Provides the foundational environment for all other plugins
- Handles plugin loading order: boot → init → lib → normal
- Init plugins can use `initEntries` or `waitFor` to perform async initialization
- Lib plugins with `isAppEntry: true` register app entry functions
- The `forcePlugins` query parameter is useful for debugging specific plugin versions
- Service worker registration is automatic but can be customized
- All plugin loading happens in parallel for performance (within each type group)
- The loading UI provides user feedback during the bootstrap process
