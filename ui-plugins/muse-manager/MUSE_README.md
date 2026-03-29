# Plugin Integration Guide: @ebay/muse-manager

**Generated**: 2026-03-28
**Plugin Type**: normal

---

## 1. Plugin Purpose & Overview

### What This Plugin Does

The `@ebay/muse-manager` plugin provides a comprehensive web-based UI for managing MUSE apps, environments, and plugins. It serves as the central administrative interface for the MUSE micro-frontends platform, enabling users to create, configure, deploy, and monitor MUSE applications and their plugins through an intuitive dashboard.

### Key Features

- **Application Management**: Create apps, manage environments, configure app settings, and control plugin deployments
- **Plugin Management**: Register plugins, release versions, deploy/undeploy plugins across environments, and track deployment status
- **Request Tracking**: Monitor deployment requests and system operations with real-time status updates
- **Access Control Integration**: Implements permission-based UI controls using CASL/ACL system
- **Environment Variables**: Manage app-level, environment-level, and plugin-level configuration variables
- **Version Tracking**: Visual diff indicators showing version drift between deployed and latest plugin releases

### Plugin Type: normal

This is a normal-type plugin providing business features within the MUSE ecosystem. It runs after library plugins and consumes shared modules (React, Ant Design) from lib plugins at runtime.

---

## 2. Extension Points Exposed

This plugin exposes 70+ extension points that OTHER plugins can implement to extend its functionality. These extension points allow customization of forms, tables, modals, actions, and UI components throughout the muse-manager interface.

### Summary

- **Total Extension Points**: 70+ individual extension points
- **Categories**:
  - Application Management Extensions (AM)
  - Plugin Management Extensions (PM)
  - Request Management Extensions (Req)
  - App Page Extensions
  - Form Extensions
  - Table Extensions
  - Modal Extensions
  - Action Extensions

### Extension Point List

#### Application Management (AM) Extensions

##### `museManager.am.createAppForm.getWatchingFields`

- **Purpose**: Specify form fields to watch for changes in the create app form
- **When Invoked**: During form initialization
- **Context Parameters**:
  - `meta`: `NiceFormMeta` - Form metadata
  - `form`: `FormInstance` - Ant Design form instance
- **Expected Return**: `string[]` - Array of field names to watch
- **Use Case Example**: Add custom field validation that depends on other field values
- **File Reference**: src/features/am/CreateAppModal.jsx:54

##### `museManager.am.createAppForm.getFields`

- **Purpose**: Add custom fields to the create app form
- **When Invoked**: During form field collection
- **Context Parameters**:
  - `meta`: `NiceFormMeta` - Form metadata
  - `form`: `FormInstance` - Ant Design form instance
- **Expected Return**: `NiceFormFieldType | NiceFormFieldType[]` - Field definitions
- **Use Case Example**: Add organization or cost center fields for app creation
- **File Reference**: src/features/am/CreateAppModal.jsx:54

##### `museManager.am.createAppForm.preProcessMeta`

- **Purpose**: Modify form metadata before rendering in create app form
- **When Invoked**: Before form renders
- **Context Parameters**:
  - `meta`: `NiceFormMeta` - Form metadata object
  - `form`: `FormInstance` - Ant Design form instance
- **Expected Return**: `void` - Mutates meta object directly
- **Use Case Example**: Dynamically adjust field properties based on user permissions
- **File Reference**: src/features/am/CreateAppModal.jsx:54

##### `museManager.am.createAppForm.processMeta`

- **Purpose**: Process form metadata during rendering in create app form
- **When Invoked**: During form rendering
- **Context Parameters**:
  - `meta`: `NiceFormMeta` - Form metadata
  - `form`: `FormInstance` - Ant Design form instance
- **Expected Return**: `void` - Mutates meta object
- **Use Case Example**: Add conditional field visibility rules
- **File Reference**: src/features/am/CreateAppModal.jsx:54

##### `museManager.am.createAppForm.postProcessMeta`

- **Purpose**: Final metadata processing after all extensions in create app form
- **When Invoked**: After all other metadata processing
- **Context Parameters**:
  - `meta`: `NiceFormMeta` - Form metadata
  - `form`: `FormInstance` - Ant Design form instance
- **Expected Return**: `void` - Mutates meta object
- **Use Case Example**: Ensure custom field ordering or final validation rules
- **File Reference**: src/features/am/CreateAppModal.jsx:54

##### `museManager.am.editAppForm.getWatchingFields`
##### `museManager.am.editAppForm.getFields`
##### `museManager.am.editAppForm.preProcessMeta`
##### `museManager.am.editAppForm.processMeta`
##### `museManager.am.editAppForm.postProcessMeta`

