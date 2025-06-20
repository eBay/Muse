# @ebay/muse-lib-react
## Extension Points
### home.homepage
*ComponentType&lt;Object&gt;*

The homepage component of the applicaiton. That is, the component under root route "/".

### home.mainLayout
*ComponentType&lt;Object&gt;*

The main layout of the application. Use this extpoint need to undeploy @ebay/muse-layout-antd.

### onReady
*Function*

Called after the application is mounted to the DOM (React root elemented rendered)

### reducer
*Reducer&lt;any, AnyAction&gt;*

Redux store extension point, contribute a plugin level reducer.

### reducers
*Record&lt;string, Reducer&lt;any, AnyAction&gt;&gt;*

Redux store extension point, contribute root level reducers.

### root.afterRender
*Function*

Called after the root element is rendered.

### root.beforeRender
*Function*

Called before the root element is rendered.

### root.getProviders
*(context: [ProvidersContextType](#providerscontexttype)) => void | [ProviderType](#providertype) | [ProviderType](#providertype)[]*

Get providers, you can return a single provider or an array of providers or nothing.

### root.postProcessProviders
*(context: [ProvidersContextType](#providerscontexttype)) => void*

Called after processProviders, another opportunity to process providers.

### root.preProcessProviders
*(context: Object) => string | boolean*

Pre-process providers. This is called before providers are collected by getProviders.
Sometimes you want to disable some internal providers, just remove it from the context.

### root.processProviders
*(context: [ProvidersContextType](#providerscontexttype)) => string | void*

After all providers from 
`getProviders`
 are collected, you can process them here.

### root.renderChildren
*() => void*

Render a wrapper component to the root element. This is often used to inject providers.
But usually you can use getProviders instead.

### rootComponent
*ComponentType&lt;Object&gt;*

You can render an empty component to the app root after app started.
It's mainly used for some initialization logic.
NOTE: you should not render any UI content in the component, just return null.

### route
*[MuseRoute](#museroute) | [MuseRoute](#museroute)[]*

Route definitions

```ts
factorial(1)
```

#### Example
If there is a code block, then both TypeDoc and VSCode will treat
text outside of the code block as regular text.

```ts
factorial(1)
```

### routerProps
*Record&lt;string, any&gt;*

Merge additional props passed Router component directly.

### testPoint.ab.cd
*() => Object*

### testPoint.test
*string*

## Interfaces & Types
### HomeExtPoints
```ts
/**
 * @museExt
 */
interface HomeExtPoints {
  /**
   * The main layout of the application. Use this extpoint need to undeploy @ebay/muse-layout-antd.
   */
  mainLayout?: ComponentType;

  /**
   * The homepage component of the applicaiton. That is, the component under root route "/".
   */
  homepage?: ComponentType;
}
```
### MuseRoute
```ts
/**
 * @category Ext Points Route
 */
interface MuseRoute {
  id?: string;
  path?: string | Array<string>;
  component?: ComponentType;
  element: ReactNode;
  childRoutes?: MuseRoute[];
  isIndex?: boolean;
  index?: boolean;
  render?: Function;
  parent?: string;
  [key: string]: unknown;
}
```
### ProvidersContextType
```ts
/**
 * The interface to process providers.
 */
interface ProvidersContextType {
  providers: ProviderType[];
}
```
### ProviderType
```ts
/**
 * A component(provider) wraps the root element of the application.
 * For example Redux provider, Router provider, etc.
 */
type ProviderType = {
  // The order of the provider, the smaller the number, the higher the priority.
  order: number;
  // The key of the provider.
  key: string;
  // The provider component.
  provider: React.ComponentType<any> | null;
  // The props passed to the provider.
  props?: Record<string, any> | null;
  // How to render the wrapped children.
  renderProvider?: ((children: React.ReactNode) => React.ReactNode) | null;
};
```
### RootExtPoints
```ts
/**
 * @description
 * The `root` extension point type.
 * @museExt
 */
interface RootExtPoints {
  /**
   * Called before the root element is rendered.
   */
  beforeRender?: Function;
  /**
   * Called after the root element is rendered.
   */
  afterRender?: Function;

  /**
   * Render a wrapper component to the root element. This is often used to inject providers.
   * But usually you can use getProviders instead.
   */
  renderChildren?: () => void;

  /**
   * Pre-process providers. This is called before providers are collected by getProviders.
   * Sometimes you want to disable some internal providers, just remove it from the context.
   */
  preProcessProviders?: (context: { providers: ProviderType[] }) => string | boolean;

  /**
   * Get providers, you can return a single provider or an array of providers or nothing.
   */
  getProviders?: (context: ProvidersContextType) => ProviderType | ProviderType[] | void;

  /**
   * After all providers from `getProviders` are collected, you can process them here.
   */
  processProviders?: (context: ProvidersContextType) => string | void;

  /**
   * Called after processProviders, another opportunity to process providers.
   */
  postProcessProviders?: (context: ProvidersContextType) => void;
}
```