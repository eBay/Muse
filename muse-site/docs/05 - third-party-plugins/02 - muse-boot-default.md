# @ebay/muse-boot-default


Muse boot is a special plugin that is used to bootstrap a Muse application in the browser side, it mainly does below things:

- Provide a shared modules container.
- Register service worker to cache plugin resources (if not disabled).
- Load other plugins
- Execute initialization logic from plugins
- Define some global methods on `window.MUSE_GLOBAL`.
- Find and execute app entry to start the app.

As introduced in [plugin types](../03%20-%20understanding-muse/01%20-%20plugin-types.md) topic, the default loading flow is actually all implemented by the `@ebay/muse-boot-default` plugin:

<img src={require("/img/loading-flow-2.png").default} width="640" />


## MUSE_GLOBAL APIs
As the first loaded plugin, `muse-boot` defines common APIs on `MUSE_GLOBAL`. They are mainly about the Muse architecture.

### appEntries
An app entry is used to start the whole application. Muse boot plugin collects all entry functions then find one to render the app based on the app config. You can registery them by pushing to `MUSE_GLOBAL.appEntries` array. For example, in `@ebay/muse-lib-react` plugin, it registers the app entry like below:

```jsx title="src/index.js" {20-23} showLineNumbers
import { createRoot } from 'react-dom/client';
import Root from './Root';
import plugin from 'js-plugin';

const renderApp = () => {
  let rootNode = document.getElementById('muse-react-root');
  if (!rootNode) {
    rootNode = document.createElement('div');
    rootNode.id = 'muse-react-root';
    document.body.appendChild(rootNode);
  }
  rootNode.innerHTML = '';
  const root = createRoot(rootNode);
  // Plugin can do some initialization before app render.
  plugin.invoke('onReady');
  window.__js_plugin = plugin; // Mainly for debugging
  root.render(<Root />);
};

window.MUSE_GLOBAL.appEntries.push({
  name: '@ebay/muse-lib-react',
  func: renderApp,
});
```

Usually we register an app entry with the name same with the plugin name, although technically it allows to register multiple app entries from one plugin. Then we can specify which entry to start the app by the config. The boot plugin consumes the config `entry` from the app meta. For example:

```yaml title="<muse-storage>/registry/apps/myapp.yaml" {2} showLineNumbers 
name: myapp
entry: @ebay/muse-lib-react
envs:
  staging:
    name: staging
```

If the `entry` option is not specified, and if only one app entry registered, then it will be used to render the app. Otherwise throw an error.

If the `entry` option is specified, the boot logic will find the app entry and use it to render the app. For example, if the specified entry not found like below:

```yaml title="<muse-storage>/registry/apps/myapp.yaml" {2} showLineNumbers 
name: myapp
entry: wrong-entry
envs:
  staging:
    name: staging

```

Then there will be an error as below:

<img src={require("/img/no-app-entry-error.png").default} width="540" />

### error.showMessage
Show an error message during the loading phase. It should only be called before the app starts. For example:

```js title="<some-init-plugin>/src/index.js" {5}
window.MUSE_GLOBAL.initEntries.push({
  name: 'some-init-plugin',
  func: () => {
    if (isIEBrower()) {
      window.MUSE_GLOBAL.error.showMessage('IE Browser is not supported.');
      return false;
    }
  }
});
```

The code registers an init entry that checks if the current browser is IE, if it is show the error message that the browser is not supported.

:::note
You can also throw an error by `throw new Error('IE browser is not supported.');` to show an error message.
:::

:::tip
You can call `error.showMessage` multiple times then all messages will be showed in a list.
:::

### getAppVariable(name)
Every Muse app may have some configuration variables to be consumed by some plugins. It's defined in the app yaml file. For example:
```yaml title="<muse-storage>/registry/apps/myapp.yaml"
name: myapp
variables:
  sso: true
  theme: dark
```

Then you can use `getAppVariable` to get them by name:

```js
const theme = window.MUSE_GLOBAL.getVariable('theme');
```

The same app variable can be different on diffrent environments. They are overrided by `env.variables` section, for example:
```yaml {6,11} title="<muse-storage>/registry/apps/myapp.yaml"
name: myapp
envs:
  staging:
    name: staging
    variables:
      theme: light
  production:
    name: production
variables:
  sso: true
  theme: dark
```

Then the `getAppVariable('theme')` returns `light` on `staging` environment, returns `dark` on other environments.

That is, you can override default app variables configured on app level by re-define them on environment level.

:::tip
At local development, you can configure `muse.appOverride.variables` in `package.json` to provide variables for local development. They will override the configuration from app yaml.
:::

### getAppVariables()
Similar with `getAppVariable`, the `getAppVariables` API gets all variables as an key-value object. Also they are maybe different on different environments.

