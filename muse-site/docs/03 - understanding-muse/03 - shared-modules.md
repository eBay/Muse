# Shared Modules

Muse's shared modules mechanism allows a plugin to be built on some common shared modules which provided by some lib plugins. Usually you don't need to specify which modules should be shared but all modules used in lib plugins are shared by default.

This is achieved by [Muse webpack plugin](https://github.com/ebay/muse/tree/main/workspace/packages/muse-webpack-plugin), which is heavily inspired by [webpack DLL plugin](https://webpack.js.org/plugins/dll-plugin/).

Unlike many micro-frontends solutions, different parts of a Muse app share the same tech stack.

Every Muse plugin is built independently, obviously you don’t want every build to include repeated common modules like React, Redux, UI libs, etc. So we need a mechanism to share modules among Muse plugins. That is just Muse shared modules. We provided a webpack implementation in [@ebay/muse-webpack-plugin](#).

Simply say, there’s a shared modules container at runtime. A plugin can be configured as a library plugin to put shared modules into the container and other plugins then get it at either build time or run time. It’s very similar to the webpack dll plugin but shared modules can be used cross projects.

<img src={require("/img/muse-shared-modules.png").default} width="400" />

Muse lib plugins are also distributed via npm, so a Muse project installs lib plugins for dev and build. At compile time (both dev and prod), if a required module is found in some installed lib plugin, then it will be compiled as a delegated module to be loaded from Muse shared modules container at runtime.

This is automatically handled by the Muse webpack plugin, you don't need to write special code to use a shared module but just normal import like `import React from 'react';`.

:::note
For now we only provide the webpack implementation of Muse shared modules. In the future we may support more build tools.
:::

