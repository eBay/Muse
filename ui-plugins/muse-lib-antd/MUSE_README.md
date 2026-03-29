# Plugin Integration Guide: @ebay/muse-lib-antd

**Generated**: 2026-03-28
**Plugin Type**: lib

---

## Table of Contents

1. [Plugin Purpose & Overview](#1-plugin-purpose--overview)
2. [Extension Points Exposed](#2-extension-points-exposed)
3. [Extension Points Contributed](#3-extension-points-contributed)
4. [Exported Functionality](#4-exported-functionality)
5. [Integration Examples](#5-integration-examples)

---

## 1. Plugin Purpose & Overview

### What This Plugin Does

`@ebay/muse-lib-antd` is a library plugin that provides Ant Design (antd) UI components and utilities to MUSE applications. It serves as a shared UI framework layer, preventing code duplication by providing a single instance of Ant Design that all consuming plugins can use.

### Key Features

- **Ant Design Components**: Provides the complete Ant Design 5.x component library as shared modules
- **Reusable UI Components**: Offers custom-built components like MetaMenu, DropdownMenu, ErrorBox, CodeViewer, and more
- **Form Utilities**: Provides extensible form and array utilities via `extendFormMeta()` and `extendArray()`
- **Nice Form Integration**: Pre-configured Nice Form React with Ant Design adapter and custom widgets
- **Dark Mode Support**: Built-in dark mode theme switching with Redux state management
- **React Router Integration**: Provides route configuration and React Router setup
- **Redux State Management**: Includes Redux reducer for common state (dark mode, etc.)
- **Config Provider Wrapper**: Extensible Ant Design ConfigProvider with theme management

### Plugin Type: lib

As a **lib plugin**, this plugin loads before normal plugins and provides shared modules to avoid duplicating dependencies. Other plugins that depend on Ant Design or React will consume these modules from this plugin rather than bundling their own copies, reducing bundle size and ensuring version consistency.

---

## 2. Extension Points Exposed

This plugin exposes the following extension points that OTHER plugins can implement to extend its functionality.

### Summary

- **Total Extension Points**: 7 base patterns (expandable to unlimited via parameter-based extension points)
- **Categories**: Form Extensions, Array Extensions, Menu Extensions, ConfigProvider Extensions

### Extension Point Patterns

This plugin uses **parameter-based extension points**, where the extension point name is passed as a parameter to utility functions. This allows unlimited extensibility without hardcoding specific extension point names.

#### Form Extension Pattern (via `extendFormMeta`)

**Base Extension Point**: `${extBase}.*` (where `extBase` is provided by caller)

When a plugin calls `extendFormMeta(meta, extBase, ...args)`, other plugins can implement these extension points:

##### `${extBase}.preProcessMeta`

- **Purpose**: Hook to modify form metadata before fields are added
- **When Invoked**: Called at the start of `extendFormMeta()`, before any field processing
- **Context Parameters**:
  - `...args`: Variable arguments passed through from the caller
- **Expected Return**: `void` (modifies arguments in place)
- **Use Case Example**: Initialize form state, add validators, or set up form-level configuration
- **File Reference**: src/utils.js:12

##### `${extBase}.getFields`

- **Purpose**: Allows plugins to contribute additional fields to the form
- **When Invoked**: Called during form metadata construction to gather field definitions
- **Context Parameters**:
  - `...args`: Variable arguments passed through from the caller (typically includes form context, record data, etc.)
- **Expected Return**: `Array<FieldDefinition>` - Array of Nice Form field definitions
- **Use Case Example**: Add custom fields to app creation form, plugin info form, or any extensible form
- **File Reference**: src/utils.js:13

##### `${extBase}.processMeta`

- **Purpose**: Hook to modify the complete form metadata after fields are added
- **When Invoked**: Called after all fields are collected but before post-processing
- **Context Parameters**:
  - `...args`: Variable arguments passed through from the caller
- **Expected Return**: `void` (modifies metadata in place)
- **Use Case Example**: Reorder fields, add field dependencies, modify field properties based on other fields
- **File Reference**: src/utils.js:15

##### `${extBase}.postProcessMeta`

- **Purpose**: Final hook to modify form metadata after all processing
- **When Invoked**: Called after all other form processing is complete
- **Context Parameters**:
  - `...args`: Variable arguments passed through from the caller
- **Expected Return**: `void` (modifies metadata in place)
- **Use Case Example**: Apply final validation rules, add computed fields, or finalize form layout
- **File Reference**: src/utils.js:16

##### `${extBase}.getWatchingFields`

- **Purpose**: Allows plugins to define fields that should be watched for changes
- **When Invoked**: Called during form metadata construction to gather watching field configurations
- **Context Parameters**:
  - `...args`: Variable arguments passed through from the caller
- **Expected Return**: `Array<WatchingFieldConfig>` - Array of watching field configurations for Nice Form
- **Use Case Example**: Define field dependencies where one field's value affects another's visibility or validation
- **File Reference**: src/utils.js:20

#### Array Extension Pattern (via `extendArray`)

**Base Extension Point**: `${extBase}.*` (where `extBase` and `extName` are provided by caller)

When a plugin calls `extendArray(arr, extName, extBase, ...args)`, other plugins can implement these extension points:

##### `${extBase}.preProcess${CapitalizedExtName}`

- **Purpose**: Hook to process array before items are added
- **When Invoked**: Called at the start of `extendArray()`, before collecting items
- **Context Parameters**:
  - `...args`: Variable arguments passed through from the caller
- **Expected Return**: `void` (modifies arguments in place)
- **Use Case Example**: Initialize array context, set up filters
- **File Reference**: src/utils.js:38

##### `${extBase}.get${CapitalizedExtName}`

- **Purpose**: Allows plugins to contribute items to the array
- **When Invoked**: Called during array construction to gather items
- **Context Parameters**:
  - `...args`: Variable arguments passed through from the caller
- **Expected Return**: `Array<any>` - Array of items to add
- **Use Case Example**: Add table columns, menu items, action buttons, tabs, etc.
- **File Reference**: src/utils.js:39

##### `${extBase}.process${CapitalizedExtName}`

- **Purpose**: Hook to modify array after items are collected
- **When Invoked**: Called after all items are gathered but before post-processing
- **Context Parameters**:
  - `...args`: Variable arguments passed through from the caller
- **Expected Return**: `void` (modifies array in place)
- **Use Case Example**: Filter, reorder, or transform items
- **File Reference**: src/utils.js:41

##### `${extBase}.postProcess${CapitalizedExtName}`

- **Purpose**: Final hook to modify array after all processing
- **When Invoked**: Called after all other processing is complete
- **Context Parameters**:
  - `...args`: Variable arguments passed through from the caller
- **Expected Return**: `void` (modifies array in place)
- **Use Case Example**: Apply final transformations, add computed items
- **File Reference**: src/utils.js:42

#### MetaMenu Extension Pattern

**Base Extension Point**: `${baseExtPoint}.*` (where `baseExtPoint` is provided via props)

##### `${baseExtPoint}.getItems`

- **Purpose**: Allows plugins to contribute menu items to a MetaMenu component
- **When Invoked**: Called when MetaMenu renders, if `baseExtPoint` prop is provided
- **Context Parameters**:
  - `meta`: Object - The menu metadata object containing configuration
- **Expected Return**: `Array<MetaMenuItem>` - Array of menu item definitions
- **Use Case Example**: Add custom menu items to application sidebar, header menu, or dropdown menus
- **File Reference**: src/features/common/MetaMenu.js:23

##### `${baseExtPoint}.processItems`

- **Purpose**: Hook to modify all menu items after they're collected and normalized
- **When Invoked**: Called after all items (from meta and extensions) are collected, normalized, and have parent-child relationships resolved
- **Context Parameters**:
  - `meta`: Object - The menu metadata object
  - `newItems`: Array - The normalized array of menu items
  - `itemByKey`: Object - Map of menu items keyed by their key property
- **Expected Return**: `void` (modifies items in place)
- **Use Case Example**: Reorder items, hide items based on permissions, add badges or notifications
- **File Reference**: src/features/common/MetaMenu.js:57

#### DropdownMenu Extension Pattern

**Extension Point**: Custom (passed via `extPoint` prop)

When a DropdownMenu component is rendered with an `extPoint` prop, it invokes that extension point:

##### Custom Extension Point (via `extPoint` prop)

- **Purpose**: Allows plugins to modify dropdown menu items dynamically
- **When Invoked**: Called during DropdownMenu rendering, before items are processed
- **Context Parameters**:
  - `items`: Array - The menu items array to modify
  - `...extPointParams`: Variable arguments passed via the `extPointParams` prop
- **Expected Return**: `void` (modifies items array in place)
- **Use Case Example**: Add context-specific actions to record dropdown menus, filter items based on permissions
- **File Reference**: src/features/common/DropdownMenu.js:38

#### ConfigProvider Extension

##### `museLibAntd.configProvider.processProps`

- **Purpose**: Allows plugins to modify Ant Design ConfigProvider props (e.g., theme tokens, component defaults)
- **When Invoked**: Called when ConfigProviderWrapper renders, before passing props to Ant Design's ConfigProvider
- **Context Parameters**:
  - `configProps`: Object - The ConfigProvider props object with structure `{ theme: { algorithm: ... } }`
- **Expected Return**: `void` (modifies configProps in place)
- **Use Case Example**: Customize theme tokens (borderRadius, colors), add locale configuration, set component-level defaults
- **File Reference**: src/features/common/ConfigProviderWrapper.js:16

### Usage Example

**CRITICAL**: Extension points are **nested object properties**, NOT string paths!

```javascript
// Example: Extending a form via extendFormMeta
// ✅ CORRECT - nested object properties
plugin.register({
  name: 'my-custom-plugin',
  am: {
    createAppForm: {
      getFields: (context) => {
        return [
          {
            key: 'customField',
            label: 'Custom Field',
            widget: 'input',
            order: 100,
          }
        ];
      },
      processMeta: (context) => {
        // Modify form metadata after fields are added
        context.meta.fields.forEach(field => {
          if (field.key === 'appName') {
            field.required = true;
          }
        });
      }
    }
  }
});

// Example: Customizing Ant Design theme
// ✅ CORRECT - nested object properties
plugin.register({
  name: 'my-theme-plugin',
  museLibAntd: {
    configProvider: {
      processProps: (configProps) => {
        configProps.theme.token = {
          colorPrimary: '#00b96b',
          borderRadius: 2,
        };
      }
    }
  }
});

// Example: Adding items to a MetaMenu
// ✅ CORRECT - nested object properties
plugin.register({
  name: 'my-menu-plugin',
  museLayout: {
    siderMenu: {
      getItems: (meta) => {
        return [
          {
            key: 'custom-item',
            label: 'Custom Menu Item',
            icon: 'star',
            link: '/custom-page',
            order: 50,
          }
        ];
      }
    }
  }
});
```

---

## 3. Extension Points Contributed

This plugin implements the following extension points from OTHER plugins to integrate with the MUSE ecosystem.

### Summary

- **Total Contributions**: 3
- **Host Plugins**: @ebay/muse-lib-react

### By Host Plugin

#### Contributes to: @ebay/muse-lib-react

##### `route`

- **Invoked By**: @ebay/muse-lib-react routing system
- **What This Plugin Provides**: Route configuration for `/plugin-muse-antd` path with common feature routes
- **Why Needed**: Registers the plugin's route structure so it can be accessed via React Router
- **File Reference**: src/index.js:17, src/common/routeConfig.js:1-16

##### `root.getProviders`

- **Invoked By**: @ebay/muse-lib-react root component provider chain
- **What This Plugin Provides**: Ant Design ConfigProviderWrapper with dark mode support
- **Why Needed**: Wraps the app with Ant Design's ConfigProvider to enable theming, localization, and component configuration. Sets order to 35 to ensure it wraps most other providers.
- **File Reference**: src/index.js:18-26, src/features/common/ConfigProviderWrapper.js:1-18

##### `reducer`

- **Invoked By**: @ebay/muse-lib-react Redux store configuration
- **What This Plugin Provides**: Redux reducer managing common state (currently dark mode preference)
- **Why Needed**: Manages shared state for dark mode theme switching and persists preference to localStorage
- **File Reference**: src/index.js:27, src/common/rootReducer.js:1-14

---

## 4. Exported Functionality

This plugin exports the following functionality for use by other plugins.

**Access via**: `plugin.getPlugin('@ebay/muse-lib-antd').exports`

### Library Modules (Shared Dependencies)

As a **lib plugin**, this plugin's primary export is the complete set of Ant Design and icon modules, which are automatically shared with consuming plugins via MUSE's module federation system:

#### Default Export Object

```javascript
{
  antd,    // Complete Ant Design 5.x library (all components)
  icons,   // @ant-design/icons (all Ant Design icons)
  utils,   // This plugin's utility functions
}
```

- **`antd`**: Complete Ant Design 5.19.0 component library
  - **Access**: Other plugins import from 'antd' and it resolves to this shared instance
  - **Why Exported**: Prevents duplicate Ant Design bundles across plugins, ensures version consistency
  - **Components Include**: Button, Table, Form, Modal, Drawer, Menu, Layout, Input, Select, DatePicker, etc. (100+ components)

- **`icons`**: Complete @ant-design/icons 5.3.7 icon library
  - **Access**: Other plugins import from '@ant-design/icons' and it resolves to this shared instance
  - **Why Exported**: Prevents duplicate icon bundles, ensures consistent icon versions
  - **Icons Include**: All Ant Design icons (outlined, filled, two-tone)

- **`utils`**: Utility functions for extensibility
  - **Access**: Import from '@ebay/muse-lib-antd/src/utils'
  - **Why Exported**: Provides helpers for making forms and arrays extensible via extension points

### Components (from src/features/common)

The following custom components are exported via standard ES6 exports (not via plugin.exports):

#### UI Components

- **`MetaMenu`**: Metadata-driven menu component with extension point support
  - **Purpose**: Render Ant Design menus from declarative configuration with plugin extensibility
  - **Props**: `meta` (menu config), `baseExtPoint` (extension point base), `autoSort` (auto-sort items)
  - **Use Cases**: Sidebar menus, header menus, dropdown menus with plugin-contributed items
  - **File Reference**: src/features/common/MetaMenu.js:1-165

- **`DropdownMenu`**: Dropdown menu with actions and extension point support
  - **Purpose**: Render dropdown menus with highlighted actions and extension points
  - **Props**: `items`, `triggerNode`, `extPoint`, `extPointParams`, `size`
  - **Use Cases**: Record action menus, context menus
  - **File Reference**: src/features/common/DropdownMenu.js:1-93

- **`ErrorBox`**: Error display component with retry functionality
  - **Purpose**: Display errors with stack traces, retry buttons, and customizable messaging
  - **Props**: `title`, `content`, `error`, `onRetry`, `showStack`, `btnSize`
  - **Use Cases**: Error boundaries, API error display, validation errors
  - **File Reference**: src/features/common/ErrorBox.js

- **`ErrorBoundary`**: React error boundary component
  - **Purpose**: Catch React rendering errors and display fallback UI
  - **Props**: `message`, `children`
  - **Use Cases**: Wrap components to prevent entire app crashes
  - **File Reference**: src/features/common/ErrorBoundary.js

- **`GlobalLoading`**: Full-page or container loading indicator
  - **Purpose**: Display loading spinner overlays
  - **Props**: `full` (boolean for full-page mode)
  - **Use Cases**: Page transitions, async data loading
  - **File Reference**: src/features/common/GlobalLoading.js

- **`GlobalErrorBox`**: Modal error display
  - **Purpose**: Display errors in modal dialogs
  - **Props**: `title`, `error`, `onOk`, `okText`, `onClose`
  - **Use Cases**: Critical errors, API failures that need user acknowledgment
  - **File Reference**: src/features/common/GlobalErrorBox.js

- **`CodeViewer`**: Syntax-highlighted code display
  - **Purpose**: Display formatted code with syntax highlighting and copy functionality
  - **Props**: `code`, `language`, `theme`, `allowCopy`, `title`
  - **Use Cases**: Display JSON, YAML, JavaScript, or other code snippets
  - **File Reference**: src/features/common/CodeViewer.js

- **`BlockView`**: Formatted value display component
  - **Purpose**: Display values in a consistent block format, with email link support
  - **Props**: `value`, `openEmail`
  - **Use Cases**: Display field values in view mode, form field previews
  - **File Reference**: src/features/common/BlockView.js

- **`DateView`**: Date/time display component
  - **Purpose**: Format and display dates/times with various format options
  - **Props**: `value`, `dateOnly`, `timeOnly`, `dateFormat`, `timeFormat`
  - **Use Cases**: Display timestamps, dates, or times in consistent format
  - **File Reference**: src/features/common/DateView.js

- **`Highlighter`**: Text search highlighting component
  - **Purpose**: Highlight search terms within text
  - **Props**: `search`, `text`
  - **Use Cases**: Search results, filtered lists
  - **File Reference**: src/features/common/Highlighter.js

- **`Icon`**: Icon wrapper component
  - **Purpose**: Render Ant Design icons with consistent API
  - **Props**: `type`, `className`, `onClick`, `style`
  - **Use Cases**: Consistent icon rendering across app
  - **File Reference**: src/features/common/Icon.js

- **`LoadingMask`**: Inline loading indicator
  - **Purpose**: Display loading state for components
  - **Use Cases**: Inline component loading states
  - **File Reference**: src/features/common/LoadingMask.js

- **`PageNotFound`**: 404 error page component
  - **Purpose**: Display "page not found" error page
  - **Use Cases**: React Router fallback route
  - **File Reference**: src/features/common/PageNotFound.js

- **`RequestStatus`**: Request state management component
  - **Purpose**: Handle loading, error, and success states for async requests
  - **Props**: `pending`, `loading`, `error`, `errorMode`, `loadingMode`, `dismissError`
  - **Use Cases**: Wrap async components to handle loading/error states
  - **File Reference**: src/features/common/RequestStatus.js

- **`StatusLabel`**: Status badge component
  - **Purpose**: Display status with colored labels
  - **Props**: `label`, `type` (SUCCESS, FAILURE, PROCESSING, etc.)
  - **Use Cases**: Display plugin status, request status, app status
  - **File Reference**: src/features/common/StatusLabel.js

- **`TableBar`**: Table toolbar with search
  - **Purpose**: Provide search bar and actions for tables
  - **Props**: `onSearch`, `search`, `placeholder`, `children`
  - **Use Cases**: Table filtering, bulk actions
  - **File Reference**: src/features/common/TableBar.js

- **`TagInput`**: Tag input widget
  - **Purpose**: Input component for entering multiple tags
  - **Props**: `max`, `value`, `onChange`
  - **Use Cases**: Form fields for arrays of strings (tags, labels, keywords)
  - **File Reference**: src/features/common/TagInput.js

- **`ConfigProviderWrapper`**: Ant Design ConfigProvider with dark mode
  - **Purpose**: Wrap app with Ant Design theme provider and dark mode support
  - **Props**: `children`
  - **Use Cases**: Root-level provider for Ant Design theming
  - **File Reference**: src/features/common/ConfigProviderWrapper.js

### Utilities (from src/utils.js)

- **`extendFormMeta(meta, extBase, ...args)`**: Make Nice Form metadata extensible
  - **Purpose**: Allow plugins to extend form definitions via extension points
  - **Parameters**:
    - `meta`: FormMeta object with `fields` array
    - `extBase`: String - base name for extension points (e.g., 'am.createAppForm')
    - `...args`: Additional arguments passed to extension point handlers
  - **Returns**: `{ watchingFields: Array, meta: FormMeta }`
  - **Extension Points Invoked**:
    - `${extBase}.preProcessMeta`
    - `${extBase}.getFields`
    - `${extBase}.processMeta`
    - `${extBase}.postProcessMeta`
    - `${extBase}.getWatchingFields`
  - **Use Cases**: Create extensible forms in manager UIs where plugins can add custom fields
  - **File Reference**: src/utils.js:11-23

- **`extendArray(arr, extName, extBase, ...args)`**: Make arrays extensible
  - **Purpose**: Allow plugins to extend arrays (columns, actions, tabs, etc.) via extension points
  - **Parameters**:
    - `arr`: Array - the array to extend
    - `extName`: String - name of the array type (e.g., 'columns', 'actions')
    - `extBase`: String - base name for extension points (e.g., 'pm.pluginList')
    - `...args`: Additional arguments passed to extension point handlers
  - **Returns**: The modified array
  - **Extension Points Invoked**:
    - `${extBase}.preProcess${CapitalizedExtName}`
    - `${extBase}.get${CapitalizedExtName}`
    - `${extBase}.process${CapitalizedExtName}`
    - `${extBase}.postProcess${CapitalizedExtName}`
  - **Use Cases**: Create extensible table columns, action menus, tabs, etc.
  - **File Reference**: src/utils.js:36-45

### Other Resources

- **History Object**: Browser history singleton for programmatic navigation
  - **Access**: Import from '@ebay/muse-lib-antd/src/common/history'
  - **Type**: `BrowserHistory` from history v5
  - **Global Access**: Also available at `window.MUSE_ANTD_HISTORY`
  - **Methods**: `push(path)`, `replace(path)`, `go(n)`, `goBack()`, `goForward()`
  - **Use Cases**: Navigate programmatically without React Router hooks, imperative navigation in non-component code
  - **File Reference**: src/common/history.js:1-6

- **Table Configuration**: Default Ant Design table props and utilities
  - **Access**: Import from '@ebay/muse-lib-antd/src/features/common/tableConfig'
  - **Exports**: `defaultProps`, `defaultSorter`, `defaultFilter`
  - **Use Cases**: Consistent table configuration across app
  - **File Reference**: src/features/common/tableConfig.js:1-42

- **Redux State**: Dark mode state management
  - **Hook**: `useSetIsDarkMode()` - Returns `{ isDarkMode, setIsDarkMode }`
  - **Action**: `setIsDarkMode(isDarkMode)` - Dispatch action to toggle dark mode
  - **Use Cases**: Theme switching, dark mode preferences
  - **File Reference**: src/features/common/redux/setIsDarkMode.js:1-31

- **Modals**: Pre-registered Nice Modal React modals
  - **Modal ID**: `'muse-lib-antd.loading-modal'`
  - **Component**: LoadingModal
  - **Use Cases**: Show loading dialogs via Nice Modal React
  - **File Reference**: src/modals.js:1-4

- **Nice Form Widgets**: Custom form widgets registered with Nice Form
  - **Widgets**:
    - `'tag'`: TagInput component
    - `'tag-view'`: BlockView component
    - `'date-view'`: DateView (dateOnly)
    - `'time-view'`: DateView (timeOnly)
    - `'datetime-view'`: DateView (full)
  - **Use Cases**: Use in Nice Form field definitions
  - **File Reference**: src/initNiceForm.jsx:1-16

### Using Exported Functionality

```javascript
// Accessing shared Ant Design components (automatic via module federation)
import { Button, Table, Form } from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';

// Using custom components
import {
  MetaMenu,
  DropdownMenu,
  ErrorBox,
  CodeViewer,
  DateView
} from '@ebay/muse-lib-antd/src/features/common';

// Using utilities
import { extendFormMeta, extendArray } from '@ebay/muse-lib-antd/src/utils';

// Example: Make a form extensible
const meta = {
  fields: [
    { key: 'name', label: 'Name', widget: 'input' }
  ]
};

const { watchingFields, meta: extendedMeta } = extendFormMeta(
  meta,
  'myPlugin.myForm',
  { context: 'additional data' }
);

// Example: Make a table columns array extensible
const columns = [
  { key: 'name', title: 'Name', dataIndex: 'name' }
];

extendArray(columns, 'columns', 'myPlugin.myTable', tableData);

// Example: Using dark mode
import { useSetIsDarkMode } from '@ebay/muse-lib-antd/src/features/common/redux/hooks';

function MyComponent() {
  const { isDarkMode, setIsDarkMode } = useSetIsDarkMode();

  return (
    <button onClick={() => setIsDarkMode(!isDarkMode)}>
      Toggle Theme (current: {isDarkMode ? 'dark' : 'light'})
    </button>
  );
}

// Example: Using MetaMenu
const menuMeta = {
  items: [
    { key: 'home', label: 'Home', link: '/', icon: 'home' },
    { key: 'settings', label: 'Settings', link: '/settings', icon: 'setting' }
  ],
  autoActive: true,
  mode: 'inline'
};

<MetaMenu
  meta={menuMeta}
  baseExtPoint="myPlugin.siderMenu"
  autoSort={true}
/>

// Example: Using history for programmatic navigation
import history from '@ebay/muse-lib-antd/src/common/history';

// Navigate to a different route
function handleCreateSuccess(newId) {
  history.push(`/items/${newId}`);
}

// Or access via global
window.MUSE_ANTD_HISTORY.push('/dashboard');
```

**Note**: As a lib plugin, the primary value is providing shared Ant Design modules. The custom components and utilities are secondary exports that build on top of the shared foundation.

---

## 5. Integration Examples

**CRITICAL**: Extension points are **nested object properties**, NOT string paths!

### ✅ CORRECT Syntax
```javascript
plugin.register({
  name: 'my-plugin',
  pluginName: {
    extensionPoint: (context) => {
      // Your implementation
    }
  }
});
```

### ❌ INCORRECT Syntax
```javascript
plugin.register({
  name: 'my-plugin',
  'pluginName.extensionPoint': (context) => {  // WRONG!
    // This will NOT work!
  }
});
```

---

### Example 1: Using Shared Ant Design Components

Since `@ebay/muse-lib-antd` is a lib plugin, consuming plugins automatically use its shared Ant Design instance:

```javascript
// In your plugin - automatically uses shared antd from muse-lib-antd
import React from 'react';
import { Button, Table, Form, Modal } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';

export default function MyComponent() {
  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />}>
        Create User
      </Button>
      <Table
        dataSource={data}
        columns={columns}
      />
    </div>
  );
}
```

### Example 2: Extending Forms with Custom Fields

```javascript
import plugin from 'js-plugin';

// ✅ CORRECT - nested object properties
plugin.register({
  name: 'my-custom-plugin',

  // Add fields to the create app form
  am: {
    createAppForm: {
      getFields: (context) => {
        return [
          {
            key: 'githubRepo',
            label: 'GitHub Repository',
            widget: 'input',
            placeholder: 'org/repo',
            order: 100,
            required: true,
          },
          {
            key: 'slackChannel',
            label: 'Slack Channel',
            widget: 'input',
            placeholder: '#channel-name',
            order: 101,
          }
        ];
      },

      // Modify form after all fields are added
      processMeta: (context) => {
        const { meta } = context;

        // Make appName field required
        const appNameField = meta.fields.find(f => f.key === 'appName');
        if (appNameField) {
          appNameField.required = true;
          appNameField.rules = [
            { required: true, message: 'App name is required' },
            { pattern: /^[a-z][a-z0-9-]*$/, message: 'Must start with letter, use lowercase and hyphens only' }
          ];
        }
      }
    }
  }
});
```

### Example 3: Customizing Ant Design Theme

```javascript
import plugin from 'js-plugin';

// ✅ CORRECT - nested object properties
plugin.register({
  name: 'my-theme-plugin',

  museLibAntd: {
    configProvider: {
      processProps: (configProps) => {
        // Customize theme tokens
        configProps.theme.token = {
          colorPrimary: '#1890ff',     // Primary color
          colorSuccess: '#52c41a',     // Success color
          colorWarning: '#faad14',     // Warning color
          colorError: '#f5222d',       // Error color
          borderRadius: 4,             // Border radius for components
          fontSize: 14,                // Base font size
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        };

        // Add component-level configurations
        configProps.button = {
          defaultProps: {
            size: 'middle'
          }
        };

        // Add locale if needed
        // configProps.locale = enUS;
      }
    }
  }
});
```

### Example 4: Creating Extensible UI with MetaMenu

```javascript
import React from 'react';
import { MetaMenu } from '@ebay/muse-lib-antd/src/features/common';
import plugin from 'js-plugin';

// Define base menu
function MySidebar() {
  const menuMeta = {
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        link: '/dashboard',
        icon: 'dashboard',
        order: 0
      },
      {
        key: 'users',
        label: 'Users',
        link: '/users',
        icon: 'user',
        order: 10
      },
    ],
    mode: 'inline',
    autoActive: true,
  };

  return (
    <MetaMenu
      meta={menuMeta}
      baseExtPoint="myApp.siderMenu"
      autoSort={true}
    />
  );
}

// Other plugins can extend the menu
// ✅ CORRECT - nested object properties
plugin.register({
  name: 'my-extension-plugin',

  myApp: {
    siderMenu: {
      getItems: (meta) => {
        return [
          {
            key: 'custom-feature',
            label: 'Custom Feature',
            link: '/custom',
            icon: 'star',
            order: 20,
          }
        ];
      },

      processItems: (meta, items, itemByKey) => {
        // Hide users menu if user doesn't have permission
        const usersItem = itemByKey['users'];
        if (usersItem && !userHasPermission('view_users')) {
          items.splice(items.indexOf(usersItem), 1);
        }
      }
    }
  }
});
```

### Example 5: Using Extensibility Utilities

```javascript
import React from 'react';
import { extendFormMeta, extendArray } from '@ebay/muse-lib-antd/src/utils';
import NiceForm from '@ebay/nice-form-react';

function MyForm({ record }) {
  // Create extensible form
  const baseMeta = {
    fields: [
      { key: 'name', label: 'Name', widget: 'input', required: true },
      { key: 'email', label: 'Email', widget: 'input', required: true },
    ]
  };

  const { meta, watchingFields } = extendFormMeta(
    baseMeta,
    'myPlugin.userForm',
    { record, mode: 'create' }
  );

  return <NiceForm meta={meta} />;
}

// Create extensible table columns
function MyTable({ dataSource }) {
  const columns = [
    { key: 'name', title: 'Name', dataIndex: 'name', sorter: true },
    { key: 'email', title: 'Email', dataIndex: 'email' },
  ];

  // Allow plugins to add columns
  extendArray(columns, 'columns', 'myPlugin.userTable', { dataSource });

  return <Table dataSource={dataSource} columns={columns} />;
}

// Other plugins can extend these
// ✅ CORRECT - nested object properties
plugin.register({
  name: 'my-extension',

  myPlugin: {
    userForm: {
      getFields: ({ record, mode }) => {
        if (mode === 'create') {
          return [
            {
              key: 'role',
              label: 'Role',
              widget: 'select',
              options: ['admin', 'user'],
              order: 50
            }
          ];
        }
        return [];
      }
    },

    userTable: {
      getColumns: ({ dataSource }) => {
        return [
          {
            key: 'role',
            title: 'Role',
            dataIndex: 'role',
            filters: [
              { text: 'Admin', value: 'admin' },
              { text: 'User', value: 'user' }
            ],
            onFilter: (value, record) => record.role === value,
            order: 50
          }
        ];
      }
    }
  }
});
```

### Example 6: Using Custom Components

```javascript
import React from 'react';
import {
  ErrorBox,
  CodeViewer,
  DateView,
  Highlighter,
  StatusLabel,
  DropdownMenu
} from '@ebay/muse-lib-antd/src/features/common';

function MyComponent({ data, error, searchTerm }) {
  if (error) {
    return (
      <ErrorBox
        title="Failed to Load Data"
        error={error}
        onRetry={handleRetry}
        showStack={true}
      />
    );
  }

  return (
    <div>
      {/* Display formatted code */}
      <CodeViewer
        code={JSON.stringify(data, null, 2)}
        language="json"
        theme="dark"
        allowCopy={true}
      />

      {/* Display dates */}
      <DateView value={data.createdAt} dateOnly />

      {/* Highlight search terms */}
      <Highlighter text={data.description} search={searchTerm} />

      {/* Display status */}
      <StatusLabel label={data.status} type="SUCCESS" />

      {/* Dropdown menu with actions */}
      <DropdownMenu
        items={[
          { key: 'edit', label: 'Edit', icon: 'edit', onClick: handleEdit },
          { key: 'delete', label: 'Delete', icon: 'delete', onClick: handleDelete }
        ]}
        size="small"
      />
    </div>
  );
}
```
