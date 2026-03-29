# Plugin Integration Guide: @ebay/muse-layout-antd

**Generated**: 2026-03-28
**Plugin Type**: normal

---

## 1. Plugin Purpose & Overview

### Purpose
Provides a complete application layout system for MUSE apps with customizable header, sidebar navigation, and main content areas using Ant Design components.

### Key Features
- **Responsive Layout Management**: Provides a main layout component (`MainLayout`) with configurable header and sidebar
- **Extensible Header**: Supports customizable header with logo, title, navigation items, and user menu
- **Flexible Sidebar**: Offers multiple sidebar modes (drawer, collapsable, collapsed, fixed, none) with menu navigation
- **Layout Providers**: Supports wrapping the entire layout with custom React context providers
- **Theme Support**: Integrates with dark/light theme switching via `muse-lib-antd`
- **Sub-App Support**: Handles visibility of header/sidebar when running as a sub-application
- **Redux Integration**: Manages sidebar collapse state and layout updates through Redux

### Use Cases
- Building consistent application layouts across MUSE apps
- Providing navigation structure with header and sidebar menus
- Supporting both standalone apps and micro-frontend sub-apps
- Enabling plugins to contribute navigation items and layout providers

---

## 2. Extension Points Exposed

This plugin exposes extension points that allow other plugins to customize and extend the application layout.

### 2.1 `museLayout.header.getConfig`

**Type**: Direct (returns configuration object)

**Purpose**: Allows plugins to configure the header appearance and behavior.

**Signature**:
```typescript
() => HeaderConfig

interface HeaderConfig {
  backgroundColor?: string;
  icon?: ReactNode;
  title?: string;
  noUserMenu?: boolean;
  themeSwitcher?: boolean;
  subTitle?: string;
  mode?: 'none' | 'show-in-sub-app' | undefined;
  [key: string]: any;
}
```

**Usage**:
```javascript
plugin.register({
  name: 'my-plugin',
  museLayout: {
    header: {
      getConfig: () => ({
        backgroundColor: '#1890ff',
        icon: '/path/to/icon.png',
        title: 'My App',
        subTitle: 'Application subtitle',
        themeSwitcher: true,
        noUserMenu: false
      })
    }
  }
});
```

**File Reference**: `src/ext-points.d.ts:3-11`, `src/features/home/Header.jsx:210-216`

---

### 2.2 `museLayout.header.getItems`

**Type**: Direct (returns header item(s))

**Purpose**: Allows plugins to add navigation items, buttons, or menus to the application header.

**Signature**:
```typescript
() => HeaderItem | HeaderItem[]

interface HeaderItem {
  position?: 'left' | 'center' | 'right';
  order?: number;
  key: string;
  label?: string;
  link?: string;
  linkTarget?: string;
  onClick?: Function;
  icon?: ReactNode;
  type?: 'menu' | string;
  className?: string;
  menuMeta?: Record<string, any>;
  render?: () => ReactNode;
}
```

**Usage**:
```javascript
plugin.register({
  name: 'my-plugin',
  museLayout: {
    header: {
      getItems: () => [
        {
          key: 'settings',
          icon: 'SettingOutlined',
          position: 'right',
          order: 50,
          link: '/settings'
        },
        {
          key: 'help-menu',
          type: 'menu',
          position: 'right',
          order: 100,
          menuMeta: {
            trigger: { label: 'Help' },
            items: [
              { key: 'docs', label: 'Documentation' },
              { key: 'support', label: 'Support' }
            ]
          }
        }
      ]
    }
  }
});
```

**File Reference**: `src/ext-points.d.ts:13-31`, `src/features/home/Header.jsx:235`

---

### 2.3 `museLayout.header.processItems`

**Type**: Lifecycle (processes header items before rendering)

**Purpose**: Allows plugins to modify, filter, or transform the complete list of header items after they have been collected from all plugins.

**Signature**:
```typescript
(items: HeaderItem[]) => void
```

**Usage**:
```javascript
plugin.register({
  name: 'my-plugin',
  museLayout: {
    header: {
      processItems: (items) => {
        // Example: Remove specific items
        const index = items.findIndex(item => item.key === 'unwanted-item');
        if (index !== -1) items.splice(index, 1);

        // Example: Modify items
        items.forEach(item => {
          if (item.key === 'special') {
            item.className = 'highlighted';
          }
        });
      }
    }
  }
});
```

