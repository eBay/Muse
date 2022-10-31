# Local Development Config

Developer experience is the first-class citizen in Muse. So Muse has provided complete solutions to address challenges and additional complexity introduced by Micro-frontends.

## Working on multiple plugins together
There are varous scenarios those need to work on multiple projects together at same time. For example:

  - Load remote plugins on a Muse app: when you are working on a feature (plugin) on the app, you need to load plugins to contribute to their exitension points.
  - You work on multiple plugins locally, while one project is changed (eg: added a new shared module, defined a new expoint, etc). Then you need to load dev time bundles as plugins locally.

It's useful if you only need other features besides your current plugin project, for example:

  - Contribute to extension points of them
  - Need to use shared modules or exported assets from them

Muse provides two approaches:

  - Combine source code
  - Load remote plugins




### Load remote plugins
While working on your local plugin project, you can load other remote plugins' dev bundles. They could be either from a static resource server or a local webpack dev server. You can declare remote plugins by two formats, by plugin name or by URL.

:::info
A dev bundle means the build result with NODE_ENV=development. So that it can work with local plugin served by webpack dev server and use same shared dev modules from lib plugins.
:::

  1. **By plugin name**: if you don't need to change code of a remote plugin then you should always use this approach since it's simple and performant. You can specify an array of plugin names (`*` for all) for them, then the version deployed to the current app/env will be loaded from remote. It also means the plugin must have been deployed to the app.

  2. **By URL**: say that you have two plugins projects locally and started dev server separately. Then you can load one plugin bundle to the other using one of URL formats below:
  ```
  Format 1: <pluginName>#<pluginType>:http://localhost:3000/main.js
  Example : myplugin#normal:http://localhost:3000/main.js`
  ```
  It means load a `normal` plugin `myplugin` from url `http://localhost:3000/main.js`.

  ```
  Format 2: <pluginFolder>:<port>
  Example : ../myplugin:3000
  ```
  Format 2 is a shortcut of the format 1 since if Muse knows the project folder it can get the plugin name and type. So the second example is the same as `myplugin#normal:http://localhost:3000/main.js`.

  While a plugin is loaded via URL from a local dev server, you can make changes to multiple projects and they are compiled by different webpack dev servers but can be loaded into the same for development.

#### Then where to define the remote plugins? There are two approaches:

  1. Use the environment variable `MUSE_REMOTE_PLUGINS`. Usually we also define it in `.env` file which is not commited to the repo. Seperate every plugin by `;`. For example:
  ```
  MUSE_REMOTE_PLUGINS=users-plugin;../roles-plugin:3030;
  ```
  
  If you don't want your setup to affect others, then you should use this approach since it's not commited to the repo.

  2. Set it in `muse.devConfig.remotePlugins` in `package.json`:
  ```json
  {
    "name": "myplugin",
    "version": "1.0.0",
    "muse": {
      "devConfig": {
        "app": "myapp",
        "env": "staging",
        "remotePlugins": [
          // load it from Muse asset storage with the current deployed version
          "users-plugin",
          // get plugin name and type from package.json, and load it from url http://localhost:3030/main.js
          "../roles-plugin:3030",
          // embed plugin name and type info
          "docs-plugin#normal:http://localhost:3000/main.js"
        ]
      }
    },
    //...
  }
  ```
  Though this option also supports local plugins by URL, we usually should avoid it since other team members may not have same folder structure.

:::caution IMPORTANT
While load by URL, you should ensure the webpack dev server is already started. That is, the URL serves the dev bundle.
:::

:::info

**Why do we need to know plugin name and type when loaded by URL?**

A plugin not only has a js bundle but also some configurations, for example, plugin variables, allowlist, etc. These configurations are maintained in the Muse registry. So to use these configurations, it needs to know plugin names to get the information.

Plugin type is used when loading the bundles, for example, init plugins are loaded before normal and lib plugins. So the boot logic needs the type info to load plugins in the correct order.

:::

:::tip TIPS

  - Changing remote plugins config does NOT need to restart the webpack dev server. So, you can enable or disable a remote plugin very easily.
  - All deployed boot and init plugins are always loaded as remote plugins.
  - All dependent plugins, which means they are dependents of some specified remote plugins, will be loaded.
  - All deployed plugins which have `core: true` property will be also always loaded.
  - If a remote plugin is defined both by name and URL, the the URL one has higher priority.
  - If a library plugin is already installed locally, it has higher priority than remote plugin by name but lower priority than remote plugin by URL.

:::


For most cases you can use remote plugins approach to work on multiple plugins. But there is one exception 


### Combine source code
Besides load remote plugins, Muse also allows to combine source code from multiple local plugin projects to be run in a single webpack dev server. You can define them in `MUSE_LOCAL_PLUGINS` environment variable seperated by `;`. We usually specify it in the `.env` file under a plugin project, for example:

```txt title=".env"
MUSE_LOCAL_PLUGINS=../roles-plugin;../users-plugin;/Users/nate/doc-plugin;
```

:::note

A `.env` is usually not commited to the repo, so we use it since MUSE_LOCAL_PLUGINS is always related with the local environment. Different developers may have different config.

:::

It means `roles-plugin`, `users-plugin`, `doc-plugin` projects are also compiled together with the current plugin project. The folder path could be either relative path to the current working dir or absolute paths.


Internally, while you run `npm start` Muse will then add all entries to the webpack config based on these folders path:

```js
entry: [
  './current-plugin/src/index.js', // The current plugin project's entry
  '../roles-plugin/src/index.js',
  '../users-plugin/src/index.js',
  '/Users/nate/doc-plugin/src/index.js',
]
```

It's a convention that the entry file must be `src/index.js` for Muse plugins.

:::info
**How dependencies are resolved?**

Muse resolves dependenceis from `node_modules` folder from all projects in the declared order. For example:
  - If `lodash` is used by all plugins, then the `lodash` under `current-plugin` is used for all.
  - If `moment` is used by `roles-plugin` and `users-plugin`, then the `moment` under `roles-plugins` is used for both.
:::

:::caution IMPORTANT 1
Since it compiles all source code together, it needs the current plugin's webpack config support all loaded projects. For example, if you have a typescript project and a javascript project, then you can only start dev server from the typescript project since it can cover the javascript case. However, it's not a problem if all plugins use same webpack config.
:::

:::caution IMPORTANT 2

You can only use this approach for `normal` and `lib` plugins but NOT `boot` or `init` plugins since the later are loaded at different points of the loading lifecycle.

:::
### Comparison
Below is the summary of different options for working on multiple projects.

## Specify the current Muse app
## Override app variables

## Inherited app and plugin meta

