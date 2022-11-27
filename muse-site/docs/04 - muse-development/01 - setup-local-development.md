# Local Development Config

Developer experience is the first-class citizen in Muse. So Muse has provided complete solutions to address challenges and additional complexity introduced by Micro-frontends.

## Specify the current Muse app/env
Unlike a normal web application, all things about the application are all in the current project, a Muse plugin project is usually only a small part of the whole applicaiton. So you need to be able to run the Muse application for your plugin at dev time. It's used for:

- As the host of your plugin
- Get app level configurations
- Get plugin list of the app.

You can specify the working app/env in the plugin project's `package.json`:

```json
{
  "name": "myplugin",
  "version": "1.0.0",
  "muse": {
    "devConfig": {
      "app": "myapp",
      "env": "staging",
    }
  },
  //...
}
```

The Muse dev server then reads the app info from Muse registry and serves the app locally in dev mode. By default, only core plugins configured on application and your current working plugin are loaded. But you can specify more if you need more plugins to be loaded as introduced below. 

:::note
Core plugins is just a logical concept which means they must be loaded to run the application. Technically all plugins are same. At dev time, you usually don't need all plugins to be loaded to develop your plugin.
:::

## No index.html
There is a special part of a Muse plugin: there should be no `index.html` in public folder of the plugin project (if there is, please delete it). That is, the plugin doesn't serve the `index.html` itself but Muse dev server does it.