**File Reference**: `src/ext-points.d.ts:27-30`, `src/features/home/Header.jsx:267`

---

### 2.4 `museLayout.sider.getConfig`

**Type**: Direct (returns configuration object)

**Purpose**: Allows plugins to configure the sidebar appearance and behavior.

**Signature**:
```typescript
() => SiderConfig

interface SiderConfig {
  mode?: 'fixed' | 'drawer' | 'collapsable' | 'collapsed' | 'none';
  siderDefaultCollapsed?: boolean;
  homeMenu?: boolean;
  theme?: 'dark' | 'light' | 'custom';
  width?: number;
  menuProps?: Record<string, any>;
  [key: string]: any;
}
```

**Usage**:
```javascript
plugin.register({
  name: 'my-plugin',
  museLayout: {
    sider: {
      getConfig: () => ({
        mode: 'collapsable',
        siderDefaultCollapsed: false,
        homeMenu: true,
        theme: 'dark',
        width: 280
      })
    }
  }
});
```

**File Reference**: `src/ext-points.d.ts:33-41`, `src/features/home/Sider.jsx:10-14`

---

### 2.5 `museLayout.sider.getItems`

**Type**: Direct (returns sidebar menu item(s))

**Purpose**: Allows plugins to add navigation menu items to the application sidebar.

**Signature**:
```typescript
() => SiderItem | SiderItem[]

interface SiderItem {
  key: string;
  icon?: ReactNode;
  link?: string;
  label: ReactNode;
  order?: number;
  children?: SiderItem[];
  parent?: string;
  type?: 'group' | string;
}
```

**Usage**:
```javascript
plugin.register({
  name: 'my-plugin',
  museLayout: {
    sider: {
      getItems: () => [
        {
          key: 'dashboard',
          icon: 'DashboardOutlined',
          label: 'Dashboard',
          order: 10,
          children: [
            { key: 'overview', label: 'Overview', link: '/dashboard' },
            { key: 'analytics', label: 'Analytics', link: '/dashboard/analytics' }
          ]
        },
        {
          key: 'settings',
          icon: 'SettingOutlined',
          label: 'Settings',
          link: '/settings',
          order: 100
        }
      ]
    }
  }
});
```

**File Reference**: `src/ext-points.d.ts:43-54`, `src/features/home/Sider.jsx:87`

---

### 2.6 `museLayout.sider` (nested menu items via MetaMenu)

**Type**: Nested extension point pattern (via `baseExtPoint="museLayout.sider"`)

**Purpose**: The sidebar uses `MetaMenu` component which automatically creates nested extension points for each menu item, allowing plugins to add sub-items to existing menus.

**Pattern**: For a menu item with `key: 'myMenu'`, other plugins can contribute to `museLayout.sider.myMenu.getItems`

**File Reference**: `src/features/home/Sider.jsx:87`

---

### 2.7 `museLayout.header.{itemKey}` (nested menu items via MetaMenu)

**Type**: Nested extension point pattern (via `baseExtPoint`)

**Purpose**: Header items of type 'menu' automatically create nested extension points allowing plugins to add items to those menus.

**Pattern**: For a header menu item with `key: 'helpMenu'`, other plugins can contribute to `museLayout.header.helpMenu.getItems`

**File Reference**: `src/features/home/HeaderItem.jsx:47`

---

### 2.8 `museLayout.providers`

**Type**: Array extension (via `extendArray`)

**Purpose**: Allows plugins to wrap the entire layout with React context providers (e.g., for modals, notifications, or global state).

**Signature**:
```typescript
{
  order?: number;
  key: string;
  provider?: React.ComponentType<{children: React.ReactNode}>;
  props?: Record<string, any>;
  renderProvider?: (children: React.ReactNode) => React.ReactNode;
}
```

