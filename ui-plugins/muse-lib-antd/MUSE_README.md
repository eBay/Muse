# Plugin Integration Guide: @ebay/muse-lib-antd

**Generated**: 2026-04-04
**Plugin Type**: lib

---

## 1. Plugin Purpose & Overview

`@ebay/muse-lib-antd` is a library plugin that provides the Ant Design 5 component library and supporting utilities for MUSE applications. As a lib plugin, it shares all Ant Design modules (components, icons) and its own source modules across all consuming plugins in the app, preventing duplication and ensuring consistent UI patterns.

**Key responsibilities:**
- **Shared UI library**: Makes all Ant Design 5 components and icons available to other plugins via module sharing
- **Theme management**: Provides dark/light theme switching through a ConfigProvider wrapper
- **Reusable components**: Exports common UI components (MetaMenu, TableBar, ErrorBox, etc.)
- **Form utilities**: Provides extension point helpers (`extendFormMeta`, `extendArray`) for building extensible forms
- **Nice Form integration**: Configures nice-form-react with Ant Design adapter and custom widgets

**Important**: This plugin uses MUSE's automatic module sharing. All modules in the dependency tree of `src/index.js` are automatically shared with other plugins — there is no `muse.exposes` config in `package.json`.

---

## 2. Extension Points Exposed

This plugin exposes **one extension point** that allows other plugins to customize the Ant Design configuration:

### 2.1. `museLibAntd.configProvider.processProps`

**Purpose**: Customize Ant Design ConfigProvider props (theme tokens, locale, etc.) before the provider wraps the app.

**Location**: `src/features/common/ConfigProviderWrapper.js:16`

**Signature**:
```javascript
museLibAntd.configProvider.processProps(configProps)
```

**Parameters**:
- `configProps` (object) - The ConfigProvider props object to modify. Contains `theme.algorithm` (dark/light mode).

**Usage**: Plugins can contribute to this extension point to modify theme tokens, add locale providers, or configure other Ant Design global settings.

**Example**:
```javascript
plugin.register({
  name: 'my-plugin',
  museLibAntd: {
    configProvider: {
      processProps: (configProps) => {
        // Customize theme tokens
        configProps.theme.token = {
          colorPrimary: '#00b96b',
          borderRadius: 2,
        };
      }
    }
  }
});
```

### Important Note on Extension Point Helpers

This plugin provides **two helper utilities** (`extendFormMeta` and `extendArray` in `src/utils.js`) that OTHER plugins can use to create extensible forms and arrays. These helpers are **exported utilities, not extension points exposed by muse-lib-antd**.

The helpers use `plugin.invoke()` internally, but these invocations are **not extension points exposed by this plugin**. Instead, they are extension points that will be created by OTHER plugins when they call these helpers.

**Example**: When another plugin calls `extendFormMeta(meta, 'myPlugin.myForm')`, it creates extension points like `myPlugin.myForm.getFields`. These belong to `myPlugin`, not to `muse-lib-antd`.

See Section 4.3 for details on how to use these helper utilities.

---

## 3. Extension Points Contributed

This plugin contributes to **three extension points** from other plugins:

### 3.1. `route`

**Contributed to**: Core router plugin (`@ebay/muse-boot-default` or similar)

**Purpose**: Registers plugin routes under `/plugin-muse-antd` path.

**What it does**: Adds a route configuration for the plugin's UI pages (currently minimal, mainly for demos/testing).

**Why it matters**: Allows the plugin to have its own page routes if needed, though as a lib plugin this is rarely used in production.

**Location**: `src/index.js:17` (spreads `route` from `src/common/routeConfig.js`)

### 3.2. `root.getProviders`

**Contributed to**: Root provider extension point (from boot plugin)

**Purpose**: Wraps the entire app with Ant Design's ConfigProvider for theme management and global configuration.

**What it does**: Returns a provider configuration with `order: 35`, ensuring the ConfigProvider wraps the app at the correct level in the provider hierarchy. The `ConfigProviderWrapper` component handles dark/light theme switching and allows other plugins to customize theme tokens via the `museLibAntd.configProvider.processProps` extension point.

**Why it matters**: Essential for Ant Design components to work properly — provides theme context, locale, and global config to all Ant Design components throughout the app.

**Location**: `src/index.js:18-26`

### 3.3. `reducer`

**Contributed to**: Redux store configuration (from boot plugin)

**Purpose**: Adds plugin state to the Redux store under `state.pluginEbayMuseLibAntd`.

**What it does**: Registers a Redux reducer that manages the plugin's state, specifically the `isDarkMode` flag for theme switching. The state persists the user's theme preference to localStorage.

**Why it matters**: Enables theme state management across the app and persists user's dark/light mode preference.

