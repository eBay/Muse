# Creating Muse Plugins

In the [get-started](../02%20-%20get-started.md) topic we've already seen how to create a Muse app and plugin. Now we will learn more detail about how to create and develop different types of plugins.




## Creating a init plugin

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
- ...

Also it needs to use `@ebay/muse-modules` package to register a shared modules container at `window.MUSE_GLOBAL.__shared__`.

## Summary
All Muse plugins are normal frontend projects, there's no additional learning effort except keeping `js-plugin` in mind for `normal` and `lib` plugin. We divide the javascript logic into `boot`, `init` and `normal` types of plugins by their lifecycles and purposes. All of the main business logic should go to `normal` plugins. 