**Usage**:
```javascript
import { NiceModal } from '@ebay/nice-modal-react';

plugin.register({
  name: 'my-plugin',
  museLayout: {
    providers: {
      getItems: () => ({
        order: 40,
        key: 'nice-modal',
        provider: NiceModal.Provider,
        props: { /* provider props */ }
      })
    }
  }
});

// Alternative using renderProvider
plugin.register({
  name: 'my-plugin',
  museLayout: {
    providers: {
      getItems: () => ({
        order: 50,
        key: 'custom-provider',
        renderProvider: (children) => (
          <MyCustomProvider>
            {children}
          </MyCustomProvider>
        )
      })
    }
  }
});
```

**File Reference**: `src/features/home/MainLayout.jsx:178`, `src/features/home/MainLayout.jsx:167-201`

---

## 3. Extension Points Contributed

This plugin implements extension points from other MUSE plugins to integrate with the ecosystem.

### 3.1 Contributions to `home` extension point

#### 3.1.1 `home.mainLayout`

**Source Plugin**: Core routing system (expected by MUSE framework)

**Purpose**: Provides the main layout component that wraps all application routes.

**Implementation**: Exports the `MainLayout` React component that renders header, sidebar, and page content.

**File Reference**: `src/ext/home.js:4`

**Why**: This allows the MUSE framework to use this plugin's layout as the application shell that wraps all page content.

---

### 3.2 Contributions via `route` property

#### 3.2.1 `route`

**Source Plugin**: MUSE routing system (standard plugin property)

**Purpose**: Registers route configuration for the plugin's own pages.

**Implementation**: Provides a route configuration object for the `/plugin-muse-layout/home` path.

**File Reference**: `src/index.js:11`, `src/common/routeConfig.js`

**Why**: Standard MUSE plugin pattern to register routes, though this plugin's routes are primarily for internal structure rather than user-facing pages.

---

### 3.3 Contributions via `reducer` property

#### 3.3.1 `reducer`

**Source Plugin**: MUSE Redux integration (standard plugin property)

**Purpose**: Registers Redux reducer to manage layout state (sidebar collapse, layout updates).

**Implementation**: Provides a Redux reducer that handles:
- `MUSE_LAYOUT$HOME_SET_SIDER_COLLAPSED` - Toggle sidebar collapse state
- `MUSE_LAYOUT$HOME_SET_LAYOUT_CONFIG` - Update layout configuration
- `MUSE_LAYOUT$HOME_UPDATE_MUSE_LAYOUT` - Force layout re-render

**File Reference**: `src/index.js:12`, `src/common/rootReducer.js`

**Why**: Manages global layout state that needs to be accessible across the application and persist during navigation.

---

### 3.4 Demo Extension Points (from ext/museLayout.js)

**Note**: The file `src/ext/museLayout.js` contains example/demo implementations of this plugin's own extension points. These are for demonstration purposes in the MUSE demo app.

#### 3.4.1 `museLayout.header.getConfig` (demo)
**Purpose**: Demo configuration showing header with Muse branding
**File Reference**: `src/ext/museLayout.js:4-12`

#### 3.4.2 `museLayout.header.userAvatar.getItems` (demo)
**Purpose**: Demo showing how to add items to user avatar menu
**File Reference**: `src/ext/museLayout.js:13-21`

#### 3.4.3 `museLayout.header.getItems` (demo)
**Purpose**: Demo showing various header items (menus, icons, center items)
**File Reference**: `src/ext/museLayout.js:22-73`

#### 3.4.4 `museLayout.sider.getConfig` (demo)
**Purpose**: Demo configuration showing drawer mode sidebar
**File Reference**: `src/ext/museLayout.js:75-81`

#### 3.4.5 `museLayout.sider.getItems` (demo)
**Purpose**: Demo showing comprehensive sidebar menu structure with nested items, groups, and various component examples
**File Reference**: `src/ext/museLayout.js:82-349`

**Why**: These demo implementations serve as living examples for developers learning how to extend the layout plugin. They are currently commented out in `src/ext/index.js:1` (not active by default).

---

## 4. Exported Functionality

This plugin exports functionality for other plugins to use programmatically.

### 4.1 `updateMuseLayout`

**Type**: Function export

**Purpose**: Forces the layout to re-render by dispatching a Redux action. Useful when plugins dynamically change layout configuration and need to trigger an immediate update.

**Signature**:
```typescript
() => void
```