**Location**: `src/index.js:27` (spreads `reducer` from `src/common/rootReducer.js`)

---

## 4. Exported Functionality

This plugin exports functionality through **both module sharing (automatic) and explicit exports**:

### 4.1. Shared Modules (via default export)

The plugin's default export force-includes these modules for sharing:

**Location**: `src/index.js:32`

```javascript
export default { antd, icons, utils };
```

**Available modules**:
- `antd` - All Ant Design 5 components (Button, Table, Form, Modal, etc.)
- `icons` - All Ant Design icons from `@ant-design/icons`
- `utils` - Extension point helpers (`extendFormMeta`, `extendArray`)

**How to consume**:
```javascript
// In another plugin - import via shared modules
import { Button, Table, Form } from 'antd';
import { UserOutlined, SettingOutlined } from '@ant-design/icons';
import { extendFormMeta, extendArray } from '@ebay/muse-lib-antd/src/utils';
```

### 4.2. React Components

All components are available via module sharing from `src/features/common`:

**UI Components**:
- **`MetaMenu`** - Declarative menu component supporting nested items, icons, links, and extension points (`baseExtPoint` prop)
- **`TableBar`** - Search bar for tables with debounced search
- **`ErrorBox`** - Error display component with retry button and stack trace
- **`ErrorBoundary`** - React error boundary for catching component errors
- **`GlobalLoading`** - Full-screen loading indicator
- **`GlobalErrorBox`** - Modal error display
- **`LoadingMask`** - Inline loading overlay
- **`RequestStatus`** - Unified component for handling loading/error/success states
- **`Highlighter`** - Text highlighting component
- **`StatusLabel`** - Colored status badges
- **`CodeViewer`** - Syntax-highlighted code display with copy button
- **`DateView`** - Formatted date/time display
- **`BlockView`** - Display structured data blocks
- **`TagInput`** - Tag input component
- **`DropdownMenu`** - Dropdown menu with extension point support
- **`Icon`** - Ant Design icon wrapper
- **`ConfigProviderWrapper`** - Ant Design ConfigProvider with theme switching

**How to consume**:
```javascript
import { MetaMenu, TableBar, ErrorBox } from '@ebay/muse-lib-antd/src/features/common';
```

### 4.3. Utilities

**Extension Point Helpers** (`src/utils.js`):

These are utilities that OTHER plugins use to create their own extension points:

- **`extendFormMeta(meta, extBase, ...args)`** - Makes nice-form-react form metadata extensible via js-plugin. When a plugin calls this helper, it creates extension points under the provided `extBase` name for adding fields, preprocessing, and watching fields.

  Extension points created by calling this helper:
  - `${extBase}.preProcessMeta` - Called before processing fields
  - `${extBase}.getFields` - Returns additional form fields to add
  - `${extBase}.processMeta` - Called after adding fields
  - `${extBase}.postProcessMeta` - Called after processing
  - `${extBase}.getWatchingFields` - Returns fields to watch for changes

- **`extendArray(arr, extName, extBase, ...args)`** - Makes any array extensible via js-plugin. When a plugin calls this helper, it creates extension points under the provided `extBase` name for adding and processing array items.

  Extension points created by calling this helper (where `${capitalizedExtName}` is `extName` with first letter capitalized):
  - `${extBase}.preProcess${capitalizedExtName}` - Called before adding items
  - `${extBase}.get${capitalizedExtName}` - Returns additional items to add
  - `${extBase}.process${capitalizedExtName}` - Called after adding items
  - `${extBase}.postProcess${capitalizedExtName}` - Called after processing

**Important**: These helpers do NOT expose extension points from muse-lib-antd. They are utilities that other plugins use to create extension points in their own namespace.

**How to consume**:
```javascript
import { extendFormMeta, extendArray } from '@ebay/muse-lib-antd/src/utils';

// Example: Create an extensible form in YOUR plugin
function MyForm() {
  const formMeta = {
    fields: [
      { key: 'name', label: 'Name', widget: 'input' }
    ]
  };

  // This creates extension points like "myPlugin.userForm.getFields"
  // that OTHER plugins can contribute to
  const { meta, watchingFields } = extendFormMeta(
    formMeta,
    'myPlugin.userForm'  // YOUR plugin's extension point namespace
  );

  return <NiceForm meta={meta} />;
}
```

**Table Configuration** (`src/features/common/tableConfig.js`):
- `defaultProps` - Default Ant Design Table props (size, pagination config)
- `defaultSorter(key)` - Generic sorter function for table columns
- `defaultFilter(dataSource, key)` - Generic filter function for table columns

