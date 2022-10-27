# Get Started

This is a 20 minutes tutorial to go through the Muse development and deployment process. It helps you to understand core concepts of Muse. Although we use React to go through the tutorial, after you understand how everything works in React, you can also use other UI frameworks with Muse.

## Installation
Muse provides command line tools to manage Muse applications and plugins.

### 1. Install Muse command line tools
```bash
$ npm install -g muse-cli
```
Then you have `muse` command to manage all apps and plugins. You can run `muse -h` to see all the available commands.

### 2. Initialization
To start using Muse, you usually start with some reuseful Muse plugins. You can run below command to install some assets from Muse team:
```bash
$ muse init
```

:::tip

You can always use `muse <cmd> -h` to get usage of a Muse command. For example:

:::

<img src={require("/img/muse-cli-help.png").default} width="520" />

It will install below plugins to the local machine:
  - @ebay/muse-boot-default
  - @ebay/muse-lib-react
  - @ebay/muse-lib-antd
  - @ebay/muse-layout-antd
  - @ebay/muse-manager

Also it installs the Muse manager as a Muse app:
  - Create app `musemanager` and `staging` environment.
  - Deploy necessary plugins to `musemanager`.

All the apps, plugins are installed under the folder `<homedir>/muse-storage`. There are mainly two sub folders:
  - **muse-assets**: persists plugin's release assets.
  - **muse-registry**: persist Muse app and plugins meta.

Feel free to look at the structure of the `muse-storage` folder.

:::note

If you are familiar with Muse system enough, this initialization step is optional.

:::

### 3. Try the Muse manager
To start the Muse manager, run below command:
```bash
$ muse manager
```
Then you can access it at http://localhost:6060 . With which you can manage Muse apps and plugins in an intuitive way.

Muse manager is also a normal Muse application. You can see it in the app list from Muse manager. While there’s any update of Muse manager, you just need to upgrade the plugin `@ebay/muse-manager` on the app.

## Your first Muse app
Now let's create a Muse application with some existing plugins. All the steps could be done either via Muse CLI or Muse manager UI console. For better understanding how Muse works, we will use the CLI for the demo.


### 1. Create a Muse app
```bash
$ muse create-app myapp
```
Then run below command to start the application:

```bash
$ muse serve myapp
```

Then you can access the app by http://localhost:6070 . It will show an error “No boot plugin.” on the page since we’ve not deployed any plugin to it.

<img src={require("/img/no-boot.png").default} width="500" />


Then let’s deploy some existing plugins to our app, in the installation step, when we run `muse init` they are already installed to our local Muse registry. So we just need to deploy them:

```bash
$ muse deploy myapp staging @ebay/muse-boot-default @ebay/muse-lib-react @ebay/muse-lib-antd @ebay/muse-layout-antd
```

This command deploys the 4 plugins to the staging environment of myapp. Then we refresh the page again, we can see the default layout and welcome page.

<img src={require("/img/muse-welcome.png").default} width="700" />

:::note
It’s not mandatory to use these plugins but just for demo purposes. You can create your own layout, use your own UI library, etc instead.
:::

### 2. Create a Muse plugin

Next let’s create a Muse plugin (based on [create-react-app](https://create-react-app.dev)) to be deployed to the app.

```bash
$ npx create-react-app myplugin
$ cd myplugin
$ npx muse-setup-cra
```

This creates a create-react-app based Muse plugin project. The `muse-setup-cra` uses craco to modify webpack config to add Muse related configurations.

### 3. Add Muse dev config
At dev time, every plugin needs to know the current working app so that it could gets app config or remote deployed plugins for development. So, add below config in package.json:
muse: { devConfig: { app: ‘myapp”, env: ‘staging’, remotePlugins: ‘*’}}


### 4. Install muse-lib-antd
Since we use ant.design as the UI library, it’s already included in Muse library plugin muse-lib-antd, so we need to install it in the project so that we can use shared modules from it at dev time and build time.

### 5. Start plugin dev server
Run “npm start” to start the muse dev server. We can see that it loads all plugins deployed on “myapp” including lib-antd, layout-antd, etc. Together with your local project as a plugin.
NOTE: all remote plugins are loaded with “dev” bundle so that it can work with your local project at dev time with same shared modules from lib plugins’ dev bundles.

### 6. Define a new route
### 10. Define a menu item
### Build plugin project
### Release plugin project v1.0.0: “muse release”
### Deploy plugin “muse deploy myapp myplugin 1.0.0”
### Refresh page
Install muse-lib-antd and muse-layout-antd
…
Create another plugin
…