- **Purpose**: Extend edit app form (similar lifecycle to createAppForm)
- **When Invoked**: During edit app modal rendering
- **Context Parameters**: `meta`, `form`, `app`, `setLoading`, `setError`
- **Expected Return**: Varies by lifecycle method
- **Use Case Example**: Add custom configuration fields for app editing
- **File Reference**: src/features/am/EditAppModal.jsx:54

##### `museManager.am.appBasicInfo.getWatchingFields`
##### `museManager.am.appBasicInfo.getFields`
##### `museManager.am.appBasicInfo.preProcessMeta`
##### `museManager.am.appBasicInfo.processMeta`
##### `museManager.am.appBasicInfo.postProcessMeta`

- **Purpose**: Extend app basic information display form
- **When Invoked**: During app overview rendering
- **Context Parameters**: `meta`, `app`
- **Expected Return**: Varies by lifecycle method
- **Use Case Example**: Add custom app metadata fields to basic info section
- **File Reference**: src/features/am/AppBasicInfo.jsx:60

##### `museManager.am.environments.preProcessColumns`
##### `museManager.am.environments.getColumns`
##### `museManager.am.environments.processColumns`
##### `museManager.am.environments.postProcessColumns`

- **Purpose**: Customize environment table columns
- **When Invoked**: During environment table rendering
- **Context Parameters**: `app`, `columns`
- **Expected Return**: Column definitions or void
- **Use Case Example**: Add deployment status or health check columns
- **File Reference**: src/features/am/Environments.jsx:32

##### `museManager.am.appPage.getNodes`

- **Purpose**: Add custom UI nodes to app page layout
- **When Invoked**: During app page rendering
- **Context Parameters**: `app`, `nodes`
- **Expected Return**: `NodeType | NodeType[]` - Node definitions
- **Use Case Example**: Add custom alerts, notices, or action buttons to app page
- **File Reference**: src/features/am/AppPage.jsx:99

##### `museManager.am.appPage.getAppNameActions`

- **Purpose**: Add action buttons/nodes next to app name header
- **When Invoked**: During app page header rendering
- **Context Parameters**: `app`, `appNameActions`
- **Expected Return**: `NodeType | NodeType[]` - Action node definitions
- **Use Case Example**: Add quick action buttons like "Export Config" or "Clone App"
- **File Reference**: src/features/am/AppPage.jsx:44

##### `museManager.am.appOverview.preProcessNodes`
##### `museManager.am.appOverview.getNodes`
##### `museManager.am.appOverview.processNodes`
##### `museManager.am.appOverview.postProcessNodes`

- **Purpose**: Extend app overview tab with custom sections
- **When Invoked**: During overview tab rendering
- **Context Parameters**: `app`, `nodes`
- **Expected Return**: `NodeType | NodeType[]` for getNodes, `void` for process methods
- **Use Case Example**: Add custom app statistics, dashboards, or monitoring widgets
- **File Reference**: src/features/am/AppOverview.jsx:49

#### Plugin Management (PM) Extensions

##### `museManager.pm.pluginInfoForm.getWatchingFields`
##### `museManager.pm.pluginInfoForm.getFields`
##### `museManager.pm.pluginInfoForm.preProcessMeta`
##### `museManager.pm.pluginInfoForm.processMeta`
##### `museManager.pm.pluginInfoForm.postProcessMeta`

- **Purpose**: Extend plugin information/edit form
- **When Invoked**: During plugin info modal rendering
- **Context Parameters**: `meta`, `form`, `app`, `plugin`, `viewMode`
- **Expected Return**: Varies by lifecycle method
- **Use Case Example**: Add repository URL, CI/CD status, or quality metrics fields
- **File Reference**: src/features/pm/PluginInfoModal.jsx:110

##### `museManager.pm.pluginInfoView.preProcessNodes`
##### `museManager.pm.pluginInfoView.getNodes`
##### `museManager.pm.pluginInfoView.processNodes`
##### `museManager.pm.pluginInfoView.postProcessNodes`

- **Purpose**: Add custom sections to plugin info modal body
- **When Invoked**: During plugin info modal rendering
- **Context Parameters**: `viewMode`, `plugin`, `app`
- **Expected Return**: `NodeType | NodeType[]` for getNodes, `void` for process methods
- **Use Case Example**: Add plugin dependency graph or usage statistics
- **File Reference**: src/features/pm/PluginInfoModal.jsx:137

