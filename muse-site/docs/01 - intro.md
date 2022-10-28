
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Introduction

Muse is a highly customizable, extensible and scalable micro-frontends solution for **single page applications**. It allows breaking down a large application into small pieces, called Muse plugins, that can be developed, tested, built and deployed independently. It has been used inside eBay for years serving hundreds of internal UI consoles.


Muse could be a small/simple tool to build a single application, but also could be a complicated system to construct enterprise web application infrastructure, depending on your requirements and how you extend the Muse system by yourself.

You don't need to read through all the topics of the documentation before creating your first real-case Muse application. Only after you read "Introduction" and "Get started", you will get 80%+ of knowlege about Muse development.

## Try the Live Demo
To have a quick glance at Muse, you can play with our live demo app: [User Manager](https://demo.musejs.org). It helps to understand Muse main concepts and learn to build an app in the Muse way.

![Demo Screenshot](/img/demo.png)

<a href="#" className="highlighted-link-btn">Visit the Demo</a>

:::tip
You can see the detailed explaination of the demo in the built-in [docs page](https://demo.musejs.org/docs).
:::

## How Does Muse Work?
The idea of Muse is mainly based on below two mechanisms:
  - **Shared Modules**: each plugin can provide shared modules for other plugins to be built on.
  - **Plugin Engine**: each plugin project's build result is a plugin to be registered to the plugin engine. All plugins work together seamlessly as a single app.

### Shared modules
Since every Muse plugin is built independently, you don’t want every build to include repeated common modules like React, Redux, UI libs, etc. So we need a mechanism to share modules among Muse projects. That is just Muse shared modules. We provided a webpack implementation in [@ebay/muse-webpack-plugin](#).

Simply say, there’s a shared modules container at runtime. A plugin can be configured as a library plugin to put shared modules into the container and other plugins then get it at either build time or run time. It’s very similar to the webpack dll plugin but shared modules can be used cross projects.

<img src={require("/img/muse-shared-modules.png").default} width="360" />

Muse lib plugins are also distributed via npm, so a Muse project installs lib plugins for dev and build. At compile time (both dev and prod), if a required module is found in some installed lib plugin, then it will be compiled as a delegated module to be loaded from Muse shared modules container at runtime.

This is automatically handled by the Muse webpack plugin, you don't need to write special code to use a shared module but just normal import like `import React from 'react';`.

:::note
For now we only provide the webpack implementation of Muse shared modules. In the future we may support more build tools.
:::

### Plugin engine
Every Muse plugin bundle registers a plugin object to the plugin engine provided by [js-plugin](https://github.com/rekit/js-plugin) when it's loaded . For example, below is a typical entry file of a plugin project:

```jsx title="src/index.js"
import jsPlugin from 'js-plugin';

jsPlugin.register({
  name: 'my-plugin',
  // ...
})
```

The [js-plugin](https://github.com/rekit/js-plugin) is a very tiny plugin engine (~150 lines of source code) highly inspired by the extension point mechanism of Eclipse. Every plugin can define extension points and every plugin can contribute to those extension points. Typically, an extension point allows to:
  - Modify some data structure (object, array)
  - Collect data
  - Add some placeholder into dom tree
  - …

<img src={require("/img/ext-points.png").default} width="480" />


For example, if you use a JSON to define routing rules with [React Router](https://reactrouter.com/en/main/hooks/use-routes), you can construct routing rules from different plugins. That means, you don’t need a central place to define all routing rules, but can allow each plugin to define their own routing rules. For example:


<Tabs>
<TabItem value="js" label="plugin-1/src/App.js">

```jsx {6,7,17,18} showLineNumbers
import { useRoutes } from "react-router-dom";
import jsPlugin from 'js-plugin';
import { flatten } from './arrayUtils';

function App() {
  // Define the extension point "plugin1.route"
  const routes = jsPlugin.invoke('plugin1.route');
  const element = useRoutes([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          path: "about",
          element: <AboutPage />,
        },
        // Use the collected routing rules from other plugins
        ...flatten(routes),
      ],
    },
    { path: "*", element: <NotFound /> },
  ]);

  return element;
}
```

</TabItem>
<TabItem value="py" label="plugin-2/src/index.js">

```js {5-8} showLineNumbers
import jsPlugin from 'js-plugin';

jsPlugin.register({
  name: 'plugin-2',
  // Contribute to the extension point "plugin1.route"
  plugin1: {
    route: [{ path: 'pluing-2/hello', element: () => <h1>Hello plugin2.</h1>}],
  },
  // ...
})
```

</TabItem>
<TabItem value="java" label="plugin-3/src/index.js">

```js {5-9} showLineNumbers
import jsPlugin from 'js-plugin';

jsPlugin.register({
  name: 'plugin-3',
  // Contribute to the extension point "plugin1.route"
  plugin1: {
    // if it's a function then the return value is consumed
    route: () => ({ path: 'pluing-3/hello', element: () => <h1>Hello plugin3.</h1>}),
  }
  // ...
})
```

</TabItem>
</Tabs>

An extension point just represents the property path in a pure JS object. The `jsPlugin.invoke` method collects all values from contributing plugins to an array. In the code sample, we declared route `/plugin-2/hello` from plugin `plugin-2` and route `plugin-3/hello` from plugin `plugin-3`.

:::tip

A plugin object can include any type of properties, e.g: components, functions, primitive values, DOM nodes, etc. Totally depends on how the consuming plugin use them.

:::

### How is a Muse app started?
Everything in Muse is plugins, there is no `main plugin` nor `hosting app` concept in a Muse app. Every plugin has equal position. You can define layout, render root component from any plugin. The only special one is boot plugin, every app should only have one boot plugin which is loaded first and it then loads other plugins to the page.

<img src={require("/img/boot-flow.png").default} width="600" />

Like a Java application may start from one of the main functions, a Muse application also starts from an entry function where you call `ReactDOM.render` to render the root component. Every Muse plugin can provide entry functions, then based on some config variable the boot logic calls the specified entry function to start the app.

## Muse App and Plugin
From the sample code above, we get understand of the app and plugin concepts in Muse:

  - **Muse App**: a Muse app mainly is a group of plugins. Also, you can provide configurations at app level to be consumed by some plugins. When load a Muse app, it means load the plugins into the page. Everything in Muse is plugins, there’s no code corresponding to a Muse app.
  - **Muse plugin**: a Muse plugin is just a normal javascript object which is registered to the plugin engine js-plugin. You can configure any kind of frontend project to build a bundle which registers a plugin object.
## Why Muse?
Muse not only provides a webpack plugin allowing to build different parts of a large app separately (micro-frontends), but also proposed a plugin based approach to organize plugins in a scalable way. At the same time, Muse provides tools and SDKs to support the full lifecycle of a web app: dev, build, test and deploy.

### Micro-frontends
There have been many micro-frontends frameworks. Muse is a new one but also an old one, since it's already been used for 4+ years. Unlike some of others, one Muse app only allows to use one core tech stack for all plugins deployed on it, like React + Redux + Material UI. Except that, Muse has all adavantages of a micro-frontends solution like:

  - Allow different dev time technologies for different plugins, eg: javascript or typescript, less or sass or css modules, etc..
  - Scalable: easy to add or remove a feature.
  - Maintainable: when a project is small, it's always easy to understand and maintain, even you name variables with a, b, c.
  - Better team work: different teams can work on different features easily.
  - ...

### Plugin based architecture
Muse uses a very flexible plugin engine, all plugins can work together seamlessly just like you are still working on a monolith app. It's super easy to add and use an extension point with just several lines of code. So whenever you need some plugin to provide extensibility (like need to add a new button somewhere), the plugin owner can always add the ext point on demand.

### Great dev experience
Micro-frontends brings some challenges for then development. For example, when you added an extension point in one plugin, then how to use it in another plugin before publish? Muse cares dev experience very much. It provides all flexibility for dev, debug and build. For example:
  - Allows to load remote plugins when you develop a local plugin
  - Allows to compile multiple plugins’ source code together in one webpack dev server. So you feel like you are working on a single project.
  - Every plugin release has a dev build bundle, so all dev time mechanisms like React props validation, redux-logger are kept for all plugins at dev time even some are loaded remotely.

By this approach, there is no difference between developing Muse plugins and a normal frontend project.

### Fast compilation
Many tools were invented to improve the compile performance. But in Muse’s philosophy, a huge project is the root cause of the slow build time. A super fast tool will be finally slow someday if you never control the size of your project. Muse can significantly reduce the compile time because:
  - Shared modules don’t need to be compiled again. After you create some library plugins, other plugins never need to re-compile modules from those plugins again.
  - Remote plugins have dev build bundle too, they can be loaded in dev server.
  - Muse plugins are usually very small (several KBs after gzip). It’s always fast to compile for both dev and build time.

### High performance for loading
A Muse app is able to be loaded very fast because:
  - Muse manages releases by semantic versions. Every version is immutable, so we can permanently cache a plugin bundle in the browser side. Muse provides the service worker to cache the plugin bundle by default, it also auto cleans old versions from the cache.
  - Whenever you update a plugin, only the new version needs to be loaded again.
  - Plugins are loaded in parallel. It's much faster than loading a single big bundle. Especially if http2 is used.

:::tip

Visit https://demo.musejs.org to see how fast it is!

:::

:::note

For first time loading, a Muse app just has the same behavior as a normal web app.

:::

### Easy to move in or move out
With Muse you write code in the normal way you get used to. You can convert your plugin project to a normal project with just mainly configuration changes.

## Summary
Muse is a simple system that only consists of two core mechanisms of shared modules and plugin engine. It's crucial to fully understand how they work together. Then you can easily understand other advanced features of Muse for both development and production phase. We will introduce them in other parts of the document.

Though all examples in the documentation is React based, Muse could be used with any UI frameworks. It's totally technology agnostic.