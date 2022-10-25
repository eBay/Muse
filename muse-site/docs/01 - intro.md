
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Introduction

Muse is a highly customizable, extensible and scalable micro-frontends solution for **single page applications**. It allows breaking down a large application into small pieces, called Muse plugins, that can be developed, tested, built and deployed independently. It has been used inside eBay for years serving hundreds of internal UI consoles.


Muse could be a small/simple tool to build a single application, but also could be a complicated system to construct enterprise web application infrastructure, depending on your requirements and how you extend the Muse system by yourself.


## See the Live Demo
To have a quick glance at Muse, you can play with our live demo app: [User Manager](https://demo.musejs.org). It helps to understand core Muse concepts and learn to build an app in the Muse way.


![Demo Screenshot](/img/demo.png)

[See the demo here 👉🏻👉👉🏾](#)

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

Muse lib plugins are also distributed via npm, so a Muse project installs lib plugins for dev and build. At compile time (both dev and prod), if a required module is found in some installed lib plugin, then it will be compiled as a delegated module to be loaded from Muse shared modules container at runtime. This is automatically handled by the Muse webpack plugin, you don't need to write special code to use a shared module but just normal import like `import React from 'react';`.

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
    route: [{ path: 'pluing-2/hello', element: () => <h1>Hello plugin2.</h2>}],
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
    route: () => ({ path: 'pluing-3/hello', element: () => <h1>Hello plugin3.</h2>}),
  }
  // ...
})
```

</TabItem>
</Tabs>

An extension point just represents the property path in a pure js project. The `jsPlugin.invoke` method collects all values from contributing plugins to an array. In the code sample, we declared route `/plugin-2/hello` from plugin `plugin-2` and route `plugin-3/hello` from plugin `plugin-3`.

:::tip

A plugin object can include any type of properties, e.g: components, functions, primitive values, DOM nodes, etc. Totally depends on how the consuming plugin use them.

:::


### How is a Muse app started?
Everything in Muse is plugins, there is no `main plugin`, `hosting app` concept in a Muse app. Every plugin has equal position. You can define layout, render root component from any plugin. The only special one is boot plugin, every app should only have one boot plugin which is loaded first and it then loads other plugins to the page.

<img src={require("/img/boot-flow.png").default} width="600" />

Like a Java application may start from one of the main functions, a Muse application also starts from an entry function where you call `ReactDOM.render` to render the root component. Every Muse plugin can provide entry functions, then based on some config variable the boot logic calls the specified entry function to start the app.



## Why Muse?
Muse has been used inside eBay for years and is serving hundreds of internal UI consoles. It has been approved to be stable and scalable. The idea of Muse was generated based on our experiences on building large web applications. Below is the list of advantages Muse brings to us.

### Reduced complexity
First, what is complexity? Instead of defining complexity by how easy to add a new feature, we think it should be how easy to remove an existing feature. In Muse, every feature could be an independent plugin. At the same time, all features/plugins of an application can work together seamlessly, which means it’s just like you write all code in a single project. In Muse, every feature could be a plugin which could be easily added, removed or moved from one app to another. By this approach, your applications will always keep simple to be understood and maintained.

### Great dev experience
There is no difference between developing a Muse plugin and a normal frontend project. With micro frontends, you usually work on multiple projects at the same time, it’s then a challenge to debug between projects. For example, you added an extension point in one plugin,then want to use it in another plugin. Muse provides very convenient mechanisms for you working on multiple projects at the same time:
Allows to load remote plugins when you develop a local plugin
Allows to compile multiple plugins’ source code together in one webpack dev server. So you feel like you are working on a single project.
Every plugin could have a dev build bundle, so all dev time mechanisms like React props validation, redux-logger are kept for all plugins at dev time even some are loaded remotely.
Fast compilation
Many tools like esbuild, rollup, vite, etc were invented to improve the build performance. But in Muse’s philosophy, a huge project is the root cause of the slow build time, not due to a tool. Muse can significantly reduce the build time because:
Muse plugins are usually very small (several KBs after gzip). It’s super fast to compile for both dev and build time.
Shared modules don’t need to be compiled again. After you create some library plugins, other plugins never need to re-compile modules from those plugins again.

### “Good” code and “bad” code works together well

There are always senior and junior members in a team. Even you and yourself six months ago, are different members. They write different levels/styles of code, which looks “good” or “bad” by different people, even the same people at different times. The collaboration of constructing an understandable large project is difficult. But when a project is small enough, everything is not a problem, even if you name variables with a, b, c. In Muse, different people own different features, they choose different patterns, tools and styles they are used to. Muse allows every feature to be a small project.

### High load performance
Muse manages releases by versions. Every version is immutable, it means we can permanently cache a plugin bundle in the browser side. Muse provides the service worker to cache the plugin bundle by default. Another benefit is, when a new plugin version is deployed, only the new version needs to be loaded again.
