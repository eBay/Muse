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
You can call `showMessage` multiple times then all messages will be showed in a list.
:::

### getAppVariable
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

### getAppVariables
Similar with `getAppVariable`, the `getAppVariables` API gets all variables as an key-value object. Also they are maybe different on different environments.

### getPluginVariable
Every Muse plugin may have some variables when deployed on a Muse app., divided by default value and environment related value. The default value is configured in `app


### getPluginVariables
### getPublicPath
### getUser
### initEntries
### loading
### msgEngine
### waitFor
### \__shared__



When open a Muse app, the server responds the current configuration of the app in window.MUSE_CONFIG variable, then muse-boot uses the config to bootstrap the application. It also means you can write your own boot plugin by the information in `MUSE_CONFIG`.

## Summary
For any boot plugin , it must implement the APIs mentioned above. So that all plugins are able to be loaded by any boot plugin.