##### `museManager.pm.pluginInfoModal.footer.preProcessItems`
##### `museManager.pm.pluginInfoModal.footer.getItems`
##### `museManager.pm.pluginInfoModal.footer.processItems`
##### `museManager.pm.pluginInfoModal.footer.postProcessItems`

- **Purpose**: Customize footer buttons in plugin info modal
- **When Invoked**: During modal footer rendering
- **Context Parameters**: `items` (button definitions)
- **Expected Return**: Footer item definitions or void
- **Use Case Example**: Add custom actions like "Build Plugin" or "Run Tests"
- **File Reference**: src/features/pm/PluginInfoModal.jsx:180

##### `museManager.pm.pluginList.preProcessColumns`
##### `museManager.pm.pluginList.getColumns`
##### `museManager.pm.pluginList.processColumns`
##### `museManager.pm.pluginList.postProcessColumns`

- **Purpose**: Customize plugin list table columns
- **When Invoked**: During plugin list rendering
- **Context Parameters**: `app`, `columns`, `plugins`, `searchValue`, `latestReleases`
- **Expected Return**: Column definitions or void
- **Use Case Example**: Add test coverage, build time, or bundle size columns
- **File Reference**: src/features/pm/PluginList.jsx:278

##### `museManager.pm.pluginList.pluginBadges.preProcessNodes`
##### `museManager.pm.pluginList.pluginBadges.getNodes`
##### `museManager.pm.pluginList.pluginBadges.processNodes`
##### `museManager.pm.pluginList.pluginBadges.postProcessNodes`

- **Purpose**: Add badges/tags next to plugin names in the list
- **When Invoked**: During plugin name cell rendering
- **Context Parameters**: `app`, `plugin`
- **Expected Return**: `NodeType | NodeType[]` for getNodes, `void` for process methods
- **Use Case Example**: Add status badges like "Deprecated", "Beta", or build status icons
- **File Reference**: Via src/features/pm/PluginList.jsx:132 → PluginBadges component

##### `museManager.pm.pluginList.preProcessActions`
##### `museManager.pm.pluginList.getActions`
##### `museManager.pm.pluginList.processActions`
##### `museManager.pm.pluginList.postProcessActions`

- **Purpose**: Customize plugin action dropdown menu
- **When Invoked**: During plugin actions rendering
- **Context Parameters**: `app`, `plugin`, `ability`, `actions`, `appByName`
- **Expected Return**: `ActionType | ActionType[]` for getActions, `void` for process methods
- **Use Case Example**: Add "Build", "Test", or "Publish to NPM" actions
- **File Reference**: src/features/pm/PluginActions.jsx:126

##### `museManager.pm.pluginList.getEnvFilters`

- **Purpose**: Add custom environment filters to plugin list
- **When Invoked**: During filter menu rendering
- **Context Parameters**: Filter context
- **Expected Return**: `EnvFilter | EnvFilter[]` - Filter definitions
- **Use Case Example**: Add filters like "Has Errors" or "Needs Update"
- **File Reference**: src/features/pm/EnvFilterMenu.jsx:61

##### `museManager.pm.pluginList.getEnvFilterFns`

- **Purpose**: Provide filter functions for environment-based filtering
- **When Invoked**: When applying environment filters
- **Context Parameters**: `filterKey`, `app`, `envName`
- **Expected Return**: `Function[]` - Filter functions to apply
- **Use Case Example**: Custom logic to filter plugins by deployment health
- **File Reference**: src/features/pm/PluginList.jsx:101

##### `museManager.pm.pluginList.getScopeFilterFns`

- **Purpose**: Provide filter functions for scope-based filtering (all/deployed)
- **When Invoked**: When applying scope filters
- **Context Parameters**: `scope` (string)
- **Expected Return**: `Function` - Filter function
- **Use Case Example**: Filter plugins by custom scopes like "mine" or "team"
- **File Reference**: src/features/pm/PluginList.jsx:63

##### `museManager.pm.pluginList.processPluginList`

- **Purpose**: Process/transform the entire plugin list before rendering
- **When Invoked**: After initial filtering, before display
- **Context Parameters**: `pluginList` (array)
- **Expected Return**: `void` - Mutates pluginList
- **Use Case Example**: Sort plugins by custom criteria or add computed properties
- **File Reference**: src/features/pm/PluginList.jsx:71

##### `museManager.pm.releaseList.preProcessColumns`
##### `museManager.pm.releaseList.getColumns`
##### `museManager.pm.releaseList.processColumns`
##### `museManager.pm.releaseList.postProcessColumns`

- **Purpose**: Customize release list table columns
- **When Invoked**: During releases drawer rendering
- **Context Parameters**: `plugin`, `app`, `releases`
- **Expected Return**: Column definitions or void
- **Use Case Example**: Add commit SHA, branch info, or build artifacts columns
- **File Reference**: src/features/pm/ReleasesDrawer.jsx:190

##### `museManager.pm.releaseList.preProcessActions`
##### `museManager.pm.releaseList.getActions`
##### `museManager.pm.releaseList.processActions`
##### `museManager.pm.releaseList.postProcessActions`

- **Purpose**: Customize release action dropdown
- **When Invoked**: During release row actions rendering
- **Context Parameters**: `app`, `plugin`, `ability`, `items`
- **Expected Return**: Action definitions or void
- **Use Case Example**: Add "Download Assets" or "View Build Log" actions
- **File Reference**: src/features/pm/ReleasesDrawer.jsx:159

##### `museManager.pm.releaseList.preProcessNodes`
##### `museManager.pm.releaseList.getNodes`
##### `museManager.pm.releaseList.processNodes`
##### `museManager.pm.releaseList.postProcessNodes`

- **Purpose**: Add custom sections to releases drawer
- **When Invoked**: During releases drawer rendering
- **Context Parameters**: `items`, `plugin`, `app`, `releases`
- **Expected Return**: Nodes or void
- **Use Case Example**: Add release timeline visualization or statistics
- **File Reference**: src/features/pm/ReleasesDrawer.jsx:214

##### `museManager.pm.releaseList.expandRow.preProcessNodes`
##### `museManager.pm.releaseList.expandRow.getNodes`
##### `museManager.pm.releaseList.expandRow.processNodes`
##### `museManager.pm.releaseList.expandRow.postProcessNodes`

- **Purpose**: Customize expanded row content for each release
- **When Invoked**: When release row is expanded
- **Context Parameters**: `items`, `release`
- **Expected Return**: Nodes or void
- **Use Case Example**: Show commit details, file changes, or test results
- **File Reference**: src/features/pm/ReleasesDrawer.jsx:186

##### `museManager.pm.deployPluginModal.form.getWatchingFields`
##### `museManager.pm.deployPluginModal.form.getFields`
##### `museManager.pm.deployPluginModal.form.preProcessMeta`
##### `museManager.pm.deployPluginModal.form.processMeta`
##### `museManager.pm.deployPluginModal.form.postProcessMeta`

- **Purpose**: Extend deploy plugin form
- **When Invoked**: During deploy modal rendering
- **Context Parameters**: `meta`, `ability`, `app`, `form`, `plugin`, `version`, plus state setters
- **Expected Return**: Varies by method
- **Use Case Example**: Add deployment options like "run smoke tests" or "notify team"
- **File Reference**: src/features/pm/DeployPluginModal.jsx:152

##### `museManager.pm.deployPluginModal.footer.preProcessItems`
##### `museManager.pm.deployPluginModal.footer.getItems`
##### `museManager.pm.deployPluginModal.footer.processItems`
##### `museManager.pm.deployPluginModal.footer.postProcessItems`

- **Purpose**: Customize deploy modal footer buttons
- **When Invoked**: During modal footer rendering
- **Context Parameters**: `items`, plus full extArgs context
- **Expected Return**: Footer items or void
- **Use Case Example**: Add "Deploy & Validate" or "Schedule Deployment" buttons
- **File Reference**: src/features/pm/DeployPluginModal.jsx:181

##### `museManager.pm.undeployPluginModal.form.getWatchingFields`
##### `museManager.pm.undeployPluginModal.form.getFields`
##### `museManager.pm.undeployPluginModal.form.preProcessMeta`
##### `museManager.pm.undeployPluginModal.form.processMeta`
##### `museManager.pm.undeployPluginModal.form.postProcessMeta`

- **Purpose**: Extend undeploy plugin form
- **When Invoked**: During undeploy modal rendering
- **Context Parameters**: Similar to deployPluginModal
- **Expected Return**: Varies by method
- **Use Case Example**: Add cleanup options or rollback configurations
- **File Reference**: src/features/pm/UndeployPluginModal.jsx:146

##### `museManager.pm.undeployPluginModal.footer.preProcessItems`
##### `museManager.pm.undeployPluginModal.footer.getItems`
##### `museManager.pm.undeployPluginModal.footer.processItems`
##### `museManager.pm.undeployPluginModal.footer.postProcessItems`

- **Purpose**: Customize undeploy modal footer
- **When Invoked**: During footer rendering
- **Context Parameters**: `items` plus extArgs
- **Expected Return**: Footer items or void
- **File Reference**: src/features/pm/UndeployPluginModal.jsx:175

