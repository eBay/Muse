# muse-next
Next generation of Muse.

## Overview
This is a monorepo to host all Muse code.

- examples: Sample plugin projects to test Muse build system and dev time setup.
- packages: all Muse packages.

## Dev Guide

1. Run `pnpm` to install dependencies under root of `muse-next`.
2. Run `npm link` under `packages/muse-cli` to enable the global `muse` command.
3. Create a Muse app in the local registry: `muse create-app app1`
4. Create a new staging env on app1: `muse create-env app1 staging`
5. Create muse plugin in the local registry for projects under `/examples`:
   - Create plugin `muse create @ebay/muse-react`
   - Build plugin: run `yarn build` and `yarn build:dev` under example projects
   - Release plugin: run `muse release @ebay/muse-react` under example projects (use correct plugin name)
   - Deploy plugin on `app1/staging`: `muse deploy app1 staging @ebay/muse-react`. This deploy the latest version of plugin on the app.
6. Go to `packages/muse-web` and run `pnpm start` to start the Muse sample app server.

Then you should able to access http://localhost:6070 to see the Muse app locally.


To start a example local project, you can use `pnpm start` just like the current Muse behavior. And it also supports `MUSE_LOCAL_PLUGINS` in the `.env` file.

For the full Muse CLI commands, please see: https://github.corp.ebay.com/muse/muse-next/tree/main/packages/muse-cli .

> You can check `<home-dir>/muse-storage` to see the new Muse registry and static resource storage.

## Muse Core Configuration
Muse engine could be extended by plugins, for example log, monitoring, storage, etc. All muse-core plugins are normal npm modules defined in `muse.config.yaml`.

Muse core config is designed with a simple structure, that is all configurations are done by plugins excepts two config:
  - defaultRegistryStorageOptions
  - defaultAssetsStorageOptions

The two special ones are used for default FileStorage for registry and assets.

A muse-core plugin is a normal `js-plugin` instance (js object).

Muse will look for a config file from the current working directory and then homedir of the current os.

For example:
```yaml
plugins:
  - git-registry-storage-plugin # defined by string
  - module: perf-plugin/mark-start  # defined by module name and foo
    options:
      foo: bar
  - perf-plugin/log
```

If a plugin is a string, it will load the plugin instance by `require(moduleName)`, for example: `require('perf-plugin/log')`.

If the loaded plugin instance is a function, it will call the function to return the plugin object by opptions.

When a plugin is registered, it will call `pluginInstance.initialize(options)`.

When all plugins are loaded to Muse system. `pluginInstance.onReady` is called.

Note, all plugin packages should be available in the current working directory.

## Using pnpm
We switched pakcage manage from yarn v1 to pnpm to improve installation efficiency.

`muse-next` use pnpm workspaces feature to manage all packages under examples and packages folder.

To use pnpm:
1. Install pnpm
2. Run `pnpm install` under `muse-next` folder.
3. Run `npm link` under `packages/muse-cli` to enable the global `muse` command. NOTE that it is `npm link` since it seems there's a bug for `pnpm link` in the current version.



## License
MIT
