# Plugin Engine

Muse uses a very simple plugin engine named [js-plugin](https://github.com/rekit/js-plugin) which has only ~150 lines of source code. But it's very flexible so that we can let different Muse plugins work together seamlessly. It's not only used for Muse frontend but also for the Muse backend(introduced later).

## Register a plugin
A plugin instance is just a pure javascript object, you can use `jsPlugin.register` to register it to the plugin engine:

```js
import jsPlugin from 'js-plugin';

jsPlugin.register({
  name: 'myplugin',
  deps: [],
  foo: 'bar',
});
```

The only necessary property of a plugin is `name`. It should be uniq in the plugin engine. An optional reserved property is `deps`, you can tell js-plugin which other plugins it depends on. If any dependency doesn't exist, then the plugin will also not be used.

:::note
Every system only have one js-plugin system. You don't need to instantiate it but just use the static API.
:::

## Extension point
Now we have many javascript objects (plugins) in the plugin engine, how we use them? It's by the mechanism "Extension Point". Though it heards hard to understand, actually it's very very simple.

An extension point represents the property path of a plugin object. For example, if we say extension point `header.menu.getMenuItems`, it means all plugins with below shape will contribute some menu items to the extension point:
```js
{
  name: 'my-plugin',
  header: {
    menu: {
      getMenuItems: () => {}
    }
  }
}
```

Then how to define an extension point? No definition necessary, just call method: `jsPlugin.getPlugins(extPoint)` or `jsPlugin.invoke(extPoint)`:

```js
// This returns all plugins (js objects) those have the property path: header.menu.getMenuItems
// Then you can do whatever you want since you get all such plugins.
const plugins = jsPlugin.getPlugins('header.menu.getMenuItems');

// The invoke API will collect all values into the returned array.
// It invokes the `getMenuItems` function on every plugin to get the return value.
const menuItems = jsPlugin.invoke('header.menu.getMenuItems', ...args);
```

Below is another simple example:

```js
import jsPlugin from 'js-plugin';

// Register two plugins into the plugin engine
jsPlugin.register({
  name: 'p1',
  fruit: 'apple',
});
jsPlugin.register({
  name: 'p2',
  fruit: () => 'orange',
});

// Get plugins which contribute to the extension point `fruit`:
const plugins = jsPlugin.getPlugins('fruit');
// => [{ name: 'p1', fruit: ...}, { name: 'p2', fruit: ...}]

// Collect values by `invoke`. It auto executes the function at the extension point.
const fruits = jsPlugin.invoke('fruit');
// => ['apple', 'orange']
```

By default, the `invoke` method always calls the function if the ext point is a function and collect the return value. But sometimes you don't want to execute the function but just want to collect functions themeselves, a typical case is for functional components. Then use a `!` before the extension points. For example:
```js
// The dashboard.widget is not executed.
const widgets = jsPlugin.invoke('!dashboard.widget');
```

Then a plugin with below shape will contribute a component as widget rather than the returned string 'Hello':

```js
{
  name: 'myplugin',
  dashboard: {
    widget: () => 'Hello',
  }
}
```

## Plugin Dependency
Every plugin could declare its dependencies by `deps` property:
```js
const myPlugin = {
  name: 'myPlugin',
  deps: ['plugin1', 'plugin2']
};
```
The `deps` property means two things:

1. If any dependency doesn't exist, then the plugin is also not loaded.
2. Plugin extension points are executed after its deps when call `plugin.invoke` or `plugin.getPlugins`

## APIs Reference
**js-plugin** is a very simple plugin engine, it only has below 6 APIs:

| API | Description |
|---|---|
| getPlugin(name) | Get the plugin instance by name. If your plugin want to export some reuseable utilities or API to other plugins, you can define it in plugin object, then other plugin can use getPlugin to get the plugin object and call its API. |
| getPlugins([extPoint]) | Get all plugins that contributes to the extension point. If no `extPoint` provided, then returns all plugins. |
| invoke(extPoint, ...args) | Call extension point method from all plugins which support it and returns an array which contains all return value from extension point function. |
| register(pluginObject) | Register a plugin to the system. Normally you should register all plugins before your app is started. If you want to dynamically register plugin on demand, you need to ensure all extension points executed again. For example, you may want to Menu component force updated when new plugin registerred. |
| sort(values, propName='order') | This is just a frequently used helper method to sort an array of objects with order property (default to `order`). In many cases we need to sort array collected from plugins like in Menu or Form.  |
| unregister(name) | Unregister a plugin by name. You may also need to ensure all UI re-renderred if necessary yourself. |

## Enrich js-plugin APIs
The js-plugin provides a low level APIs of the plugin engine. But sometimes you may need more common utility methods to use the plugin engine easily. For example, support async extension points. Below are some examples how we can enrich js-plugin APIs to meet some common requirements.

### Async in parallel
Allows to collect data from async ext points. For example, we have a search plugin put a global search box on the page header. Then other plugins may contribute search result to it.


```js
import jsPlugin from 'js-plugin';
import _ from 'lodash';

const asyncInvoke = async (extPoint, ...args) => {
  const plugins = plugin.getPlugins(extPoint);
  const asyncFuncs = plugins.map(p => _.invoke(p, extPoint, ...args))
  return await Promise.all(asyncFuncs)
}

```
### Async in series

- get first: use the first when get
- handle
- async in series

## Examples
Here we want to give two near real world cases for you to understand the usage of `js-plugin`:

### Example 1: Menu
Menu is used to navigate among functions of an application. Whenever you add a new feature, it may need a menu item in the menu. Say that we have a menu component like below (from Github settings page):

<img src="./images/menu.png?raw=true" width="250" />

```js
import React from 'react';

export default function Menu() {
  return (
    <ul>
      <li>Profile<li>
      <li>Account<li>
      <li>Security<li>
    </ul>
  );
}
```

Now we need to add a new feature to allow to block users. It needs a menu item named 'Blocked users' in settings page. Normallly we need to change `Menu` component:
```js
return (
  <ul>
    <li>Profile<li>
    <li>Account<li>
    <li>Security<li>
    <li>Blocked Users<li>
  </ul>
);
```

It looks quite intuitive but it's not extensible. Whenever we add features to the application, we need to change `Menu` component and finally it will become too complicated to maintain. Especially if the menu item is dynamically like it needs to be show or not to show according to the permission. We have to embed the permission logic in `Menu` component. For example: if the block user feature is only available for premium users:

```js
return (
  <ul>
    <li>Profile<li>
    <li>Account<li>
    <li>Security<li>
    {user.isPremium() && <li>Blocked Users<li>}
  </ul>
);
```

Essentially the menu item is a part of feature of `block user`. All the logic of the feature should be only in the scope of the feature itself while the `Menu` is just a pure presentation component which is only responsible for navigation without knowing about other business logic.

So we need to make `Menu` extensible, that is it allows to register menu items. Below is how we do it using `js-plugin`:

#### Menu.js
```js
import React from "react";
import plugin from "js-plugin";

export default function Menu() {
  const menuItems = ["Profile", "Account", "Security"];
  plugin.invoke("menu.processMenuItems", menuItems);
  return (
    <div>
      <h3>Personal Settings</h3>
      <ul>
        {menuItems.map(mi => (
          <li key={mi}>{mi}</li>
        ))}
      </ul>
    </div>
  );
}

```
Here `Menu` component defines an extension point named `menu.processMenuItems` and passes `menuItems` as an argument. Then every plugin could use this extension point to extend menu items. See below plugin sample about how to consume the extension point.

#### plugin1.js
```js
import { Button } from "antd";
import plugin from "js-plugin";

plugin.register({
  name: "plugin1",
  menu: {
    processMenuItems(items) {
      items.push("Blocked users");
    },
  },
});
```

Here `plugin1` is a plugin that contributes a menu item `Blocked users` to `Menu` component. By this approach, `Menu` component no longer cares about any business logic.

Here is the extended menu with `Blocked users`:

<img src="./images/menu2.png" width="250" />

### Example 2: Form
Form is used to display detail information of a business object. It may become much complicated when more and more features added. Take user profile example. A form may look like:

<img src="./images/form.png" width="700" />

We can build such a form easily with [antd-form-builder](https://github.com/rekit/antd-form-builder) with below code:

```js
import React from "react";
import FormBuilder from "antd-form-builder";

export default () => {
  const personalInfo = {
    name: { first: "Nate", last: "Wang" },
    email: "myemail@gmail.com",
    gender: "Male",
    address: "No.1000 Some Road, Zhangjiang Park, Pudong New District",
  };
 
  const meta = {
    columns: 2,
    fields: [
      { key: "name.first", label: "First Name" },
      { key: "name.last", label: "Last Name" },
      { key: "gender", label: "Gender" },
      { key: "email", label: "Email" },
      { key: "address", label: "Address", colSpan: 2 },
    ],
  };

  return (
    <div>
      <div layout="horizontal" style={{ width: "800px" }}>
        <h1>User Infomation</h1>
        <FormBuilder meta={meta} initialValues={personalInfo} viewMode />
      </div>
    </div>
  );
};
```

Still take `block user` feature for example, when you open an user profile, we need to add a field named `Blocked` to show block status of the user to you. Without plugin mechanism, we need to update `UserProfile` component to add this field. Obviously it will add complexity to `UserProfile` component and it makes code less maintainable because code of the feature is distributed in different places. Now let's use the same approach as `Menu` example, we allow plugins to modify form meta by `js-plugin`:

#### UserProfile.js
```js
import React from "react";
import FormBuilder from "antd-form-builder";
import plugin from "js-plugin";

export default () => {
  const personalInfo = {
    name: { first: "Nate", last: "Wang" },
    email: "myemail@gmail.com",
    gender: "Male",
    address: "No.1000 Some Road, Zhangjiang Park, Pudong New District",
  };

  const meta = {
    columns: 2,
    fields: [
      { key: "name.first", label: "First Name" },
      { key: "name.last", label: "Last Name" },
      { key: "gender", label: "Gender" },
      { key: "email", label: "Email" },
      { key: "address", label: "Address", colSpan: 2 },
    ],
  };

  plugin.invoke("profile.processMeta", meta, personalInfo);

  return (
    <div>
      <div layout="horizontal" style={{ width: "800px" }}>
        <h1>User Infomation</h1>
        <FormBuilder meta={meta} initialValues={personalInfo} viewMode />
      </div>
    </div>
  );
};
```

We can see we defined an extension point named `profile.processMeta` in `UserProfile` component, then we can comsume this extension point in a plugin:

#### plugin1.js
```js
import { Button } from "antd";
import plugin from "js-plugin";

plugin.register({
  name: "plugin1",
  menu: {
    processMenuItems(items) {
      items.push("Blocked users");
    },
  },
  profile: {
    processMeta(meta) {
      meta.fields.push({
        key: "blocked",
        label: "Blocked",
        viewWidget: "switch",
      });
    },
  },
});
```

Then we got the UI as below:

<img src="./images/form2.png" width="700" />

From above two examples, we see how we use `js-plugin` to keep all releated code in one place, whenever we add a new feature, we will not add complexity to either `Menu` or `UserProfile` component. That is we don't need to change `Menu` or `UserProfile` components.

You can see the live example at:


