# Muse Registry and Assets
Muse manages all apps and plugins information for both dev time and runtime. It includes two parts:
- **registry**: maintains all metadata of Muse apps and plugins
- **assets**: all plugins releases assets with semantic version. 

See below picture about how Muse registry and assets are used:

<img src={require("/img/storage-runtime.png").default} width="640" />

In short, Muse web server reads Muse app metadata from the registry and construct the `index.html` with `MUSE_GLOBAL` as a global variable to be sent to the browser. Then the page loads plugin bundles from the assets server which reads assets from the Muse assets storage.

## Muse Registry

Muse has a central registry to maintain all Muse apps and plugins metadata. The registry could use any kind of storage provider, like local file system, a remote git repo, database, etc.

All metadata is persited in `yaml` format. If you follow the guide in [get started](../02%20-%20get-started.md), you should already have a folder `<homedir>/muse-storage/registry` similar with below structure:

```
muse-storage
├── assets
└── registry
    ├── apps
    │   ├── musemanager
    │   │   ├── staging
    │   │   │   ├── @ebay.muse-boot-default.yaml
    │   │   │   ├── musemanager.yaml
    │   │   │   └── ...
    │   │   └── musemanager.yaml
    │   └── ...
    └── plugins
        ├── releases
        │   ├── muse-manager.yaml
        │   └── ...
        ├── muse-manager.yaml
        └── ...
```

Now we will explain the registry structure for the `musemanager` app which was installed by `muse init` command introduced in the [get started](../02%20-%20get-started.md) topic.

### The Muse app and environments meta
During the Muse initialization, it created an app named `musemanager` and an environment `staging`, so we have below yaml file:

```yaml title="~/muse-storage/registry/apps/musemanager/musemanager.yaml"
name: musemanager
title: 'Muse Manager'
createdBy: nate
createdAt: '2022-10-26T10:45:26.559Z'
owners:
  - nate
envs:
  staging:
    name: staging
    createdBy: nate
    createdAt: '2022-10-26T10:45:26.566Z'
```

The app metadata must contains below properties:
- **name**: the name of the app. It should be uniq in the registry.
- **title**: the default title of your web app.
- **envs**: a workable Muse app must have at least one environment. Every plugin is deployed to some environment of the app. The default environment is `staging`.

There is also a `staging` folder under the app `musemanager` folder, where all plugins deployed to the `staging` environment are maintained. For example:

```yaml title="~/muse-storage/registry/apps/musemanager/staging/muse-manager.yaml"
name: '@ebay/muse-manager'
version: 1.0.27
type: normal
```

It means the version `v1.0.27` of the plugin `@ebay/muse-manager` is deployed to the `staging` environment of the app `musemanager`. Though you can add any other properties to the metadata, it at least needs three properties: `name`, `version` and `type`.

:::note
Muse auto adds `createdBy` (system user name by default) and `createdAt` when create Muse apps, environemtns, releases or plugins. In a real case of micro-frontends infrastructure use case, the metadata can be much more complicated than here. You can add any properties to the metadata in the registry and then consume them by yourself.
:::

### Plugin Meta
Every Muse plugin must have an plugin meta entry in the registry before it can be released or deployed. For example, below it the meta for plugin `@ebay/muse-lib-react`:

```yaml title="~/muse-storage/registry/plugins/@ebay.muse-lib-react.yaml"
name: '@ebay/muse-lib-react'
createdBy: nate
createdAt: '2022-10-14T03:13:52.761Z'
type: lib
owners:
  - nate
source: npm
```

You can put any other meta in the plugin entry, but the meta must contain at least two properties:
- name: the name of the plugin. It must be uniq in your Muse registry.
- type: the type of the plugin. If not provided, it's normal plugin.

The plugin entry in the registry could be a plugin created by yourself or installed from a npm registry. You may noticed you didn't manually create the `@ebay/muse-lib-react` plugin but it does exist in your local Muse registry. That's because `muse init` command called `muse install` like below:
```bash
$ muse install @ebay/muse-lib-react@latest --registry=https://registry.npm.org
```

:::info
The `muse install` command is used to install a third party plugin to your registry(local or remote), so that you can deploy the plugin to your application. It mainly does two things:
1. Create the plugin meta in your Muse registry (with the same name).
2. Download the plugin's release assets to your Muse assets.
:::

:::tip
A Muse plugin name is aligned to npm package's name. It supports scope packages like `@ebay/*`.
:::