##### `museManager.pm.groupDeployModal.form.getWatchingFields`
##### `museManager.pm.groupDeployModal.form.getFields`
##### `museManager.pm.groupDeployModal.form.preProcessMeta`
##### `museManager.pm.groupDeployModal.form.processMeta`
##### `museManager.pm.groupDeployModal.form.postProcessMeta`

- **Purpose**: Extend group deployment form (deploy/undeploy multiple plugins at once)
- **When Invoked**: During group deploy modal rendering
- **Context Parameters**: `meta`, `ability`, `form`, `app`, plus state management functions
- **Expected Return**: Varies by method
- **Use Case Example**: Add deployment strategies like "sequential" vs "parallel"
- **File Reference**: src/features/pm/GroupDeployModal.jsx:184

##### `museManager.pm.groupDeployModal.footer.preProcessItems`
##### `museManager.pm.groupDeployModal.footer.getItems`
##### `museManager.pm.groupDeployModal.footer.processItems`
##### `museManager.pm.groupDeployModal.footer.postProcessItems`

- **Purpose**: Customize group deploy modal footer
- **When Invoked**: During footer rendering
- **Context Parameters**: `items` plus extArgs
- **Expected Return**: Footer items or void
- **File Reference**: src/features/pm/GroupDeployModal.jsx:231

##### `museManager.pm.pluginConfigForm.getWatchingFields`
##### `museManager.pm.pluginConfigForm.getFields`
##### `museManager.pm.pluginConfigForm.preProcessMeta`
##### `museManager.pm.pluginConfigForm.processMeta`
##### `museManager.pm.pluginConfigForm.postProcessMeta`
##### `museManager.pm.pluginConfigForm.processPayload`

- **Purpose**: Extend plugin configuration form (app-level plugin settings)
- **When Invoked**: During plugin config modal rendering
- **Context Parameters**: `meta`, `form`, `app`, `plugin`
- **Expected Return**: Varies by method
- **Use Case Example**: Add plugin-specific config fields like feature flags or API keys
- **File Reference**: src/features/pm/PluginConfigModal.jsx:66

##### `museManager.pm.createPluginModal.form.getWatchingFields`
##### `museManager.pm.createPluginModal.form.getFields`
##### `museManager.pm.createPluginModal.form.preProcessMeta`
##### `museManager.pm.createPluginModal.form.processMeta`
##### `museManager.pm.createPluginModal.form.postProcessMeta`

- **Purpose**: Extend create plugin form
- **When Invoked**: During create plugin modal rendering
- **Context Parameters**: `meta`, `form`
- **Expected Return**: Varies by method
- **Use Case Example**: Add fields for repository template, initial version, or build configuration
- **File Reference**: src/features/pm/CreatePluginModal.jsx:115

##### `museManager.pm.pluginStatus.relatedToPlugin`

- **Purpose**: Determine if a request is related to a specific plugin
- **When Invoked**: During plugin status check
- **Context Parameters**: `plugin`, `app`, `request`
- **Expected Return**: `boolean | void` - True if request relates to this plugin
- **Use Case Example**: Filter custom request types related to plugin operations
- **File Reference**: Via src/features/pm/PluginStatus.jsx

##### `museManager.pm.pluginStatus.processRequest`

- **Purpose**: Process/transform request data for plugin status display
- **When Invoked**: During plugin status rendering
- **Context Parameters**: `request`, `app`, `plugin`
- **Expected Return**: `void` - Mutates request object
- **Use Case Example**: Add custom status messages or progress indicators
- **File Reference**: src/features/pm/PluginStatus.jsx:46

#### Request Management Extensions

##### `museManager.req.requestDetailModal.processModalProps`

- **Purpose**: Customize request detail modal properties
- **When Invoked**: Before modal renders
- **Context Parameters**: Modal props object
- **Expected Return**: `void` - Mutates props
- **Use Case Example**: Adjust modal width or behavior based on request type
- **File Reference**: src/features/req/RequestDetailModal.jsx:215

##### `museManager.req.requestDetailModal.form.getWatchingFields`
##### `museManager.req.requestDetailModal.form.getFields`
##### `museManager.req.requestDetailModal.form.preProcessMeta`
##### `museManager.req.requestDetailModal.form.processMeta`
##### `museManager.req.requestDetailModal.form.postProcessMeta`
##### `museManager.req.requestDetailModal.body.preProcessItems`
##### `museManager.req.requestDetailModal.body.getItems`
##### `museManager.req.requestDetailModal.body.processItems`
##### `museManager.req.requestDetailModal.body.postProcessItems`
##### `museManager.req.requestDetailModal.footer.preProcessItems`
##### `museManager.req.requestDetailModal.footer.getItems`
##### `museManager.req.requestDetailModal.footer.processItems`
##### `museManager.req.requestDetailModal.footer.postProcessItems`

