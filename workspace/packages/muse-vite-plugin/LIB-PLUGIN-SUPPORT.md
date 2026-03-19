# Lib Plugin Support Implementation

## Overview

This document describes the implementation of lib plugin build support in `@ebay/muse-vite-plugin`, enabling the deprecation of `muse-webpack-plugin` for lib plugins.

## What Was Added

### New Files

1. **lib/museLibManifestPlugin.js**
   - Rollup plugin for generating `lib-manifest.json` during production builds
   - Uses Rollup's `moduleParsed` hook to extract module export information
   - Outputs to `build/{dist|dev|test}/lib-manifest.json`

2. **lib/museLibManifestDevPlugin.js**
   - Vite plugin for generating `lib-manifest.json` during development
   - Uses `es-module-lexer` to parse exports from transformed code
   - Outputs to `node_modules/.muse/dev/lib-manifest.json`
   - Enables immediate consumption by linked plugins

### Modified Files

1. **lib/museVitePlugin.js**
   - Added lib plugin detection via `pkgJson.muse.type === 'lib'`
   - Conditionally applies different plugin strategies:
     - Lib plugins: `museLibManifestPlugin` (build) or `museLibManifestDevPlugin` (dev)
     - Normal/boot plugins: `museRollupPlugin` (as before)
   - Added plugin imports and orchestration logic

2. **package.json**
   - Added `es-module-lexer` dependency for parsing ES module exports

3. **README.md**
   - Added comprehensive documentation for lib plugin support
   - Added migration guide from webpack
   - Added verification steps

4. **CLAUDE.md**
   - Updated architecture documentation
   - Added lib plugin support section
   - Added migration guide
   - Updated plugin composition and flow diagrams

## How It Works

### Build Flow for Lib Plugins

**Development Mode:**
```
1. Vite starts dev server
2. museLibManifestDevPlugin is added to plugin pipeline
3. Each module transform is intercepted
4. es-module-lexer parses exports from code
5. Exports are tracked in Map
6. On buildEnd, lib-manifest.json is written to node_modules/.muse/dev/
7. Linked consuming plugins can immediately read the manifest
```

**Production Mode:**
```
1. Vite build starts
2. museLibManifestPlugin is added to Rollup pipeline
3. Rollup's moduleParsed hook fires for each module
4. Module exports are extracted from moduleInfo.exports
5. Module ID is constructed as packageName@version/path
6. On generateBundle, lib-manifest.json is written to build/{mode}/
7. Manifest is packaged with plugin for deployment
```

### Plugin Detection

The plugin automatically detects lib type from `package.json`:

```json
{
  "muse": {
    "type": "lib"
  }
}
```

This triggers the lib-specific build pipeline.

### Manifest Structure

Generated `lib-manifest.json`:

```json
{
  "name": "@ebay/muse-lib-react",
  "type": "lib",
  "content": {
    "react@18.2.0/index.js": {
      "id": "react@18.2.0/index.js",
      "exports": ["default", "useState", "useEffect", "useCallback"],
      "buildMeta": {
        "providedExports": ["default", "useState", "useEffect", "useCallback"]
      }
    },
    "react-dom@18.2.0/client.js": {
      "id": "react-dom@18.2.0/client.js",
      "exports": ["default", "createRoot", "hydrateRoot"],
      "buildMeta": {
        "providedExports": ["default", "createRoot", "hydrateRoot"]
      }
    }
  }
}
```

## Key Design Decisions

1. **Separate Dev and Build Plugins**
   - Dev mode uses Vite's transform hook with es-module-lexer
   - Build mode uses Rollup's moduleParsed hook
   - This provides optimal accuracy in each environment

2. **Module ID Format**
   - Follows existing pattern: `packageName@version/relativePath`
   - Enables version matching via `@ebay/muse-modules`

3. **Export Tracking**
   - Named exports are tracked individually
   - Default export is tracked as 'default'
   - buildMeta preserves compatibility with webpack format

4. **Output Locations**
   - Dev: `node_modules/.muse/dev/` (for pnpm link support)
   - Build: `build/{mode}/` (packaged with plugin)

## Testing Recommendations

To verify lib plugin support:

1. **Create a test lib plugin:**
   ```bash
   muse create-plugin test-lib-plugin
   cd test-lib-plugin
   # Edit package.json: set muse.type to "lib"
   pnpm add -D vite @vitejs/plugin-react @ebay/muse-vite-plugin
   # Create vite.config.js
   ```

2. **Test dev mode:**
   ```bash
   pnpm vite
   # Verify: node_modules/.muse/dev/lib-manifest.json exists
   # Check manifest contains your modules with exports
   ```

3. **Test build mode:**
   ```bash
   pnpm vite build
   # Verify: build/dist/lib-manifest.json exists
   # Check manifest structure matches expected format
   ```

4. **Test with consuming plugin:**
   ```bash
   # In lib plugin:
   pnpm link -g

   # In normal plugin:
   pnpm link test-lib-plugin
   # Add import from test-lib-plugin
   pnpm vite
   # Verify shared module resolves correctly
   ```

## Benefits

1. **Unified Tooling**: All plugin types can now use Vite
2. **Faster Builds**: Vite is significantly faster than Webpack
3. **Better DX**: Faster HMR, better error messages
4. **Simpler Config**: No need for CRA, Craco, or complex webpack configs
5. **Native ESM**: Better alignment with modern JavaScript

## Migration Path

Existing lib plugins using `muse-webpack-plugin` can migrate by:

1. Removing webpack dependencies
2. Adding Vite and this plugin
3. Creating `vite.config.js`
4. Updating package.json scripts
5. Testing dev and build modes

See README.md and CLAUDE.md for detailed steps.

## Compatibility

- ✅ Compatible with existing lib manifest consumers
- ✅ Generates same manifest structure as webpack plugin
- ✅ Works with `@ebay/muse-modules` version matching
- ✅ Supports `sharedLibs.exclude` configuration
- ✅ Works with pnpm link workflow

## Future Enhancements

Potential improvements:

1. **Source maps**: Add source map support for shared modules
2. **Watch mode**: Improve dev mode manifest regeneration on file changes
3. **Type definitions**: Generate TypeScript definitions from manifests
4. **Validation**: Add manifest validation against schema
5. **Performance**: Optimize export parsing for large codebases