The Muse dev server is a webpack plugin that reads Muse registry to construct the `index.html` to be loaded in the browser. To customize the `index.html` you can read the guide [here](#TODO).

## Working with multiple plugins together

There are various scenarios those need to work on multiple projects together at same time. For example:
- Your plugin contributes to extension points from other plugins.
- You changed code in one plugin then want to see it in another plugin at dev time.

Muse has provided complete solutions to address these common requirements. See the introduction below.

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

  While plugins are loaded via URLs from local dev servers, you can also make changes to the projects and they are compiled by different webpack dev servers but can be loaded into the same for development.

  ```mermaid
  flowchart LR
  id1(plugin 1)
  id11(plugin 1 dev server)
  id2(plugin 2)
  id22(plugin 2 dev server)
  id3(plugin 3)
  id33(plugin 3 dev server)
  id4((Muse App <br/> in browser))
  id1 --> id11 -->|localhost:3000/main.js| id4
  id2 --> id22 -->|localhost:3001/main.js| id4
  id3 --> id33 -->|localhost:3002/main.js| id4
  ```

 

#### Then where to define the remote plugins? There are two approaches:

  1. Use the environment variable `MUSE_REMOTE_PLUGINS`. Usually we also define it in `.env` file which is not commited to the repo. Seperate every plugin by `;`. For example:
  ```txt title=".env"
  MUSE_REMOTE_PLUGINS=users-plugin;../roles-plugin:3030;
  ```
  
  :::tip
  A `.env` is usually not commited to the repo, so we use it for developer specific local dev config. Different developers may have different config.
  :::

  2. Use `muse.devConfig.remotePlugins` in `package.json`:
  ```json {8-15}
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
  Though this option also supports local plugins by URL, we usually should avoid it since other team members may not have same folder structure. Usually we only set plugin names in `remotePlugins` since it usually means the plugins always needs those remote plugins to work together.

:::note
- While load by URL, you should ensure the webpack dev server is already started.
- The dev bundle from a remote plugin by URL should not have duplicated plugins from combine source code approach introduced below.
:::

:::info

**Why do we need to know plugin name and type when loaded by URL?**

A plugin not only has a js bundle but also some configurations, for example, plugin variables, allowlist, etc. These configurations are maintained in the Muse registry. So  it needs to know plugin names to get the information to use these configurations.

Plugin type is used when loading the bundles, for example, `init` plugins are loaded before `normal` and `lib` plugins. So the boot logic needs the type info to load plugins in the correct order.

:::

:::tip TIPS

  - Changing remote plugins config does NOT need to restart the webpack dev server. So, you can enable or disable a remote plugin very easily.
  - All deployed plugins which are specifed in `corePlugins` in the app config will be also always loaded.
  - `boot` and `init` plugins are also considered as core plugins, so they are also always loaded as remote plugins.
  - If a remote plugin is defined both by name and URL, the the URL one has higher priority.
  - If a library plugin is already installed locally, it has higher priority than remote plugin by name but lower priority than remote plugin by URL.

:::

### Combine source code
Besides load remote plugins, Muse also allows to combine source code from multiple local plugin projects to be run in a single webpack dev server. You can define them in `MUSE_LOCAL_PLUGINS` environment variable seperated by `;`. 

For example, say that the current working plugin is `users-plugin` but we want `roles-plugin` and `doc-plugins` are compiled together, So we can usually specify it in the `.env` file under `users-plugin` project:

```txt title=".env"
MUSE_LOCAL_PLUGINS=../roles-plugin;/Users/nate/doc-plugin;
```

It means `roles-plugin`, `doc-plugin` projects are also compiled together with the current plugin project. The folder path could be either relative path to the current working dir or absolute paths.

Say that we start the dev server from `users-plugin` project which have above `.env` setting, then all source code is compiled in a single dev server:
  ```mermaid
  flowchart LR
  id1(users-plugin)
  id2(roles-plugin)
  id3(doc-plugin)
  id11((dev server <br/>from users-plugin))

  id4((Muse App <br/> in browser))
  id1 -->|src| id11 
  id2 -->|src| id11 
  id3 -->|src| id11 
  id11 --> id4
  ```

Internally, while you run `npm start` Muse will add all entries to the webpack config based on these folders path:

```js
entry: [
  './users-plugin/src/index.js', // The current plugin project's entry
  '../roles-plugin/src/index.js',
  '/Users/nate/doc-plugin/src/index.js',
]
```


By default it finds `src/index.js` as the entry but you can change it in `muse.devConfig.entry`.

:::info
**How are dependencies resolved?**

When source code is compiled together, Muse resolves dependenceis from `node_modules` folder from all projects in the declared order. For example:
  - If `lodash` is used by all plugins, then the `lodash` under `users-plugin` is used for all.
  - If `moment` is only used by `roles-plugin` and `docs-plugin`, then the `moment` under `roles-plugins` is used for both.

That is, a plugin project doesn't first resolve dependencies from its own `node_modules` folder, but in the declared order.
:::

:::caution IMPORTANT 1
Since it compiles all source code together, it needs the current plugin's webpack config support all loaded projects. For example, if you have a typescript project and a javascript project, then you can only start dev server from the typescript project since it can cover the javascript case. However, it's not a problem if all plugins use same webpack config.
:::

:::caution IMPORTANT 2

You can only use this approach for `normal` and `lib` plugins but NOT `boot` or `init` plugins since the later are loaded at different points of the loading lifecycle. Instead, you can use remote plugin by URL for `boot` and `init` plugins at dev time.

:::


### How to choose?
Since there're different options for working on multiple plugins together, then how do we choose the proper one? Below is the summary:

<table style={{width: '100%', display: 'table'}}>
  <tr>
    <th style={{width: '200px'}}>Options</th>
    <th>When to use?</th>
  </tr>
  <tr>
    <td>Remote plugin by name</td>
    <td>
    This is the most frequently used config. All specified plugins which are deployed to the current working app/env will be loaded for local development. Use this approach when:
    <ul><li>It's already deployed to the app and you just use it but no need to change code of it.</li></ul>
     Note that if it's not deployed then it's ignored. 
    </td>
  </tr>
  <tr>
    <td>Remote plugin by URL</td>
    <td>It loads a plugin directly from another dev server by URL. Then any code change on that project will be applied to the current working app. Use this option when:
    <ul>
      <li>You need to test a <b>boot</b> or <b>init</b> plugin locally in another plugin project.</li>
      <li>You need to test multiple plugins together at dev time but want higher build performance. For example: add an extension point in one plugin and use it in another plugin. It has higher performance because projects are compiled by their own dev server.</li>
    </ul>
    The disadvantage of this options is: you need to start multiple webpack dev server which is not that convenient. So, we sometimes can use combine souce code instead.</td>
  </tr>
  <tr>
    <td>Compbine source code</td>
    <td>This option compiles source code from multiple projects together. Use this approach when:
      <ul>
        <li>You need to use a shared module from a lib plugin at dev time. For example, you created/updated an component in a lib plugin and want to use it in the current plugin project at dev time.</li>
        <li>You work on multiple plugin projects at dev time but the overhead build time could be ignored. This is an more convenient approach compared to remote plugin by URL.</li>
      </ul>
      Note that this option doesn't support boot or init plugins. And the current plugin project's webpack config should support other plugins.
    </td>
  </tr>
  
  <tr>
    <td>Use `.env`</td>
    <td>If the remote plugins or local plugins are only for yourself, then you should define it in a <b>.env</b> file so that it doesn't affect other developers.</td>
  </tr>
  <tr>
    <td>Use `package.json`</td>
    <td>It's usually for remote plugins by name with <b>muse.devConfig.remotePlugins</b>. Use it when the setting is necessary fo  all developers on the project.</td>
  </tr>
</table>

## Install libaray plugins locally
A library plugin is also published to the npm registry besides maintained in Muse registry. There are two cases for local development:

1. You need to use shared modules from some library plugins for your plugin project. Then you need to install them as dependencies. It's because Muse webpack plugin needs to know if a required module should be delegated to a shared module.
2. You don't use shared modules from a library plugin but it's necessary for a loaded remote plugin. Then you don't need to install it locally. Just define it as a remote plugin too.

   For example: you are working on plugin A, it doesn't directly use shared modules from plugin C, but you load a remote plugin B which needs shared modules from C. Then you don't need to install C as a dependency. Just load C as a remote plugin. However, it's also fine to install C as a local dependency.

Local installed library plugins have higher priority than remote plugins if defined at both places. It matters when the local installed version is different from the remote one. You can use this feature to test a library plugin before deploy to the app.


## Exclude shared modules
Sometimes you don't want to use the shared modules for some reasons like the version doesn't match. Then you can config it with `muse.devConfig.customLibs` in `package.json`:

> TODO

## Override app/env/plugins meta
Muse allows to add artribary properties on different level of an application: app, env and plugin. They are maintained in Muse registry and could be consumed by plugins. For example, we use it allow configuring variables. You can see more introducton [here](#).

At dev time, the dev server also loads the meta from Muse registry so that they can be consumed by plugins. However, sometimes you need to change the config for testing pupose as dev time only. Then we need to be able to override some meta. It's achieved by `appOverride`, `envOverride` and `pluginsOverride`:

```
"muse": {
  "devConfig": {
    "appOverride": {},
    "envOverride": {},
    "pluginsOverride": {
      "<pluginName>": {}
    }
  }
}
```

For example, you want to test a new API endpoint locally which has been defined at `env` level, then we can override it with below config:

```
"muse": {
  "devConfig": {
    "envOverride": {
      "apiEndpoint": "<new endpoint>"
    },
  }
}
```

Then the plugin can use the overriding value without changing code. Internally it performs deep merge from overriding meta to which in the Muse registry.

## Summary
Now we have learned all about the dev time config for Muse plugins, it enables you and your team to work on a large micro-frontends application smoothly. See below full picture about Muse app at dev time:

<img src={require("/img/dev-arch.png").default} width="750" />

If you understand every part in the picture, then you get everything in this topic.
