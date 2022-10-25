# How Does Muse Work?

We usually create a large web application in a single project. Now Muse can divide it into multiple projects without adding any limitation, nor changing the way you develop your application. Muse achieves this mainly based on two core mechanisms:
Plugin Engine


## Plugin Engine
Every Muse project is built to a Muse plugin which mainly registers a plugin object to the plugin engine provided js-plugin which is a very tiny package (~150 lines of source code).

The js-plugin is highly inspired by the extension point mechanism of Eclipse. Every plugin can define extension points and every plugin can contribute to those extension points. Typically, an extension point allows to:
Modify some data structure (object, array)
Collect data
Add some placeholder into dom tree
…

For example, you use a JSON structure to render React Router jsx tags, then you can collect all routing rules from all plugins before rendering the router.  That means, you don’t need a central place to define all routing rules, but can allow each plugin to define their own routing rules.

## Shared Modules
Since every Muse project is built independently, you don’t want every build to include repeated common modules like React, UI libs, etc. So we need a mechanism to share modules among Muse projects. That is just Muse shared modules. We provided a webpack implementation in @ebay/muse-webpack-plugin.

Simply say, there’s a shared modules container at runtime. A plugin can be configured (a library plugin) to put some shared modules into the container and other plugins then get it at runtime. It’s very similar to the webpack dll plugin.

Muse lib plugins are also distributed via npm, so a Muse project installs lib plugins for dev and build. At compile time (both dev and prod), if a required module is found in some installed lib plugin, then it will be compiled as a delegated module to be loaded from Muse shared modules container at runtime.

## Render the Root Component
Everything in Muse is plugins, then where to render the root component? Like a Java application may start from one of the main functions, a Muse application also starts from an entry function where you call ReactDOM.render to render the root component. Every Muse plugin can provide entry functions, then based on some app level config the boot logic calls the specified entry function to start the app. 
