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

It will create a Muse app named `myapp` with a default `staging` environment.


:::note

You can create multiple environments for an app for development, testing, production etc, with command `muse add-env <appName> <envName>`. 

:::

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

First, we need to register a plugin in Muse registry by:
```bash
$ muse create-plugin myplugin
```

It's just meta data saved in the Muse registry, you can see it at: `<homedir>/muse-storage/muse-registry/plugins/myplugin.yaml`.

Then let’s create the Muse plugin project (based on [create-react-app](https://create-react-app.dev)) to be deployed to the app.

```bash
$ npx create-react-app myplugin
$ cd myplugin
$ npx muse-setup-cra
```

Here the `muse-setup-cra` uses craco to modify webpack config to add Muse related configurations. Note that the name should be the same with which in Muse registry. You can use below commands to see all registered plugins:
```bash
$ muse list-plugins
```

### 3. Add Muse dev config
At dev time, the plugin project needs to know the current working app/environment for two purposes. 
  - Get app level config, like which plugin to start the app, how to log in.
  - Load remote plugins, the specified plugins on the app will be loaded for local development. It can be plugin names, URLs or `*` to load all.

So, we need to add `devConfig` in `muse` section in `package.json`:

```json
{
  "name": "myplugin",
  "version": "1.0.0",
  "muse": {
    "devConfig": {
      "app": "myapp",
      "env": "staging",
      "remotePlugins": ["*"]
    }
  },
  //...
}
```

By this config, when you start local dev server it will use app `myapp` and environment `staging` as the target Muse app for local plugin development. It loads all deployed plugins from remote.

:::tip
**Where is a remote plugin loaded from?**

A Muse plugin project has a dependency `@ebay/muse-core` which reads app info from the Muse registry. So it knows what plugins are deployed and the storage paths of plugins' build bundles. Then get them and serve them by the default local path `/muse-assets`.

:::

### 4. Start the dev server
As usual, run `npm start` command to start the dev server, then you can access it at http://localhost:3000. We can see it is the same with the page when we visit http://localhost:6070 started by `muse serve app`. It's because all plugins deployed to `myapp` are also loaded to the plugin project. From the dev console we can see the loaded plugin list:

<img src={require("/img/local-plugin-list.png").default} width="400" style={{marginBottom: 20}} />



Besides deployed plugins, there is a special plugin `local:myplugin@/main.js` is also loaded. It means the current plugin's development bundle.

:::info

Remote plugins are loaded as “dev” bundles so that they can work with your local project at dev time with same shared dev modules from lib plugins. As you can see in the package.json, a Muse plugin's build always generates both `dist` and `dev` build.

```json
  "scripts": {
    "build": "muse-scripts-react build && muse-scripts-react build --dev"
    //...
  },
```

:::

### 5. Create a hello world page
Now, let's create a hello world page. For demo purpose, we will create our app based on `@ebay/muse-lib-react`, it helps to:
  - Provides shared modules like React, Redux, Router, etc.
  - Renders the root component
  - Configures Redux, React Router, etc
  - Provides extension points for routing rules reducers, layout, homepage, etc.

First, create a component `src/HelloMuse.js` with below content:

```jsx title=src/HelloMuse.js
const HelloMuse = () => <h1>Hello Muse!</h1>;
export default HelloMuse;
```

Then modify `src/route.js` to add a path `/hello-muse` to point to the `HelloMuse` component:

```jsx title=src/route.js
import HelloMuse from './HelloMuse';

const route = [
  {
    path: '/hello-muse',
    component: HelloMuse,
  },
];
export default route;

```

Now we can access http://localhost:3000/hello-muse to see below page as expected:

<img src={require("/img/hello-muse.png").default} width="600" />

Though we edited `src/route.js` to add the routing rule, it's actually imported in `src/index.js` to be the `route` property of the registered plugin object. So it's how we leverage the `route` extension point provided by `@ebay/muse-lib-react` plugin to define routing rules.


### 6. Define a menu item
To allow navigating to the `/hello-world` page, we can use the extension point `museLayout.sider.getItems` provided by `@ebay/muse-layout-antd` plugin to define a menu item:
```jsx title=src/index.js
import plugin from 'js-plugin';

//...

plugin.register({
  name: 'myplugin',
  museLayout: {
    sider: {
      getItems: () => {
        // You can alsl return an array to define multiple items.
        return {
          key: 'helloMuse',
          label: 'Hello Muse',
          // an antd icon name or use a React element
          icon: 'star',
          link: '/hello-muse',
          order: 10, // used to sort menu items
        };
      },
    },
  },
  //...
});
```

Now we refresh the page, we can see a new menu item in the sider bar:

<img src={require("/img/hello-muse-2.png").default} width="600" />

### 7. Build, release and deploy
There's difference to release a Muse plugin comparing to a normal web app deployment. Since now we are just shipping a single plugin of the whole app.

First, we need to build the plugin project, it will output to the `build` folder:
```bash
$ npm run build
```

If we inspect the `build` folder, we can see two sub folders:
  - dist: it is a production build, used for production
  - dev: it's a dev build, used for development loaded as a remote plugin.

After build, we need to release it to the Muse registry:
```bash
$ muse release myplugin 1.0.0
```

The command does two things:
  - 1. Registers a release in the Muse registry, you can see it in `<homedir>/muse-storage/plugins/releases/myplugin.yaml`.
  - 2. Uploads build assets to Muse assets storage, you can see it at `<homedir>/muse-storage/assets/p/myplugin/v1.0.0`. 
  :::info
  It uploads assets only when the command runs under a Muse plugin project and there is a `build` folder.
  :::

We can verify the release by this command:
```bash
$ muse list-releases myplugin
```

<img src={require("/img/list-releases.png").default} width="500" />

After a release is created, we can deploy it to our app `myapp`:

```bash
$ muse deploy myapp staging myplugin 1.0.0
```

It means we deploy plugin `myplugin` version `1.0.0` to the `staging` environment of `myapp`.

Remember we used `muse serve myapp` run the Muse app locally at http://localhost:6070 ? Then we can access it again:


### 8. Export the Muse app

### 10. Define a menu item
### Build plugin project
### Release plugin project v1.0.0: “muse release”
### Deploy plugin “muse deploy myapp myplugin 1.0.0”
### Refresh page
Install muse-lib-antd and muse-layout-antd
…
Create another plugin
…


