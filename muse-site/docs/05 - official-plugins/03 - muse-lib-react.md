# @ebay/muse-lib-react

Every Muse app usually has a logically "main" plugin that is the common base of other plugins. It usually defines the tech stack choice, root rendering logic, global config of the whole application. For example, `@ebay/muse-lib-react` is our opinionate approach to develop a React application, it includes below parts:

- Use React + Redux + React Router as the base tech stack.
- Renders the root component with Redux, Router and [Nice Modal](https://github.com/eBay/nice-modal-react) providers.
- Allows to extend reducers, routing rules.
- Allows to customize main layout, homepage.
- As a lib plugin, all modules used are shared.

## App entry

The plugin provides the app entry to start the whole application:

```jsx
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

MUSE_GLOBAL.appEntries.push({
  name: '@ebay/muse-lib-react',
  func: renderApp,
});
```

## Extension points

The plugin allows to extend and customize the app by extension points.

### route

Muse provides a meta based API to render React Router. So that you can define routing rules from other plugins. The schema of a routing config is like below:

```ts
interface RouteConfig {
  path: string;
  component: ReactComponent;
  render: function;
  exact: boolean;
  isIndex: boolean;
  id: string?;
  parent: string?;
  childRoutes: RouteConfig[];
}
```

For example:

```js
const route = {
  path: '/main',
  component: MainLayout,
  childRoutes: [
    {
      path: 'foo',
      component: Foo,
      id: 'fooRule',
      childRoutes: [
        {
          path: 'bar',
          component: Bar,
        },
      ],
    },
    { path: '/abs-route', component: Comp1 },
    { path: 'foo-child', parent: 'fooRule', component: Comp2 },
  ],
};
```

For any other plugin used with `@ebay/muse-lib-react`, they can use the extension point `route` to provide routing rules:

```ts
jsPlugin.register({
  // ...
  route: RouteConfig | RouteConfig[],
})
```

Then all routes config are collected and normalized before consumed by the routing logic. The normalized logic mainly includes:

- Flatten routing rules, for example: `[rule1, [rule2]]` => `[rule1, rule2]`.
- Handle `id` and `parent` property: move all routing rules with `parent` property to the `childRoutes` of the rule with same `id` value.
- Move all absolute path to the top level (for rules with absolute paths, `parent` rule has no effect).

For example, the above route config will be normalized as below:

```js
const route = [
  {
    path: '/main',
    component: MainLayout,
    childRoutes: [
      {
        path: 'foo',
        component: Foo,
        id: 'fooRule',
        childRoutes: [
          {
            path: 'bar',
            component: Bar,
          },
          { path: 'foo-child', parent: 'fooRule', component: Comp2 },
        ],
      },
    ],
  },
  { path: '/abs-route', component: Comp1 },
];
```

With the normalized routing rules, the rendering logic consumes nested `childRoutes` property and concat paths to form the final routing path. With this approach, it allows to define routing rules in different plugins. Every plugin owns its own routing rules but not a central place to maintain all routes.

:::note
For a component that allows `childRoutes`, it must be able to render its children under a container node. For example:

```jsx
const MyLayout = ({ children }) => {
  return (
    <div>
      <Header />
      <Sider />
      <div className="main-content">{children}</div>
    </div>
  );
};
```

Otherwise, the `childRoutes` will not render the component under the path.
:::

### routerProps

Allows to add props to the the `Router` component from React Router.

```ts
jsPlugin.register({
  // ...
  routerProps: object?;
})
```

It will be used to render the `Router` like below:

```js
const routerProps = plugin.invoke('!routerProps')[0] || {};

<Router {...routerProps}>...</Router>;
```

From the code we can see only the first plugin which provides `routerProps` will be used. So, ensure only one plugin on your application customizes router props.

### reducer

All plugins share the same Redux store, they can contribute a reducer by the `reducer` extension point. All collected reducers are combined together under a convention name: camel case of the plugin name prefixed with `plugin`. For example:

```js
jsPlugin.register({
  //...
  name: 'my-dashboard',
  reducer: (state = {}, action) => {},
});

jsPlugin.register({
  //...
  name: 'my-profile',
  reducer: (state = {}, action) => {},
});
```

Then the final root reducer will be constructed by:

```js
const rootReducer = combineReducers({
  pluginMyDashboard: () => {},
  pluginMyProfile: () => {},
  // ...
});
```

For example, below picture shows a real case final Redux store at runtime:

<img src={require("/img/redux-store-real-case.png").default} width="360" style={{marginBottom: 20}} />

:::info
This approach implies the feature: one plugin can access others' Redux by default. It's also possible to dispatch an action to be handled by some other plugin's reducer.
:::

### reducers

Whild the `reducer` ext point restricts the reducer name to a fixed name based on plugin name like "pluginMyDashboard". The `reducers` ext point allows you to contribute a root level reducer. This is useful if your store data is intended to be accessed by all plugins easily.

For example, an user plugin maintains the current user information for all plugins to access, then it can contribute the reducer by:

```js
jsPlugin.register({
  // ...
  reducers: {
    user: () => {},
  },
});
```

Still like the above real case example:

<img src={require("/img/redux-store-real-case.png").default} width="360" style={{marginBottom: 20}} />

You can see the `user` node under the root of the Redux store.

:::note
To read the state of the plugin, you need to know the full path. So it's important to understand how your reducers are organized together. For example, to access the dashboard data in the dashboard plugin:

```js
const dashboardData = useSelector((s) => s.pluginMyDashboard.data);
```

That is, you need to know where is your plugin's reducer is combined at (`pluginMyDashboard` here).
:::

### rootComponent

While starting the app, any plugin can contribute an component to be rendered. The component should not occupy the layout space but should be invisible or just for displaying modals.

```js
jsPlugin.register({
  rootComponent: () => {
    // a component as place holder for initialization
    return null;
  },
});
```

For example, you want to show a popup when app starts from some plugin:

```jsx
jsPlugin.register({
  rootComponent: () => {
    // Show a welcome dialog if the user has not accessed before.
    if (cookie.get('already_accessed')) {
      return <WelcomeModal open />;
    } else {
      return null;
    }
  },
});
```

### root.renderChildren

This ext point allows you to the your application with custom providers at the root component level. For example:

```jsx {6-14}
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();
jsPlugin.register({
  name: 'myplugin',
  root: {
    renderChildren: (children) => {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    },
  },
  // ...
});
```

### home.mainLayout

This extension point allows to define a component at the root path `/`. So that all children are rendered under its container. For example:

```js {3-12}
jsPlugin.register({
  name: 'myplugin',
  home: {
    mainLayout: (children) => {
      return (
        <div>
          <Header />
          <Sider />
          <div className="main-content">{children}</div>
        </div>
      );
    },
  },
  // ...
});
```

:::note
There should be only one plugin contributes the `home.mainLayout`.
:::

### home.homepage

As saw in the above example, we can't define a routing rule for the root path `/` as homepage since we've used it for a replaceable layout. So we provide this special extension point to define the homepage of the application.

```js {3-5}
jsPlugin.register({
  name: 'myplugin',
  home: {
    homepage: () => 'My custom homepage.',
  },
  // ...
});
```

:::note
There should be only one plugin contributes the `home.homepage`.
:::

## App meta

App meta means the plugin consumes some meta data from the app yaml file in the registry.

### routerType

Since the `@ebay/muse-lib-react` plugin configures and renders the root `Router` component from React Router. It allows you to change the router type based on the `routerType` config in app yaml, it allows value of `browser`, `hash` and `memory`. Internally the mapping is as below:

```js
import { BrowserRouter, HashRouter, MemoryRouter } from 'react-router-dom';

const routerMap = {
  browser: BrowserRouter,
  hash: HashRouter,
  memory: MemoryRouter,
};
```

That is, based on `routerType` it uses different router component. You can config it in the app yaml file in Muse registry:

```yaml title=""
name: myapp
routerType: browser # browser | hash | memory
envs:
  staging:
    #...
```

So, with extension point `routerProps` and the meta option `routerType` you are actually able to custmize the router behavior.

## Shared modules

All shared modules in a lib plugins use fixed version in `package.json`. So when the lib plugin is installed as dependency it will install same versions.

```json
"@babel/core": "7.20.5",
"@craco/craco": "^7.1.0",
"@ebay/nice-modal-react": "1.2.8",
"axios": "1.2.0",
"craco-less": "^3.0.1",
"history": "5.3.0",
"js-plugin": "1.1.0",
"lodash": "4.17.21",
"path-to-regexp": "6.2.1",
"react": "18.2.0",
"react-dom": "18.2.0",
"react-loadable": "5.5.0",
"react-redux": "8.0.5",
"react-router-dom": "6.4.3",
"react-use": "17.4.0",
"redux": "4.2.0",
"redux-logger": "3.0.6",
"redux-mock-store": "1.5.4",
"redux-thunk": "2.4.2",
```

## Provided modules

The only useful module you can import is the Redux store:

```
@ebay/muse-lib-react@1.0.12/src/common/store.js
```

Then you can dispatch actions or get global state with the API.

## Forking the project

Since `@ebay/muse-lib-react` plugin provides fixed combination of dependency versions, you may want to full control them and maybe you want more customization for React, React Router or Redux. Then you can create your own React lib plugin. That will be a pretty good choice. If you keep same shared modules, your forked plugin will also be compatible with other plugins those are built on top of `@ebay/muse-lib-react`.

## Summary

The lib plugin provides a tech stack for React development. It's a bit opinionate but you can also choose to build your common base lib plugin for your own Muse applications.