- **Purpose**: Extend request detail modal form, body, and footer
- **When Invoked**: During request modal rendering
- **Context Parameters**: Varies by section
- **Expected Return**: Varies by method
- **Use Case Example**: Add custom request fields, logs, or action buttons
- **File Reference**: Via src/features/req/RequestDetailModal.jsx

#### App Page Extensions

##### `museManager.appPage.getTabs`

- **Purpose**: Add custom tabs to app detail page
- **When Invoked**: During app page rendering
- **Context Parameters**: `tabs`, `app`
- **Expected Return**: `TabsProps['items']` - Tab item definitions
- **Use Case Example**: Add "Analytics", "Logs", or "Settings" tabs
- **File Reference**: src/features/am/AppPage.jsx:39

#### List Bar Extensions

##### `museManager.pluginListBar.getScopes`

- **Purpose**: Add scope filters to plugin list bar (e.g., "all", "deployed", custom)
- **When Invoked**: During plugin list bar rendering
- **Context Parameters**: `setScope`, `scope`
- **Expected Return**: `ScopeType | ScopeType[]` - Scope definitions
- **Use Case Example**: Add "My Plugins" or "Team Plugins" scope
- **File Reference**: src/features/pm/PluginListBar.jsx:59

##### `museManager.appListBar.getScopes`
##### `museManager.appListBar.getDropdownItems`
##### `museManager.appListBar.processDropdownItems`

- **Purpose**: Customize app list bar scopes and dropdown menu
- **When Invoked**: During app list bar rendering
- **Context Parameters**: Varies
- **Expected Return**: Scopes or dropdown items
- **Use Case Example**: Add bulk operations or export functionality
- **File Reference**: src/features/am/AppListBar.jsx

#### Environment Forms

##### `museManager.addEnvForm.getWatchingFields`
##### `museManager.addEnvForm.getFields`
##### `museManager.addEnvForm.preProcessMeta`
##### `museManager.addEnvForm.processMeta`
##### `museManager.addEnvForm.postProcessMeta`
##### `museManager.editEnvForm.getWatchingFields`
##### `museManager.editEnvForm.getFields`
##### `museManager.editEnvForm.preProcessMeta`
##### `museManager.editEnvForm.processMeta`
##### `museManager.editEnvForm.postProcessMeta`

- **Purpose**: Extend add/edit environment forms
- **When Invoked**: During environment modal rendering
- **Context Parameters**: Form metadata and context
- **Expected Return**: Varies by method
- **Use Case Example**: Add environment-specific config like CDN URLs or API endpoints
- **File Reference**: Via src/features/am/AddEnvironmentModal.jsx, EditEnvironmentModal.jsx

#### Configuration Extension

##### `museManager.setConfig`

- **Purpose**: Set/override muse-manager configuration
- **When Invoked**: During plugin initialization
- **Context Parameters**: Config setter function
- **Expected Return**: `void`
- **Use Case Example**: Customize default page sizes, API endpoints, or UI behavior
- **File Reference**: src/config.js:13

### Usage Example

**CRITICAL**: Extension points are **nested object properties**, NOT string paths!

```javascript
// ✅ CORRECT - nested object properties
plugin.register({
  name: 'my-custom-plugin',
  museManager: {
    pm: {
      pluginList: {
        getColumns: (context) => {
          // Add custom column
          return {
            dataIndex: 'myCustomField',
            title: 'Custom Data',
            order: 85,
            render: (val, plugin) => plugin.myCustomField
          };
        }
      }
    }
  }
});

// ❌ INCORRECT - DO NOT use string paths
plugin.register({
  name: 'my-custom-plugin',
  'museManager.pm.pluginList.getColumns': (context) => {  // WRONG!
    // This will NOT work!
  }
});
```

---

## 3. Extension Points Contributed

This plugin implements the following extension points from OTHER plugins to integrate with the MUSE ecosystem.

### Summary

- **Total Contributions**: 6
- **Host Plugins**: @ebay/muse-lib-react, @ebay/muse-layout-antd

### By Host Plugin

#### Contributes to: @ebay/muse-lib-react

##### `route`

- **Invoked By**: @ebay/muse-lib-react routing system
- **What This Plugin Provides**: Three routes:
  - `/plugins` - Plugin list page
  - `/apps` - Application list page
  - `/app/:appName/:tabKey?/:scope?` - App detail page with optional tab and scope
