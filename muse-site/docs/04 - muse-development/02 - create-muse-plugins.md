# Creating Muse Plugins

In the [get-started](../02%20-%20get-started.md) topic we've already seen how to create a Muse app and plugin. Now we will learn more detail about how to create and develop different types of plugins.

In Muse, creating a plugin means two things:
- Creating a plugin project. For example use [create-react-app](https://create-react-app.dev) to create a React project, and then configure it to make build result a Muse plugin.
- Register the plugin entry in [Muse registry](../03%20-%20understanding-muse/02%20-%20muse-registry-and-assets.md).

These two steps are totally seperated. We don't re-invent modern boilerplates, but take use of existing ones, so you first need to create a plugin project with your preferred template. Though current we only support auto config for CRA, you can read the guide [here](#todo-link) to learn how to configure any project.


## Creating a init plugin
Technically a `init` plugin is also normal javascript code same with `boot` plugin. It's used to do some custom initialization before starting the app. For example, check authentication, setup google analytics, etc. You can put all initialization logic in one `init` plugin or multiple ones.

Muse provides a simple template for creating an `init` plugin:

```bash
$ npx create-muse-plugin -t init my-init-plugin
```

It's a very simple project with below webpack config:

```js title="webpack.config.js"
const path = require('path');
const setupMuseDevServer = require('@ebay/muse-dev-utils/lib/setupMuseDevServer');

module.exports = {
  mode: process.env.NODE_ENV || 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build/dist'),
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  devServer: {
    allowedHosts: ['.ebay.com'],
    setupMiddlewares: setupMuseDevServer,
  },
};

```

The Muse protocol here is it must have `dist/main.js` as the build result. Any content in `init` plugin is ok since it's just executed directly. However, if you want to execute some logic after all `init` plugins are loaded, you can register an entry in `src/index.js` by below code:

```js title="src/index.js"
// ...
window.MUSE_GLOBAL.initEntries.push({
  func: async () => {
    return await start();
  },
});
// ...
```

Then the `func` will be called after all `init` plugins are loaded. This is useful for async logic, if you want the bootstrap logic to wait for some async logic, then need to use it. For example, a typical case authentication logic: check if an user is not logged in, you may redirect the page to some auth provider page (eg. SSO).

There is a magic return value `false` for the init entry: if any init entry returns `false`, the bootstrap flow will be stopped. Usually you use this to redirect the page to another URL, so that while redirecting other plugins are not loaded.

Another way to break the bootstrap flow is throwing an exception, the error message will also be shown. It's used if some unexpected errors happen.

Below are some scenarios you may want to use an `init` plugin:
- Authentication, after login success, rewrite `MUSE_GLOBAL.getUser` API.
- Load a third party js, for example, you may write logic to create a `script` tag and set `src` to a remote javascript file like google analytics.
- Provide more global APIs to `MUSE_GLOBAL`.
- Modify `lib` or `normal` plugins list. For example, handle `allowlist` to exclude some plugins to be loaded.
- Precheck system compatibility, for example browser type, version, etc.
- Others you can imagine...

In `init` plugins, you can use below `MUSE_GLOBAL` APIs to show feedbacks on the loading page:
- **window.MUSE_GLOBAL.loading.showMessage(msg)**: show a message under the loading icon. For example: `Redirecting to the log in page...`.
- **window.MUSE_GLOBAL.error.showMessage**: show an error message to the loading page. Note you should manually return `false` in the entry when error happens.

:::note
You normally shouldn't depend on any heavy packages in an `init` plugin project. They should not render any UI, no UI framework, no plugin engine interaction. Just do some initialization logic.
:::

## Creating a lib plugin

## Creating a normal plugin

## Creating a boot plugin
You normally never need to create a `boot` plugin since we've already provided [@ebay/muse-boot-default](https://github.corp.ebay.com/muse/muse-next/tree/main/ui-plugins/muse-boot-default) plugin which covers all features like:

- Load other plugins
- Show a customizable loading page
- Show error message if failed to start
- Cache assets with service worker
- Handle app/plugin variables
- Start the app
- ...

You can learn how it works by reading the source code [here](https://github.corp.ebay.com/muse/muse-next/tree/main/ui-plugins/muse-boot-default). It's very small (and should be small) so we think it's easier for you to understand what's necessary in a `boot` plugin than giving a long guide.

Simplely say, a `boot` plugin is a pure js bundle first loaded on the page. The Muse app web server reads the plugin list of an app, finds the `boot` plugin, then uses a `script` tag to load it. For example:

```js
<script src="/muse/muse-demo-app/muse-assets/p/@ebay.muse-boot-default/v1.0.32/dist/boot.js"></script>
```

If you want your boot plugin works with all existing plugins which assumes to be loaded by `@ebay/muse-boot-default` you need to implement below APIs attached to `MUSE_GLOBAL` by `@ebay/muse-boot-default`:

- getAppVariables
- getPluginVariables
- initEntries
- pluginEntries
- appEntries
- cdn
- getUser
- waitFor
- loading
- error
- ...

Also it needs to use `@ebay/muse-modules` package to register a shared modules container at `window.MUSE_GLOBAL.__shared__`.

## Summary
All Muse plugins are normal frontend projects, there's no additional learning effort except keeping `js-plugin` in mind for `normal` and `lib` plugin. We divide the javascript logic into `boot`, `init` and `normal` types of plugins by their lifecycles and purposes. All of the main business logic should go to `normal` plugins. 