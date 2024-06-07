# @ebay/muse-lib-react

## Extension Points
### home.homepage
*ComponentType&lt;Object&gt;*

### home.mainLayout
*ComponentType&lt;Object&gt;*

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

### root.beforeRender
*Function*

### root.getProviders
*Function*

### root.postProcessProviders
*Function*

### root.preProcessProviders
*Function*

### root.processProviders
*Function*

### root.renderChildren
*Function*

### rootComponent
*ComponentType&lt;Object&gt;*

You can render an empty component to the app root after app started.
It's mainly used for some initialization logic.
NOTE: you should not render any UI content in the component, just return null.

### route
*MuseRoute | MuseRoute[]*

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