**How to consume**:
```javascript
import tableConfig from '@ebay/muse-lib-antd/src/features/common/tableConfig';

<Table {...tableConfig.defaultProps} columns={columns} dataSource={data} />
```

### 4.4. Redux Hooks

**Theme Management** (`src/features/common/redux/hooks.js`):

- **`useSetIsDarkMode()`** - React hook for reading and setting dark mode
  - Returns: `{ isDarkMode: boolean, setIsDarkMode: (isDarkMode: boolean) => void }`
  - Persists to localStorage as `'muse.theme'`

**How to consume**:
```javascript
import { useSetIsDarkMode } from '@ebay/muse-lib-antd/src/features/common/redux/hooks';

function MyComponent() {
  const { isDarkMode, setIsDarkMode } = useSetIsDarkMode();
  return <Switch checked={isDarkMode} onChange={setIsDarkMode} />;
}
```

### 4.5. Nice Modal Registration

**Pre-registered modals** (via `nice-modal-react`):

- `'muse-lib-antd.loading-modal'` - Global loading modal component

**How to consume**:
```javascript
import { show } from '@ebay/nice-modal-react';

// Show loading modal
show('muse-lib-antd.loading-modal');
```

---

## 5. Consumed Exports (Runtime Dependencies)

This plugin **does not consume exports from other plugins**. All inter-plugin collaboration is done through extension points (contributing to `route`, `root.getProviders`, and `reducer` extension points from the boot plugin).

The plugin has **zero tight coupling** — it does not use `plugin.getPlugin(...).exports` to access other plugins' functionality directly.

---

## 6. Integration Examples

### 6.1. Extending This Plugin

#### Customize Ant Design Theme

```javascript
plugin.register({
  name: 'my-theme-plugin',
  museLibAntd: {
    configProvider: {
      processProps: (configProps) => {
        configProps.theme.token = {
          colorPrimary: '#1890ff',
          borderRadius: 4,
          fontSize: 14,
        };
      }
    }
  }
});
```

### 6.2. Using Exported Utilities

#### Create Extensible Forms (using extendFormMeta helper)

```javascript
import { extendFormMeta } from '@ebay/muse-lib-antd/src/utils';

// In YOUR plugin, create a form with extension points
function UserForm() {
  const meta = {
    fields: [
      { key: 'name', label: 'Name', widget: 'input' }
    ]
  };

  // This creates extension points in YOUR plugin's namespace:
  // - myPlugin.userForm.getFields
  // - myPlugin.userForm.preProcessMeta
  // - myPlugin.userForm.processMeta
  // - myPlugin.userForm.postProcessMeta
  // - myPlugin.userForm.getWatchingFields
  const { meta: finalMeta, watchingFields } = extendFormMeta(
    meta,
    'myPlugin.userForm'  // YOUR extension point namespace
  );

  return <NiceForm meta={finalMeta} />;
}

// Now OTHER plugins can extend YOUR form:
plugin.register({
  name: 'extension-plugin',
  myPlugin: {  // Extending myPlugin's extension points
    userForm: {
      getFields: () => [
        { key: 'email', label: 'Email', widget: 'input' }
      ]
    }
  }
});
```

#### Create Extensible Menus (using MetaMenu with baseExtPoint)

```javascript
import { MetaMenu } from '@ebay/muse-lib-antd/src/features/common';

// In YOUR plugin
function Sidebar() {
  const menuMeta = {
    items: [
      { key: 'home', label: 'Home', link: '/' }
    ]
  };

  // baseExtPoint creates extension points in YOUR namespace:
  // - myPlugin.sidebar.menu.getItems
  // - myPlugin.sidebar.menu.processItems
  return <MetaMenu meta={menuMeta} baseExtPoint="myPlugin.sidebar.menu" />;
}

// Other plugins can add menu items to YOUR sidebar:
plugin.register({
  name: 'extension-plugin',
  myPlugin: {  // Extending myPlugin's extension points
    sidebar: {
      menu: {
        getItems: () => [
          { key: 'settings', label: 'Settings', link: '/settings', order: 10 }
        ]
      }
    }
  }
});
```

#### Create Extensible Arrays (using extendArray helper)

```javascript
import { extendArray } from '@ebay/muse-lib-antd/src/utils';

// In YOUR plugin
function ActionBar() {
  const actions = [
    { key: 'save', label: 'Save', onClick: handleSave }
  ];

  // This creates extension points in YOUR namespace:
  // - myPlugin.actionBar.getActions
  // - myPlugin.actionBar.preProcessActions
  // - myPlugin.actionBar.processActions
  // - myPlugin.actionBar.postProcessActions
  extendArray(actions, 'actions', 'myPlugin.actionBar');

  return (
    <div>
      {actions.map(action => (
        <Button key={action.key} onClick={action.onClick}>
          {action.label}
        </Button>
      ))}
    </div>
  );
}

// Other plugins can add actions to YOUR action bar:
plugin.register({
  name: 'extension-plugin',
  myPlugin: {  // Extending myPlugin's extension points
    actionBar: {
      getActions: () => [
        { key: 'export', label: 'Export', onClick: handleExport, order: 20 }
      ]
    }
  }
});
```

