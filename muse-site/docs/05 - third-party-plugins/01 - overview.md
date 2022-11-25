# Overview

Muse is not only a micro-frontends solution, but also an ecosystem that users can share their reuseable plugins to others. A plugin can be an opininate frontend techstack like React + Redux + React Router, a feature like layout, dashboard, or service integration like oauth, analytics, etc.

Compared to npm system, Muse plugins are usually larger and can be used directly without any code change. For example, if you deploy a google analytics Muse plugin to your app, then you have the analytics feature immediately.

## Share a Muse plugin
Everyone can share Muse plugins to others by publishing them to the npm registry. It's the same process as publish normal npm packages. Then others can install these Muse plugins to their own Muse registry.

When publishing a Muse plugin, ensure you've already built the plugin project. Then you can run `npm publish` to publish it. For all types of Muse plugins, must include files must include the `build` folder. For `lib` plugin, it needs `src` folder included as well. So if you specify `files` property in `package.json`, for example:

```js {7-10} showLineNumbers
{
  "name": "@ebay/muse-dashboard",
  "version": "1.0.0",
  "muse": {
    "type": "normal"
  },
  "files": [
    "build",
    "src",   // only necessary for lib plugins
  ],
  // ...
}
```

:::note
- Only when need to share Muse plugins between different Muse registries you need to publish Muse plugins to npm registry.
- `lib` plugins should be always to be published to npm registry (or a place can be installed as dependencies) because it provides shared modules at dev time.
:::

## Install a third party plugin
The concept of is installing a Muse plugin means syncing a plugin from npm registry to your own Muse registry(for metadata) and assets storage(for resources):

<img src={require("/img/muse-install.png").default} width="700" />

Since you can only deploy a plugin from your Muse registry, so the plugin meta must have existed. To use a thrid party plugin, you need to install it first by below command:

```bash
$ muse install some-plugin [version]
```

It actually do things behind:

- Download the plugin tarball from npm registry, get Muse meta (plugin name, type) from `package.json`
- Check if the plugin already exists, if not, register a plugin entry in the registry.
- Check if version (default to latest) exists, if not, create a release entry in the registry.
- If not installed, extract `build` folder and upload it to the Muse assets storage with correct path, e.g: `/p/some-plugin/v1.0.2`.

## Existing thrid party plugins
For now, we've provided some reuseful plugins, which are widely used by hundreds of applications inside eBay. You can either build your application based on them, or create your Muse app scrach. Below is the list:
- @ebay/muse-boot-default: this is the boot plugin, every Muse app must have a boot plugin to load other plugins and start the application. Normally you don't need to create your own boot plugin.
- @ebay/muse-lib-react: it provides a opininate stack for React, together with Redux, React Router, lodash, axios as common libraries.
- @ebay/muse-lib-antd: include [antd](https://ant.design) as the UI library for shared modules. Also including some components we provide.
- @ebay/muse-layout-antd: a layout plugin provides custmizable header and sider.
- @ebay/muse-dashboard: a dashboard plugin allows other plugins to contribute widgets.

In other topics of this category, we will introduce them one by one, mainly about the APIs and extension points they provide. So, if you build apps on these plugins you can read them. Otherwise you can choose to write your common plugins from scrach with your own prefered approaches.

