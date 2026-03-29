# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `@ebay/muse-manager`, a Vite-based React UI plugin for the MUSE micro-frontends platform. It provides a web-based management interface for MUSE apps, environments, and plugins. This plugin is part of the larger `muse-next` monorepo (located at `/Users/pwang7/muse/muse-next/`) - refer to the root CLAUDE.md for overall architecture.

**Important**: This directory (`ui-plugins/muse-manager`) is a MUSE plugin, not a standalone app. It runs within the MUSE ecosystem and follows MUSE plugin conventions.

## Common Commands

```bash
# Development
pnpm start                    # Start Vite dev server (localhost:5173 by default)

# Building
pnpm build                    # Production build to build/dist/
pnpm build:dev                # Development build to build/dev/
pnpm build:test               # E2E test build

# Deploy to MUSE
pnpm deploy                   # Build both dist + dev, release, and deploy to musemanager/staging

# Testing
pnpm test                     # Run tests (uses react-scripts test)
```

## Project Structure

```
src/
├── index.js              # Plugin entry point - registers with js-plugin
├── route.js              # React Router routes
├── modals.jsx            # Central modal registration via nice-modal-react
├── ext/                  # Extension point implementations
│   └── museLayout.js     # Header/sider configuration
├── features/             # Feature modules
│   ├── am/               # App Management (apps, environments, variables)
│   ├── pm/               # Plugin Management (plugins, releases, deployments)
│   ├── req/              # Request tracking
│   ├── common/           # Shared components
│   └── sub-app/          # Sub-application support
├── hooks/                # Custom React hooks
└── ext-points.d.ts       # TypeScript definitions for extension points

build/                    # Build output (generated)
├── dist/                 # Production build
└── dev/                  # Development build
```

## Architecture

### Plugin Registration System

This plugin uses `js-plugin` for extensibility. The main entry point (`src/index.js:24-30`) registers the plugin with:

```js
plugin.register({
  ...ext,                    // Extension point implementations
  name: '@ebay/muse-manager',
  route,                     // React Router routes
  exports: { hooks, utils, pm, common, ability, museClient },
  rootComponent: InitAbilityComp,
});
```

### Extension Points

The plugin exposes numerous extension points defined in `src/ext-points.d.ts:321-330`. Other plugins can extend muse-manager's functionality via these extension points:

- `museManager.am.*` - App management extension points
- `museManager.pm.*` - Plugin management extension points
- `museManager.req.*` - Request tracking extension points
- `museManager.appPage.*` - App page customization
- `museManager.pluginListBar.*` - Plugin list UI customization

**Pattern**: Extension points use a lifecycle pattern:
1. `preProcessX` - Before processing
2. `getX` - Gather contributions from all plugins
3. `processX` - Transform items
4. `postProcessX` - Final modifications

Example from `src/ext-points.d.ts:111-116`:
```ts
interface NodesExtPoints<Context> {
  preProcessNodes?: (args: Context) => void;
  getNodes?: (args: Context) => NodeType | NodeType[];
  processNodes?: (args: Context) => void;
  postProcessNodes?: (args: Context) => void;
}
```

### Modal Management

All modals are registered centrally in `src/modals.jsx` using `@ebay/nice-modal-react`. To show a modal from anywhere in the app:

```js
import NiceModal from '@ebay/nice-modal-react';
NiceModal.show('muse-manager.create-app-modal');
```

Modal IDs follow the pattern `muse-manager.<feature>-modal`.

### API Client

The `museClient` (`src/museClient.js:5-14`) is configured to communicate with the MUSE backend API. It:

- Reads endpoint from plugin variables or app variables (defaults to `/api/v2`)
- Includes authentication token from `window.MUSE_GLOBAL.getUser().museSession`
- Has 120 second timeout
- Is based on `@ebay/muse-client`

### Feature Modules

**App Management (`src/features/am/`)**:
- `AppList.jsx` - List all apps
- `AppPage.jsx` - Main app detail page with tabs
- `AppOverview.jsx` - App overview tab
- `Environments.jsx` - Environment management table
- Variable management modals for apps, environments, and plugins
- App icon creator with canvas-based icon generation

**Plugin Management (`src/features/pm/`)**:
- `PluginList.jsx` - List all plugins with filtering
- `PluginActions.jsx` - Action buttons for plugins
- `ReleasesDrawer.jsx` - Shows plugin release history
- Deploy/undeploy modals for individual and group deployments
- `PluginStatus.jsx` - Real-time deployment status tracking
- Version/release selection components

**Shared Components (`src/features/common/`)**:
Components shared across features.

### Routing

Routes defined in `src/route.js:4-18`:

- `/plugins` → Plugin list page
- `/apps` → App list page
- `/app/:appName/:tabKey?/:scope?` → App detail page with optional tab and scope

### Custom Hooks

Key hooks in `src/hooks/`:

- `useExtPoint` - Consume extension points with React hooks support
- `useAbility` - Access control / permissions
- `useSyncStatus` - Track sync status across operations
- `useEnvFilter` - Environment filtering logic
- `useValidateDeployment` - Validation before deployment
- `usePendingError` - Error state management
- `useSearchState` - Search state management with URL sync
- `museHooks` - MUSE-specific hooks (from `@ebay/muse-client`)

### Layout Configuration

Header and sidebar are configured in `src/ext/museLayout.js:2-74`:

- **Header**: Black background, includes "+ Create" menu (app/plugin), theme switcher
- **Sider**: Collapsable mode, shows "Apps" and "Plugins" menu items
- Mode switches to `none` when running as sub-app (`window.MUSE_GLOBAL.isSubApp`)

## Build Configuration

Uses Vite with `@ebay/muse-vite-plugin` for MUSE integration (`vite.config.js:5-16`):

- **Server**: Runs on `local.cloud.ebay.com` (eBay internal domain)
- **Plugins**:
  - `@vitejs/plugin-react-swc` - Fast React refresh
  - `@ebay/muse-vite-plugin` - MUSE shared module integration
- **Environment variables**: `REACT_APP_MUSE_API_ENDPOINT` injected via `loadEnv`

### Build Output

Following MUSE plugin conventions:

- `build/dist/` - Production optimized build
- `build/dev/` - Development build with faster rebuild times
- Both outputs required for MUSE deployment

### Package Configuration

Key `package.json` fields:

- `"type": "module"` - ES modules
- `"muse.devConfig"` - Local dev configuration (app: "musemanager", env: "staging")
- `"files": ["build"]` - Only build output is published

## Development Workflow

### Local Development

1. **Standalone mode** (Vite dev server):
   ```bash
   pnpm start
   ```
   Opens on `http://local.cloud.ebay.com:5173`

2. **Within MUSE ecosystem** (preferred for full integration):
   ```bash
   # From muse-next root
   muse serve musemanager@staging
   ```

### Adding New Features

1. **Add new modal**:
   - Create modal component in `src/features/<am|pm|req>/`
   - Register in `src/modals.jsx`
   - Use `NiceModal.show('muse-manager.your-modal')` to display

2. **Add new extension point**:
   - Define TypeScript interface in `src/ext-points.d.ts`
   - Implement extension point logic in relevant feature component
   - Use `jsPlugin.invoke('museManager.your.extPoint', context)` to invoke

3. **Add new route**:
   - Create component in `src/features/`
   - Add route to `src/route.js`
   - Update sidebar in `src/ext/museLayout.js` if needed

### Deployment

```bash
pnpm deploy
```

This command:
1. Builds production bundle (`pnpm build`)
2. Builds dev bundle (`pnpm build:dev`)
3. Releases to MUSE registry (`muse release`)
4. Deploys to musemanager/staging (`muse deploy musemanager staging`)

## Important Notes

### MUSE Plugin Context

This plugin runs in the MUSE runtime with access to:

- `window.MUSE_GLOBAL` - Global MUSE context (user, variables, app config)
- Shared dependencies from lib plugins (`@ebay/muse-lib-react`, `@ebay/muse-lib-antd`)
- MUSE layout system (header, sider configured via `museLayout` ext point)

### Dependencies

All dependencies in `package.json` are `devDependencies` because:
- React, Ant Design, and other shared libs come from MUSE lib plugins at runtime
- Build tools are only needed during development
- MUSE's shared module system handles runtime dependencies

### Extension Point Pattern

When adding extension points, follow the established pattern in `src/ext-points.d.ts`:

1. Define context type with all data needed by extensions
2. Use lifecycle hooks: `preProcess` → `get` → `process` → `postProcess`
3. Export TypeScript interfaces for type safety
4. Invoke with `jsPlugin.invoke('museManager.feature.extPoint', context)`

### API Integration

When adding API calls:
- Use `museClient` from `src/museClient.js`
- Follow REST conventions: `/api/v2/apps`, `/api/v2/plugins`, etc.
- Handle loading/error states consistently
- Use React Query (`@tanstack/react-query`) for data fetching when appropriate

### State Management

- No Redux - uses React hooks and context
- `useAbility` for permissions/access control
- Modal state managed by `nice-modal-react`
- Form state managed by Ant Design Form (`FormInstance`)

### Styling

- Uses Tailwind CSS (`tailwind.config.js` - not shown but referenced in package.json)
- Ant Design components for UI primitives
- Custom styles in `src/style.less`
- Font files in `src/fonts/`