### getPluginVariable(pluginName, varName)
Similar with app variables, you can define variables at plugin level at two levels: app level and env level, the later has hight priority. They are all maintained in app yaml too with property `pluginVariables`. For example:

```yaml {5-7,10-15} title="<muse-storage>/registry/apps/myapp.yaml"
name: myapp
envs:
  staging:
    name: staging
    pluginVariables:
      @ebay/muse-dashboard:
        apiEndpoint: https://api.qa.example.com/v1
  production:
    name: production
pluginVariables:
  @ebay/muse-dashboard:
    apiEndpoint: https://api.example.com/v1
    dashboards:
      - /homepage
      - /insights
```

Then you can use below API to get the variable:

```js
const apiEndpoint = MUSE_GLOBAL.getPluginVariable('@ebay/muse-dashboard', 'apiEndpoint');
```

Then the apiEndpoint on the staging env returns `https://api.qa.example.com/v1`, for production returns `https://api.example.com/v1`.

### getPluginVariables(pluginName)
Similar with `getPluginVariable`, the `getPluginVariables` API gets all variables as an key-value object. Also they can be different on different environments. For example, with above app yaml, we can get all variables by:
```js
MUSE_GLOBAL.getPluginVariables('@ebay/muse-dashboard');
// => 
// {
//   apiEndpoint: 'https://api.example.com/v1',
//   dashboards: ['/homepage', '/insights'],
// }
```

### getPublicPath(pluginName, resPath)
In Muse each plugin has different public path. Sometimes you want a link to your public resource. Then you can use the API to get the path at runtime. For example, you have an asset in `public` folder named `sample.pdf`. Then you can use below code to get the link:

```js
const pdfLink = MUSE_GLOBAL.getPublicPath('my-plugin', 'sample.pdf');
```

Then you will get the link like `https://static.museapp.com/muse-assets/p/my-plugin/v1.9.2/sample.pdf`.

### getUser
Muse boot defines a unified approach to get user information. So that different plugins can use same way to get the current logged-in user info. The boot plugin itself only provides a placeholder for the API, by default it only returns null. But you can rewrite the API in some `init` plugin which does authentication logic. For example:

```js
MUSE_GLOBAL.getUser = () => {
  return { username: 'nate' };
}
```

The only mandatory property is `username`. But you can add any properties like `firstName`, `lastName`, etc to the user info object to be consumed by your own plugins. Then in all places we can use same `getUser` API to get the user info.

### login, logout
While provide `getUser` API, you plugin usually should also implement `MUSE_GLOBAL.login` and `MUSE_GLOBAL.logout` method for login and logout. For example, you may add below code in your plugin:

```js
MUSE_GLOBAL.login = () => {
  window.location = 'https://auth.myapp.com/login';
};

MUSE_GLOBAL.logout = () => {
  window.location = 'https://auth.myapp.com/logout';
}
```

### initEntries
If you want async init logic in your `init` plugins, then you need to registery `initEntries` to `MUSE_GLOBAL`, for example:

```js
MUSE_GLOBAL.initEntries.push({
  func: async () => {
    return await checkAuth();
  },
});
```

You can push multiple objects (with func method) to the `initEntries` array. They will be executed in parallel. The bootstrap flow will be terminated if any function returns false or throws an error.

### loading.showMessage
Similar with `error.showMessage` API, this API allows to show a loading message under the loading icon. You should only use this API in `init` plugins. For example:

```js
if (!isSessionValid()) {
  MUSE_GLOBAL.loading.showMessage(`Redirecting to the login page...`);
  window.location = loginUrl;
}
```
Then you can see the loading page like below:

<img src={require("/img/boot-loading-redirect.png").default} width="260" />


### msgEngine
TODO: maybe in a different seciton.

### waitFor
For `init` plugins we can use `initEntries` to do async logic during bootstrap. Similarly, `watiFor` is used for `lib` and `normal` plugins for async logic. It's useful if you need to perform some API requests to get initialization data before starting the app. For example:

```js
// registers an async function: it is executed after all lib and normal plugins loaded
MUSE_GLOBAL.waitFor(async () => {
  await fetchAppInitData();
});

// or registers a promise: the code is executed immediately

MUSE_GLOBAL.waitFor(fetchAppInitData())
```

### \__shared__
If you implement your own boot plugin, you must attach `__shared__` property to the `MUSE_GLOBAL`. All `lib` and `normal` plugins relies on this API to manage shared modules. Normally you don't need to implement it but use the `@ebay/muse-modules` package:

```js
import museModules from '@ebay/muse-modules';

MUSE_GLOBAL.__shared__ = {
  modules: {},
  register: museModules.register,
  require: museModules.require,
  parseMuseId: museModules.parseMuseId,
};
```

## Summary
The default Muse boot plugin defines the standard bootstrap logic of a Muse app.