# muse-cli
Muse global command line interface to manage Muse apps/plugins.

## App management
* ✅ `muse create-app [app-name]` Create a new app.
* ✅ `muse view-app [app-name]` View the app meta.
* ✅ `muse view-full-app [app-name]` View the full app including deployed plugins.
* ❓ `muse delete-app [app-name]`
* ✅ `muse list-apps` View all Muse apps in the registry.
* ❓ `muse export-app [app-name]`

## Env management
* ✅ `muse create-env [app-name] [env-name]` Create a new env for an app.
* ❓ `muse delete-env [app-name] [env-name]`

## Plugin management
* ✅ `muse create-plugin [plugin-name]` Create a Muse plugin.
* ✅ `muse release/release-plugin [plugin-name] [version?]` Release a plugin from the current `build` folder. Should run `yarn build && yarn build:dev` first. `version` is optional, if not provided, will increase the patch version.
* ✅ `muse deploy/deploy-plugin [app-name] [env-name] [plugin-name] [version?]` Deploy a plugin to the app/env. `version` is optional. if not provided, it will deploy the latest release.
* ✅ `muse undeploy/undeploy-plugin [app-name] [env-name] [plugin-name]` Undeploy a plugin.
* ❓ `muse delete-plugin [plugin-name]`
* ❓ `muse list-deployed-plugins [app-name] [env-name]` Show the list of deployed plugins on a app/env.
* ✅ `muse list-plugins` List all registered plugins.

## Local Dev/Testing Server
* ✅ `muse serve [app-name] [env-name?] [port?]` Serve the Muse application, `env-name` defaults to `staging`, `port` defaults to `6070`.

## Config
* ❓`muse show-config` Show the current muse config.
