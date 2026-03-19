# @ebay/muse-vite-plugin

Vite plugin for building MUSE plugins with support for shared module system.

## Features

- **Shared Module Resolution**: Automatically resolves shared modules from lib plugins
- **Lib Plugin Support**: Build lib plugins that export shared modules (NEW!)
- **Manifest Generation**:
  - `lib-manifest.json` for lib plugins
  - `deps-manifest.json` for normal/boot plugins
- **Dev Server Integration**: Integrates with MUSE dev server
- **CSS Injection**: Runtime CSS loading for dynamic styles
- **ESM/CommonJS Support**: Works with both module formats

## Supported Plugin Types

| Plugin Type | Can Build? | Generates |
|-------------|-----------|-----------|
| `lib` | ✅ Yes | `lib-manifest.json` |
| `normal` | ✅ Yes | `deps-manifest.json` |
| `boot` | ✅ Yes | `deps-manifest.json` |
| `init` | ✅ Yes | `deps-manifest.json` |

## Usage

### For Normal/Boot Plugins

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import museVitePlugin from '@ebay/muse-vite-plugin';

export default defineConfig({
  plugins: [react(), museVitePlugin()],
});
```

### For Lib Plugins (NEW!)

Same configuration as above. The plugin automatically detects lib type from `package.json`:

```json
{
  "muse": {
    "type": "lib"
  }
}
```

During build, the plugin will:
- Analyze all modules and their exports
- Generate `lib-manifest.json` in `build/dist/` (production) or `node_modules/.muse/dev/` (dev)
- Track shared modules for consumption by other plugins

## Dev Guide

### Linking for Development

1. Link this plugin globally:
```bash
pnpm link -g
```

2. In your plugin project, link the plugin:
```bash
pnpm link @ebay/muse-vite-plugin
```

3. Add scripts to your plugin's package.json:
```json
{
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "build:test": "vite build --mode e2e-test"
  }
}
```

4. Start dev server:
```bash
pnpm start
```

### Verifying Lib Plugin Build

For lib plugins, verify the manifest is generated:

**Dev mode:**
```bash
pnpm start
# Check: node_modules/.muse/dev/lib-manifest.json
```

**Production build:**
```bash
pnpm build
# Check: build/dist/lib-manifest.json
```

## Migrating from Webpack

If you're migrating a lib plugin from `muse-webpack-plugin`:

1. Remove webpack dependencies: `react-scripts`, `@craco/craco`, `@ebay/muse-craco-plugin`
2. Add: `pnpm add -D vite @vitejs/plugin-react @ebay/muse-vite-plugin`
3. Create `vite.config.js` (see above)
4. Update package.json scripts (see above)
5. Test both dev and build modes

See CLAUDE.md for detailed migration guide.