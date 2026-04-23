# Muse SDK Presets (MSP)

**Muse SDK Presets (MSP)** is a registry-managed system for defining and distributing named sets of pinned package versions across a Muse deployment. Instead of every plugin team manually tracking which version of `@ebay/muse-core`, `@ebay/muse-lib-react`, etc. to use, an MSP preset provides a single authoritative snapshot that teams can reference by name.

## Purpose

In a large micro-frontend organization, dozens of plugin teams share the same core libraries. Version drift between teams causes compatibility issues at runtime — a normal plugin may consume a different React version than what the lib plugin exposes.

MSP solves this by:

- Centralizing approved package versions into named presets stored in the Muse registry (`/msp.yaml`)
- Allowing presets to **extend** a base preset so version sets compose rather than duplicate
- Providing CLI tools to keep presets up to date from the npm registry
- Providing a per-plugin command to update its own `package.json` to exactly match the preset it declared

## Storage

MSP data lives in the Muse registry as a single YAML file at `/msp.yaml`. Example:

```yaml
default:
  description: Base Muse package versions
  versions:
    "@ebay/muse-core": "1.0.45"
    "@ebay/muse-cli": "1.0.34"
    "@ebay/muse-lib-react": "1.3.2"
    "@ebay/muse-lib-antd": "1.3.2"

muse-react-260422:
  extends: default
  description: React preset
  creation: "2026-04-22"
  author: Nate Wang
  versions:
    "@ebay/muse-lib-react": "2.0.3"

muse-react-antd-260422:
  extends: muse-react-260422
  description: React + Ant Design preset
  creation: "2026-04-22"
  author: Nate Wang
  versions:
    "@ebay/muse-lib-antd": "2.0.3"
```

## Preset Resolution (`extends`)

When a preset declares `extends`, its versions are **merged** with the parent's versions — child values override parent values. This resolution is applied recursively through the entire chain.

For the example above, the fully resolved `muse-react-antd-260422` preset contains:

```json
{
  "@ebay/muse-core": "1.0.45",
  "@ebay/muse-cli": "1.0.34",
  "@ebay/muse-lib-react": "2.0.3",
  "@ebay/muse-lib-antd": "2.0.3"
}
```

The resolved (flattened) view is available via `museCore.data.get('muse.msp')`.

## Declaring an MSP preset in a plugin

In a plugin's `package.json`, add the `muse.msp` field with the preset name:

```json
{
  "name": "@ebay/my-plugin",
  "muse": {
    "type": "normal",
    "msp": "muse-react-antd-260422"
  }
}
```

## Updating plugin dependencies from the preset

Once `muse.msp` is declared, run:

```bash
muse check-updates
# or
muse-dev-utils check-updates
```

This command:
1. Reads `muse.msp` from `package.json`
2. Fetches the fully resolved preset from the registry
3. Compares each preset package's version against the currently **installed** version
4. Runs the detected package manager (`npm` / `pnpm` / `yarn`) to install only the packages that are behind

Only packages already listed in `dependencies` or `devDependencies` are updated. New packages are never added.

## Muse CLI — MSP management commands

All MSP management commands are available via the `muse` CLI:

### `muse get-msp`

Print the full contents of `msp.yaml` as JSON.

```bash
muse get-msp
```

### `muse add-preset <name>`

Add a new preset. The new preset is inserted at the **top** of `msp.yaml`.

```bash
# Basic preset with explicit versions
muse add-preset muse-react-260422 \
  --versions @ebay/muse-lib-react=2.0.3

# Preset that extends a base preset
muse add-preset muse-react-antd-260422 \
  --extends muse-react-260422 \
  --versions @ebay/muse-lib-antd=2.0.3
```

Options:
- `--extends <preset>` — parent preset to inherit versions from
- `--versions <pkg=version> ...` — space-separated list of package versions

### `muse delete-preset <name>`

Delete a preset from `msp.yaml`. Prompts for confirmation.

