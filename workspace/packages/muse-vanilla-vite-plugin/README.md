# @ebay/muse-vanilla-vite-plugin

Vite plugin for MUSE vanilla (`init` and `boot`) plugins. Encapsulates the standard Vite configuration so projects don't need to repeat it — just add the plugin to `vite.config.js`.

## Usage

```js
// vite.config.js
import { defineConfig } from 'vite';
import museVanillaVitePlugin from '@ebay/muse-vanilla-vite-plugin';

export default defineConfig({
  plugins: [museVanillaVitePlugin()],
});
```

## What it configures

**Build**

- Entry: `src/main.js`
- Output: `build/dist/main.js` (or `build/dist/boot.js` for boot plugins)
- Format: `iife`
- Source maps enabled

The output filename is determined automatically from `muse.type` in the project's `package.json`:

| `muse.type` | Output file |
|-------------|-------------|
| `boot`      | `boot.js`   |
| anything else | `main.js` |

**Dev server**

Configured via environment variables:

| Variable | Description |
|---|---|
| `PORT` | Dev server port; also sets `strictPort: true` |
| `MUSE_LOCAL_HOST_NAME` | Dev server hostname (default: `localhost`) |
| `HTTPS` | Set to `true` to enable HTTPS |
| `SSL_CRT_FILE` | Path to SSL certificate (default: `node_modules/.muse/certs/muse-dev-cert.crt`) |
| `SSL_KEY_FILE` | Path to SSL key (default: `node_modules/.muse/certs/muse-dev-cert.key`) |

## Overriding defaults

Any config keys set directly in `vite.config.js` take precedence over the plugin's defaults:

```js
export default defineConfig({
  plugins: [museVanillaVitePlugin()],
  build: {
    // override: disable source maps
    sourcemap: false,
  },
});
```

## Dev Guide

1. Link the package globally from this directory:
```
pnpm link -g
```

2. Go to a plugin project root and link it:
```
pnpm link @ebay/muse-vanilla-vite-plugin
```

3. Start the dev server:
```
pnpm start
```
