# README
This plugin is a re-usable and highly cusomizable layout plugin for quickly creating Muse applications.

You can customize header, sider and menu items of the layout from different plugins by extension points.

## Plugin Variables
### noSiderInSubApp
If set to `true`, there will be no sider if integrated as a sub app.

## Extend Header Menus
There's difference between header dropdown menus and the sider menu. Each dropdown menu on the header is a standalone menu component while the whole sider menu is a standalone one. So, to extend header menus, you need to know the `key` of the header menu item and use extension point `header.[menu-item-key].getItems` to contribute menu items to a given header menu.

For example: the user name dropdown menu is a header menu item, if you want to put a new menu item in the user dropdown, then you need to use below extendsion point:

```js

const museLayout = {
  header: {
    // this is the header item key
    userAvatar: {
      getItems: () => {
        return {
          key: 'my-user-menu',
          label: 'My User Menu',
          onClick: () => {}
        }
      }
    }
  }
}

```

So the `userAvatar` extension point is a dynamic name

## FAQ

### What is `parent` property of menu item used for?

### How to update the menu items dynamically?