- **Why Needed**: Integrates muse-manager pages into the MUSE application router
- **File Reference**: src/route.js:4-18

##### `rootComponent`

- **Invoked By**: @ebay/muse-lib-react plugin initialization system
- **What This Plugin Provides**: `InitAbilityComp` component that initializes the CASL ability object for access control
- **Why Needed**: Sets up permission system before any muse-manager components render
- **File Reference**: src/index.js:17-20, src/index.js:29

#### Contributes to: @ebay/muse-layout-antd

##### `museLayout.header.getConfig`

- **Invoked By**: @ebay/muse-layout-antd header component
- **What This Plugin Provides**: Header configuration:
  - Black background (#000000)
  - Title: "Muse Managers"
  - Subtitle: "Muse app and plugin manager"
  - Theme switcher enabled
- **Why Needed**: Configures the application header appearance
- **File Reference**: src/ext/museLayout.js:4-11

##### `museLayout.header.getItems`

- **Invoked By**: @ebay/muse-layout-antd header items collection
- **What This Plugin Provides**: Header menu items:
  - "+ Create" dropdown menu with "Create App" and "Create Plugin" options
- **Why Needed**: Provides quick access to app/plugin creation from header
- **File Reference**: src/ext/museLayout.js:13-43

##### `museLayout.sider.getConfig`

- **Invoked By**: @ebay/muse-layout-antd sidebar component
- **What This Plugin Provides**: Sidebar configuration:
  - Mode: `collapsable` (or `none` if running as sub-app)
  - Default collapsed: true
  - Home menu: enabled
  - Width: 200px
- **Why Needed**: Configures sidebar behavior and appearance
- **File Reference**: src/ext/museLayout.js:47-53

##### `museLayout.sider.getItems`

- **Invoked By**: @ebay/muse-layout-antd sidebar menu
- **What This Plugin Provides**: Sidebar menu items:
  - "Apps" menu item (link to /apps)
  - "Plugins" menu item (link to /plugins)
- **Why Needed**: Provides main navigation menu for muse-manager
- **File Reference**: src/ext/museLayout.js:55-70

---

## 4. Exported Functionality

This plugin exports the following functionality for use by other plugins.

**Access via**: `plugin.getPlugin('@ebay/muse-manager').exports`

### Hooks

- **`useAbility`**: Returns the CASL ability object for permission checks. Use this to check if the current user can perform actions like create/edit/delete apps or plugins. Returns: `Ability` object with `can()` and `cannot()` methods.

- **`useSyncStatus`**: Hook to manually trigger data refresh for a specific data key. Takes a data key (e.g., 'muse.apps', 'muse.plugins') and returns a function to trigger sync. Useful after mutations to refresh cached data.

- **`useSearchState`**: Manages search state synchronized with URL query parameters. Returns search state and setter function. Use when building searchable UI components.

- **`useEnvFilter`**: Hook for environment filtering logic in plugin lists. Returns `{ getEnvFilterConfig, envFilterMap }` with filter configuration and current filter state. Use for building custom environment filter UI.

- **`useValidateDeployment`**: Hook that validates plugin deployments (checks shared module compatibility). Returns `{ validateDeployment, validateDeploymentError, validateDeploymentPending }`. Use before deploying plugins to ensure module compatibility.

- **`usePendingError`**: Combines multiple loading and error states into single pending/error state. Takes arrays of pending states and errors, returns unified `{ pending, error, setPending, setError }`. Useful for forms with multiple async operations.

- **`useExtPoint`**: Hook to consume extension points in React components. Takes extension point name and args, returns array of contributed components. Use when building extensible UI components.

- **`useMuseData`**: (from museHooks) React Query hook for fetching MUSE data. Takes data key (e.g., 'muse.apps'), returns `{ data, isLoading, error }`. Auto-polling support.

- **`usePollingMuseData`**: (from museHooks) Similar to useMuseData but with auto-polling enabled. Use for data that needs real-time updates like deployment status.

- **`useMuseMutation`**: (from museHooks) React Query mutation hook for MUSE API operations. Takes mutation key (e.g., 'am.createApp'), returns `{ mutateAsync, error, isLoading }`. Use for write operations.

### Components (from common features)

Components are exported via the `common` export object.

### PM (Plugin Management) Exports

- **`VersionSelect`**: Version selector component for plugin releases. Use in forms that need version selection.

- **`PluginReleaseSelect`**: Plugin release selector with version dropdown. Props: `{ plugin, app }`. Use in deployment forms.

- **`EnvFilterMenu`**: Environment filter menu component with version diff indicators. Use for building custom plugin list filters.

- **`LightOnIcon`**: Icon component for UI decoration. Use in info messages or alerts.

- **`MultiPluginSelector`**: Component for selecting multiple plugins with version. Props: `{ app }`. Use in group deployment forms.

- **`GroupDeployModal`**: Modal component for deploying/undeploying multiple plugins. Props: `{ app }`. Use via NiceModal.show().

- **`PluginStatus`**: Component showing real-time plugin deployment status. Props: `{ plugin, app }`. Use to display ongoing deployment operations.

- **`PluginBadges`**: Component rendering plugin badges/tags. Props: `{ app, plugin }`. Use to display plugin status indicators.

### Utils

- **`getPluginId`**: Converts scoped package names to ID format (e.g., `@ebay/foo` → `ebay.foo`). Use when working with plugin identifiers.

- **`versionDiff`**: Calculates semantic version difference between two versions. Returns: `'major' | 'minor' | 'patch' | 'null'`. Use for version comparison logic.

### Other Exports

- **`ability`**: The global CASL ability object for permission checking. Direct access to the ability singleton. Prefer using `useAbility()` hook in React components.

- **`museClient`**: Configured axios client for MUSE API v2. Pre-configured with authentication, timeout, and base URL. Use for custom API calls not covered by museHooks.

### Using Exported Functionality

```javascript
// Accessing exports from muse-manager
const museManager = plugin.getPlugin('@ebay/muse-manager');
if (!museManager) {
  console.warn('@ebay/muse-manager plugin not found');
  return;
}

const { hooks, pm, utils, ability, museClient } = museManager.exports;

// Using a hook in React component
const { useAbility } = hooks;
function MyComponent({ app }) {
  const ability = useAbility();
  const canEdit = ability.can('update', 'App', app);
  return canEdit ? <EditButton /> : null;
}

// Using a component
const { PluginStatus } = pm;
<PluginStatus plugin={myPlugin} app={myApp} />

// Using a utility
const { versionDiff } = utils;
const diff = versionDiff('2.0.0', '1.5.3'); // Returns 'major'

// Using museClient for custom API calls
const { data } = await museClient.get('/api/v2/custom-endpoint');
```

**Note**: Exports create tight coupling between plugins. Prefer using extension points for loose coupling when possible. Use exports when you need to reuse complex components, hooks, or utilities across plugins.

---

## 5. Integration Examples

### Example 1: Adding a Custom Column to Plugin List (CORRECT Syntax)

```javascript
plugin.register({
  name: 'my-monitoring-plugin',
  museManager: {
    pm: {
      pluginList: {
        getColumns: ({ app, plugins }) => {
          return {
            dataIndex: 'healthScore',
            title: 'Health',
            order: 55,
            width: 100,
            render: (_, plugin) => {
              const score = calculateHealthScore(plugin);
              return <Tag color={score > 80 ? 'green' : 'orange'}>{score}</Tag>;
            }
          };
        }
      }
    }
  }
});
```

### Example 2: Adding Custom App Page Tab

```javascript
plugin.register({
  name: 'my-analytics-plugin',
  museManager: {
    appPage: {
      getTabs: ({ app }) => {
        return {
          key: 'analytics',
          label: 'Analytics',
          order: 50,
          children: <MyAnalyticsDashboard app={app} />
        };
      }
    }
  }
});
```

### Example 3: Extending Create Plugin Form

```javascript
plugin.register({
  name: 'my-ci-cd-plugin',
  museManager: {
    pm: {
      createPluginModal: {
        form: {
          getFields: () => {
            return {
              key: 'cicdPipeline',
              label: 'CI/CD Pipeline',
              order: 25,
              widget: 'select',
              options: ['GitHub Actions', 'Jenkins', 'GitLab CI'],
              tooltip: 'Select the CI/CD system for this plugin'
            };
          }
        }
      }
    }
  }
});
```

### Example 4: Using Exported Hooks

```javascript
// In your plugin's component
import plugin from 'js-plugin';

function MyCustomComponent({ app, plugin }) {
  const museManager = plugin.getPlugin('@ebay/muse-manager');
  const { useAbility, useMuseData } = museManager.exports.hooks;

  const ability = useAbility();
  const { data: releases } = useMuseData(`muse.plugin-releases.${plugin.name}`);

  const canDeploy = ability.can('deploy', 'App', app);

  return (
    <div>
      <h3>Latest: {releases?.[0]?.version}</h3>
      {canDeploy && <DeployButton />}
    </div>
  );
}
```
