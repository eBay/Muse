# muse-next2

Next generation of Muse.

## Overview

This is a monorepo to host all Muse code.

- ui-plugins: Official re-useful Muse ui plugins.
- workspace: The pnpm workspace as Muse runtime.

## Dev Guide

1. Run `pnpm` to install dependencies under folder of `muse-next/workspace`.
2. Run `npm link` under `packages/muse-cli` to enable the global `muse` command. (NOTE it's `npm link`).
3. Create a Muse app in the local registry: `muse create-app app1`
4. Create a new staging env on app1: `muse create-env app1 staging`
5. Create muse plugins in the local registry for every project under `/examples`:
   - Create plugin `muse create @ebay/muse-lib-react`  (and @ebay/muse-lib-antd etc...)
   - Build plugin: run `pnpm build` and `pnpm build:dev` under example projects
   - Release plugin: run `muse release` under example projects (use correct plugin name)
   - Deploy plugin on `app1/staging`: `muse deploy app1 staging @ebay/muse-lib-react`. This deploys the latest version of plugin on the app.
6. Run `muse serve app1 staging` to start the local testing server.

Then you should be able to access http://localhost:6070 and see the Muse app locally.

To start an example local project, you can use `pnpm start` just like the current Muse behavior. And it also supports `MUSE_LOCAL_PLUGINS` in the `.env` file.

For the full Muse CLI commands, please see: https://github.corp.ebay.com/muse/muse-next/tree/main/packages/muse-cli .

> You can check `<home-dir>/muse-storage` to see the new Muse registry and static resource storage.

## Muse Core Configuration

Muse engine could be extended by plugins, for example log, monitoring, storage, etc. All muse-core plugins are normal npm modules defined in a Muse config file. Muse uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) to load config from a config file with below priority:

- `.muserc` : yaml format
- `.muserc.json` : json format
- `.muserc.yaml` : yaml format
- `muse.config.yaml` : yaml format
- `muse.config.js` : a commonjs module to export the config object or a function to return the object
- `muse.config.json` : json format

It looks for the config file from the current working directory to the parents until the home dir.

Muse core config is designed with a simple structure: all configurations are done by plugins. So normally the only property in a config file is `plugins`. See below example about all possible plugin definition:

```js
// muse.config.js
module.exports = {
  plugins: [
    // 1. Use a string to load the plugin
    // A commonjs module to export a plugin object or a function to return the plugin object
    // It's loaded by require('my-muse-plugin')
    'my-muse-plugin',
    // The path could be a relative path to the config file
    './packages/my-plugin',
    // The path could be point to a specific module path
    'my-muse-plugin/lib/somePluing',

    // 2. Load a plugin with options
    // In this case the plugin module should be a function so that it accepts the options to initialize the plugin object
    ['my-plugin', { endpoint: 'some.com/api', token: '$env.MY_TOKEN' }],

    // 3. A plugin object directly. For example: a plugin implement "some.ext.point" extension point
    // If plugin instance contains some methods then it is not supported in yaml or json format.
    {
      name: 'my-plugin-instance',
      some: {
        ext: {
          point: async () => {
            // do something
          },
        },
      },
    },
  ],
};
```

Muse config supports using a environment variable a config value by using `$env.MY_TOKEN`. Whenever a property value starts with `$env.` then it will get the environment variable with the left part of the string as name. For example: `$env.MY_TOKEN` will get the value from `process.env.MY_TOKEN`.

You can use a dotenv file named `.env.muse` under the current working directory or homedir to set the environtment variables.

## Using Muse CLI

Muse global command line interface to manage Muse apps/plugins. Implemented by `workspace/packages/muse-cli`. Below is part of the commands:

### App management

- ✅ `muse create-app [app-name]` Create a new app.
- ✅ `muse view-app [app-name]` View the app meta.
- ✅ `muse view-full-app [app-name]` View the full app including deployed plugins.
- ✅ `muse delete-app [app-name]`
- ✅ `muse list-apps` View all Muse apps in the registry.
- ✅ `muse export-app [app-name]`

### Env management

- ✅ `muse create-env [app-name] [env-name]` Create a new env for an app.
- ✅ `muse delete-env [app-name] [env-name]`

### Plugin management

- ✅ `muse create-plugin [plugin-name]` Create a Muse plugin.
- ✅ `muse release/release-plugin [plugin-name?] [version?]` Release a plugin from the current `build` folder. Should run `yarn build && yarn build:dev` first. `version` is optional, if not provided, will increase the patch version.
- ✅ `muse deploy/deploy-plugin [app-name] [env-name] [plugin-name] [version?]` Deploy a plugin to the app/env. `version` is optional. if not provided, it will deploy the latest release.
- ✅ `muse undeploy/undeploy-plugin [app-name] [env-name] [plugin-name]` Undeploy a plugin.
- ✅ `muse delete-plugin [plugin-name]`
- ✅ `muse list-deployed-plugins [app-name] [env-name]` Show the list of deployed plugins on a app/env.
- ✅ `muse list-plugins` List all registered plugins.

### Local Dev/Testing Server

- ✅ `muse serve [app-name] [env-name?] [port?] [--isDev]` Serve the Muse application, `env-name` defaults to `staging`, `port` defaults to `6070`.

### Requests

- ✅ `muse request [action] [...args]` Request to do something. For example: `muse request deploy-plugin app1 staging muse-react`.

> You can see the full list of commands by `muse -h`.
### Config

- ✅ `muse show-config` Show the current loaded muse config.

For more commands, plz use `muse -h` to see the list.

## Using pnpm

We switched package manager from yarn v1 to [pnpm](https://pnpm.io) to improve installation efficiency.

`muse-next` use pnpm workspaces feature to manage all packages under examples and packages folder.

Please learn every details of pnpm from its docs.

## Publish packages
We use [pnpm changesets](https://pnpm.io/using-changesets) to publish packages in the workspace.

Simple steps as below:
1. Go to workspace folder.
2. Run `pnpm changeset`, select which packages to publish
3. Run `pnpm changeset version` to update versions.
4. Commit changes
5. Run `pnpm publish -r` to publish updated packages.

## License

MIT