```bash
muse delete-preset muse-react-260422
```

### `muse update-preset-packages`

Update specific package versions in `msp.yaml` across all presets. A package is only updated in a preset if the new version shares the **same major version** as the current value in that preset. Pre-release versions are skipped unless `allowPreRelease` is configured via the API.

```bash
muse update-preset-packages \
  --versions @ebay/muse-core=1.0.46 @ebay/muse-cli=1.0.35
```

### `muse sync-preset-latest`

Fetch the latest published version of every package in `msp.yaml` from the npm registry and apply them (same major version rule applies).

```bash
# Use default registry (https://registry.npmjs.org)
muse sync-preset-latest

# Use a custom registry
muse sync-preset-latest --registry https://my.registry.com
```

### `muse check-updates`

Update a plugin's own `package.json` dependencies to match the MSP preset declared in `muse.msp`.

```bash
muse check-updates
```

## Programmatic API (`museCore.msp`)

MSP operations are available as a first-class subsystem on `museCore`:

```js
const museCore = require('@ebay/muse-core');

// Get raw msp.yaml contents
const raw = await museCore.msp.getMsp();

// Get flattened presets (extends fully resolved)
const flattened = await museCore.data.get('muse.msp');

// Add a preset
await museCore.msp.addPreset({
  name: 'muse-react-260422',
  preset: {
    extends: 'default',
    description: 'React preset',
    versions: { '@ebay/muse-lib-react': '2.0.3' },
  },
  author: 'nate',
});

// Delete a preset
await museCore.msp.deletePreset({ name: 'muse-react-260422' });

// Update package versions across all presets (same-major rule)
await museCore.msp.updatePackages({
  pkgs: {
    '@ebay/muse-core': { version: '1.0.46' },
    '@ebay/muse-cli': { version: '1.0.46-beta.1', allowPreRelease: true },
  },
});

// Sync all packages to their latest npm versions
await museCore.msp.syncLatest({ registry: 'https://registry.npmjs.org' });
```

## Files changed in this implementation

| File | Description |
|---|---|
| `muse-core/lib/msp/` | New `msp` subsystem folder (mirrors `am/`, `pm/` pattern) |
| `muse-core/lib/msp/getMsp.js` | Read `/msp.yaml` from the registry |
| `muse-core/lib/msp/addPreset.js` | Add a preset (inserted at top of file) |
| `muse-core/lib/msp/deletePreset.js` | Delete a preset by name |
| `muse-core/lib/msp/updatePackages.js` | Bulk update package versions with major-version guard |
| `muse-core/lib/msp/syncLatest.js` | Fetch latest npm versions and call `updatePackages` |
| `muse-core/lib/msp.js` | Thin re-export shim (`module.exports = require('./msp/index')`) |
| `muse-core/lib/schemas/msp/` | JSON schemas for each MSP API's params |
| `muse-core/lib/schemas/msp.json` | Registry-level schema for `/msp.yaml` content |
| `muse-core/lib/data/builders/muse.msp.js` | Data builder: reads & flattens `extends` chains for `muse.data.get('muse.msp')` |
| `muse-core/lib/plugins/registrySchemaPlugin.js` | Registered `msp.json` schema for registry write validation |
| `muse-core/lib/utils.js` | Added `/msp.yaml` case to `parseRegistryKey` |
| `muse-core/lib/index.js` | Exposed `museCore.msp` |
| `muse-cli/bin/muse.js` | Added `get-msp`, `add-preset`, `delete-preset`, `update-preset-packages`, `sync-preset-latest`, `check-updates` commands |
| `muse-cli/package.json` | Added `@ebay/muse-dev-utils` dependency |
| `muse-dev-utils/scripts/checkUpdates.js` | `check-updates` implementation using `cross-spawn` + `import-cwd` |
| `muse-dev-utils/bin/muse-dev-utils.js` | Wired `check-updates` command |
| `muse-dev-utils/package.json` | Added `cross-spawn`, `import-cwd` dependencies |