### 6.3. Using Ant Design Components

```javascript
import { Button, Table, Form, Modal, Drawer } from 'antd';
import { UserOutlined, SettingOutlined } from '@ant-design/icons';

function MyComponent() {
  return (
    <div>
      <Button type="primary" icon={<UserOutlined />}>
        Click Me
      </Button>
    </div>
  );
}
```

### 6.4. Using UI Components

```javascript
import {
  TableBar,
  ErrorBox,
  RequestStatus,
  MetaMenu
} from '@ebay/muse-lib-antd/src/features/common';

function MyTable() {
  const [search, setSearch] = useState('');

  return (
    <div>
      <TableBar search={search} onSearch={setSearch} />
      <RequestStatus
        pending={loading}
        error={error}
        loadingMode="skeleton"
      >
        <Table dataSource={filteredData} />
      </RequestStatus>
    </div>
  );
}
```

### 6.5. Using Theme Hook

```javascript
import { useSetIsDarkMode } from '@ebay/muse-lib-antd/src/features/common/redux/hooks';
import { Switch } from 'antd';

function ThemeToggle() {
  const { isDarkMode, setIsDarkMode } = useSetIsDarkMode();

  return (
    <Switch
      checked={isDarkMode}
      onChange={setIsDarkMode}
      checkedChildren="Dark"
      unCheckedChildren="Light"
    />
  );
}
```

### 6.6. Using Table Configuration

```javascript
import tableConfig from '@ebay/muse-lib-antd/src/features/common/tableConfig';

<Table
  {...tableConfig.defaultProps}
  columns={[
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: tableConfig.defaultSorter('name'),
      ...tableConfig.defaultFilter(dataSource, 'name')
    }
  ]}
  dataSource={data}
/>
```

---

## 7. Architecture Notes

### Plugin Type: lib

As a lib plugin, `@ebay/muse-lib-antd`:
- Loads **before normal plugins** in the boot sequence (boot → init → lib → normal)
- **Shares all modules** in its dependency tree automatically (no manual `muse.exposes` config needed)
- Prevents duplication of Ant Design components and utilities across plugins
- Must be deployed before normal plugins that consume it

### Theme Architecture

The plugin implements a two-layer theme system:
1. **Base theme switching** (dark/light) - Managed via Redux state and ConfigProvider's `theme.algorithm`
2. **Theme customization** - Other plugins can contribute via `museLibAntd.configProvider.processProps` to customize tokens

### Extension Point Pattern

**Key concept**: This plugin provides **utility helpers** (`extendFormMeta`, `extendArray`) that other plugins use to create extension points in their OWN namespaces.

- The `plugin.invoke()` calls inside these helpers are **not** extension points exposed by muse-lib-antd
- They are extension points that will be created by the plugins that call these helpers
- Example: When `pluginA` calls `extendFormMeta(meta, 'pluginA.myForm')`, it creates extension points like `pluginA.myForm.getFields` that `pluginB` can contribute to

### Nice Form Integration

The plugin pre-configures nice-form-react with:
- Ant Design adapter for component rendering
- Custom widgets: `tag`, `tag-view`, `date-view`, `time-view`, `datetime-view`

This allows all plugins using nice-form-react to benefit from Ant Design components without additional setup.

---

## 8. TypeScript Support

The plugin provides TypeScript definitions in `src/index.d.ts` for:
- All exported components with full prop types
- Utility function signatures
- Form metadata interfaces

Import types from:
```typescript
import type { MetaMenuProps, FormMeta } from '@ebay/muse-lib-antd/src/features/common';
```

---

## 9. Dependencies

**Key dependencies** (automatically shared):
- `antd` (5.19.0) - Ant Design component library
- `@ant-design/icons` (5.3.7) - Ant Design icon set
- `@ebay/nice-form-react` (2.0.3) - Form metadata framework
- `@ebay/muse-lib-react` (1.3.0) - React library plugin (provides React, Redux, React Router)
- `js-plugin` (1.1.0) - Extension point engine
- `lodash` (4.17.21) - Utility functions
- `moment` (2.29.4) - Date manipulation
- `react-highlight-words` (0.20.0) - Text highlighting
- `react-syntax-highlighter` (15.5.0) - Code syntax highlighting

All dependencies in the import tree are automatically shared with consuming plugins.