### Plugin releases meta
Muse manages plugins' releases with semantic versioning. Whenever you release a plugin, it consists of two parts:
1. Create a release entry in the Muse registry
2. Upload the assets to Muse assets storage (introduced in the below [Muse assets](#muse-assets) section.)

A release entry in the registry is necessary when you deploy a plugin to a Muse app. For example, below is a sample release entry for the plugin `@ebay/muse-lib-react`:

```yaml title="~/muse-storage/registry/plugins/releases/@ebay.muse-lib-react.yaml"
- pluginName: '@ebay/muse-lib-react'
  version: 1.0.29
  createdAt: '2022-10-20T02:39:18.677Z'
  createdBy: nate
  source: npm
- pluginName: '@ebay/muse-lib-react'
  version: 1.0.28
  createdAt: '2022-10-15T14:12:19.899Z'
  createdBy: nate
  source: npm
```
From the `yaml` file we can see there are three versions in the registry. You can deploy some version from there to a Muse app. One release yaml file usually inlcudes recent 100 releases of a Muse plugin. Every release item expects to have corresponding release bundles in Muse assets storage.


:::tip
Though you usually use Muse CLI or Muse Manager to manage meta data in the Muse registry, you are free to edit it manually if you are familier with it enough.
:::
## Muse assets
Muse assets is a built-in mechanism to server Muse app's assets. It mainly contains plugins' release bundles, that is, the result when you run `npm run build`. If you explore the folder `~/muse-storage/assets` you can see below folder structure:

```
muse-storage/assets/p
└── @ebay.muse-lib-react
    ├── v1.0.27
    ├── v1.0.28
    └── v1.0.29
        ├── dev
        ├── dist
        │   ├── static
        │   ├── main.js
        │   ├── lib-manifest.json
        │   └── ...
        └── assets.zip
```

You can see each plugin is a folder in the `assets/p` folder. Under the plugin folder is versions, each version has both `dev` and `dist` bundles:
- **dist**: it's the same as you already know, for production usage.
- **dev**: it's special for Muse. While you develope a Muse plugin locally but need a remote plugin, then the dev bundle is loaded to your local app so that it works in dev mode and can use shared dev modules (actually only dev modules available at dev time).

Note that since Muse already manages build results with versions, the main file is just `main.js`, (`boot.js` for `boot` plugin) without any hashed string. The other parts of a release bundle is the same as a normal frontend's build result.

:::note
The reason why there is a `p` folder is because we may use the Muse assets storage to persist other kind of assets like app icon, etc. So we use a folder `p` to persist all plugin release bundles.
:::

## Understanding `MUSE_GLOBAL`
Ok, based on the above introduction, you should already understand one point: all information to launch a Muse app is all in the Muse registry. When you run `muse serve myapp staging` to start a Muse app, it actually reads all app info from the Muse registry and construct the `MUSE_GLOBAL` global variable to be used in the frontend.

For example, if you open the [Muse demo app](https://demo.musejs.org), you can insepct the `MUSE_GLOBAL` global variable in the dev console:

```json
{
  "app": {
    "name": "myapp",
    "createdBy": "nate",
    "createdAt": "2022-10-06T12:56:38.683Z",
    "owners": ["nate"],
    "iconId": 1,
    "variables": { "routerType": "hash" }
  },
  "env": { "name": "staging", "createdBy": "nate", "createdAt": "2022-10-06T12:56:38.695Z" },
  "appName": "myapp",
  "envName": "staging",
  "plugins": [
    { "name": "@ebay/muse-boot-default", "version": "1.0.32", "type": "boot" },
    { "name": "@ebay/muse-dashboard", "version": "1.0.0", "type": "normal" },
    { "name": "@ebay/muse-layout-antd", "version": "1.0.0", "type": "normal" },
    { "name": "@ebay/muse-lib-antd", "version": "1.0.13", "type": "lib" },
    { "name": "@ebay/muse-lib-react", "version": "1.0.29", "type": "lib" },
    { "name": "demo-controller-plugin", "version": "1.0.2", "type": "normal" },
    { "name": "demo-init-plugin", "version": "1.0.4", "type": "init" },
    { "name": "doc-plugin", "version": "1.0.4", "type": "normal" },
    { "name": "roles-plugin", "version": "1.0.4", "type": "normal" },
    { "name": "users-plugin", "version": "1.0.2", "type": "normal" }
  ],
  "cdn": "/muse-assets",
  "bootPlugin": "@ebay/muse-boot-default",
  "serviceWorker": "/muse/muse-demo-app/muse-sw.js"
}

```

You can see information is from the registry, explained below:
- **app**: the app info, including icon info, variables, etc.
- **env**: the env info, can override any properties on the app meta
- **appName**: the current app name.
- **envName**: the current env name.
- **plugins**: the plugins to be loaded.
- **cdn**: the static server address to serve plugin bundles. By default it uses the same server which serves index.html under path `/muse-assets`. In a more robust approach is hosting static bundles with some cdn service. Note that cdn server should respect the Muse resource patern like `/muse-assets/p/@ebay.muse-lib-react/v1.2.1/dist/main.js`.
- **bootPlugin**: the boot plugin name.
- **serviceWorker**: if exists, register it. By default Muse app server middleware provides a service worker to cache and clean plugin bundles in the browser side. It ensures every plugin version is only downloaded once.

## Understanding `muse export`
In the [get started](../02%20-%20get-started.md) topic we have used the `muse export` command. It exports all necessary registry metadata and assets for a Muse app and environment. The exported content includes two parts:
- `index.html`: the html page with embeded `MUSE_GLOBAL` global variable which contains all registry data.
- `assets`: the folder with same structure as Muse assets. But it only includes dist bundles and necessary versions.

Instead of exporting, if you use Muse as infrastructure you may also have a Muse web server to read Muse registry and assets storage to serve a Mues app directly (just like how `muse serve` command works).

You can learn the full usage of `muse export` command [here](#todo).

## Summary
Muse registry and asests are core concepts of Muse at resource organization level. They are important to understand how Muse works. Actually many Muse management tools like create app, release plugin, deploy plugin all operate on these Muse metadata.

Though we only see registry and assets data at the local file system. Actually they can be at some remote places. For example, inside eBay, we use a Git repo to maintain handreds of Muse apps and plugins (then every change is trackable). Use a s3-like storage to persist plugin bundles. In later topics we will introduce how to use Muse backend plugins to extend Muse system to support other type of storage.

:::note
Now we only see registry and assets data in the Muse storage, but Muse storage is a abstract layer to persiste Muse related data. In later scenarios you will see we will have other data in Muse storage.
:::