**Usage**:
```javascript
const layoutPlugin = plugin.getPlugin('@ebay/muse-layout-antd');
layoutPlugin.exports.updateMuseLayout();
```

**File Reference**: `src/index.js:13`, `src/features/home/updateMuseLayout.js`

**Why**: When plugins dynamically modify layout configuration (e.g., changing header items based on runtime conditions), they need a way to notify the layout to re-collect contributions and re-render. This function triggers that update.

**Common Use Cases**:
- After dynamically adding/removing navigation items
- After changing user permissions that affect visible menus
- After configuration changes that affect layout appearance

---

## 5. Integration Examples

**CRITICAL**: Extension points are **nested object properties**, NOT string paths!

### Example 1: Adding Navigation to Header and Sidebar (CORRECT Syntax)

```javascript
// ✅ CORRECT - nested object properties
plugin.register({
  name: '@my/plugin',
  museLayout: {
    header: {
      getItems: () => ({
        key: 'my-tool',
        icon: 'ToolOutlined',
        label: 'My Tool',
        position: 'right',
        link: '/my-tool'
      })
    },
    sider: {
      getItems: () => ({
        key: 'my-section',
        icon: 'AppstoreOutlined',
        label: 'My Section',
        order: 50,
        children: [
          { key: 'page1', label: 'Page 1', link: '/my/page1' },
          { key: 'page2', label: 'Page 2', link: '/my/page2' }
        ]
      })
    }
  }
});

// ❌ INCORRECT - DO NOT use string paths
plugin.register({
  name: '@my/plugin',
  'museLayout.header.getItems': () => ({ /* ... */ }),  // WRONG!
  'museLayout.sider.getItems': () => ({ /* ... */ })    // WRONG!
});
```

### Example 2: Customizing Layout Configuration

```javascript
plugin.register({
  name: '@my/plugin',
  museLayout: {
    header: {
      getConfig: () => ({
        backgroundColor: '#722ed1',
        title: 'My Custom App',
        subTitle: 'Powered by MUSE',
        icon: '/assets/logo.png',
        noUserMenu: false,
        themeSwitcher: true
      })
    },
    sider: {
      getConfig: () => ({
        mode: 'collapsable',
        siderDefaultCollapsed: true,
        theme: 'dark',
        width: 280,
        homeMenu: true
      })
    }
  }
});
```

### Example 3: Adding Layout Providers

```javascript
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

plugin.register({
  name: '@my/plugin',
  museLayout: {
    providers: {
      getItems: () => ({
        order: 30,
        key: 'react-query',
        provider: QueryClientProvider,
        props: { client: queryClient }
      })
    }
  }
});
```

### Example 4: Processing Header Items

```javascript
plugin.register({
  name: '@my/plugin',
  museLayout: {
    header: {
      processItems: (items) => {
        // Add a badge to specific items
        items.forEach(item => {
          if (item.key === 'notifications') {
            item.badge = { count: 5 };
          }
        });

        // Remove items based on permissions
        const userPermissions = window.MUSE_GLOBAL.getUser().permissions;
        if (!userPermissions.includes('admin')) {
          const adminIndex = items.findIndex(item => item.key === 'admin-panel');
          if (adminIndex !== -1) items.splice(adminIndex, 1);
        }
      }
    }
  }
});
```

### Example 5: Using Exported Functions

```javascript
// Get the layout plugin
const layoutPlugin = plugin.getPlugin('@ebay/muse-layout-antd');

// Trigger layout update after dynamic changes
function updateMyMenuItems() {
  // Your logic to modify menu items...

  // Force layout to re-render with new items
  layoutPlugin.exports.updateMuseLayout();
}
```

### Example 6: Adding Items to Existing Header Menus

```javascript
// Assuming another plugin created a 'help' menu in the header
plugin.register({
  name: '@my/plugin',
  museLayout: {
    header: {
      help: {  // This matches the 'key' of the parent menu item
        getItems: () => [
          {
            key: 'my-docs',
            label: 'My Plugin Docs',
            link: '/docs/my-plugin'
          },
          {
            key: 'my-tutorial',
            label: 'Tutorial',
            onClick: () => window.open('/tutorial')
          }
        ]
      }
    }
  }
});
```
