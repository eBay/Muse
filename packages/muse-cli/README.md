# muse-cli
Muse global command line interface to manage Muse apps/plugins.

## App management
* ✅ muse create-app [app-name]
* ❓ muse show-app [app-name]
* ❓ muse delete-app [app-name]
* ❓ muse list-apps
* ❓ muse export-app [app-name]
* ❓ muse view-app [app-name]
* ❓ muse view-full-app [app-name]

## Env management
* ❓ muse create-env [app-name] [env-name]
* ❓ muse delete-env [app-name] [env-name]

## Plugin management
* ❓ muse create-plugin [plugin-name]
* ❓ muse release-plugin [plugin-name] [version?]
* ❓ muse deploy-plugin [app-name] [env-name] [plugin-name] [version]
* ❓ muse delete-plugin [plugin-name]
* ❓ muse list-deployed-plugins [app-name] [env-name]
* ❓ muse list-plugins

## Config
* ❓ muse show-config
