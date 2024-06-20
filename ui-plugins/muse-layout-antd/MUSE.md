# @ebay/muse-layout-antd
## Extension Points
### museLayout.header.getConfig
*() => [HeaderConfig](#headerconfig)*

Get the header configuration. Note that you need to ensure there's no conflict between the configuration from different plugins.
Otherwise the result is unpredictable.

### museLayout.header.getItems
*() => [HeaderItem](#headeritem) | [HeaderItem](#headeritem)[] | void*

Get the sider menu items.

### museLayout.header.processItems
*(items: [HeaderItem](#headeritem)[]) => void*

After get all menu items in the header, you have opportunity to process the items like insert new ones, delete some, etc.

### museLayout.sider.getConfig
*() => [SiderConfig](#siderconfig)*

Get the sider configuration. Note that you need to ensure there's no conflict between the configuration from different plugins.
Otherwise the result is unpredictable.

### museLayout.sider.getItems
*() => void | [SiderItem](#sideritem) | [SiderItem](#sideritem)[]*

Get the sider menu items.

### museLayout.sider.processItems
*(items: [SiderItem](#sideritem)[]) => void*

After get all menu items in the sider, you have opportunity to process the items like insert new ones, delete some, etc.

## Interfaces & Types
### Header
```ts
/**
 * @museExt
 */
type Header = {
  /**
   * Get the header configuration. Note that you need to ensure there's no conflict between the configuration from different plugins.
   * Otherwise the result is unpredictable.
   */
  getConfig?: () => HeaderConfig;

  /**
   * Get the sider menu items.
   */
  getItems?: () => HeaderItem | HeaderItem[] | void;

  /**
   * After get all menu items in the header, you have opportunity to process the items like insert new ones, delete some, etc.
   */
  processItems?: (items: HeaderItem[]) => void;
};
```
### HeaderConfig
```ts
/**
 * The header configuration.
 */
type HeaderConfig = {
  /**
   * The background color of the header in css color format.
   */
  backgroundColor?: string;

  /**
   * The icon to display on the header. This should be a string which can be used by img.src.
   * For example: '/logo.png', or 'data:image/svg+xml;base64,...', etc.
   * Usually you import a image file and use it here. The bundler will generate the correct path for you.
   * e.g:
   * ```js
   * import logo from './logo.png';
   * //...
   * icon: logo,
   * //...
   * ```
   */
  icon?: 'string';

  /**
   * The title to display on the header.
   */
  title?: string;

  /**
   * Whether to show the user menu. Default to false.
   */
  noUserMenu?: boolean;

  /**
   * Whether to show the theme switcher.
   */
  themeSwitcher?: boolean;

  /**
   * The subtitle to display on the header.
   */
  subTitle?: string;
  [key: string]: any;
};
```
### HeaderItem
```ts
/**
 * The header item.
 */
interface HeaderItem extends MenuItem {
  /**
   * The position of the item.
   */
  position?: 'left' | 'center' | 'right';

  /**
   * The type value can only be 'menu' or not set. If it's 'menu', if will be rendered as a menu container.
   * This option is only used for the header item.
   */
  type?: 'menu';

  /**
   * The meta data of the menu. It will be passed to the menu component <Menu/> as props directly.
   * Only useful when type is menu.
   */
  menuMeta?: {
    /**
     * The props passed to the antd menu component <Menu/>.
     */
    menuProps: Record<string, any>;
  };
}
```
### MenuItem
```ts
/**
 * The menu item for sider or header items.
 */
interface MenuItem {
  /**
   * The header items are ordered by this number in ascending order.
   */
  order?: number;

  /**
   * The key of the item. It's not only used for React key, but also for other items to reference as parent.
   */
  key: string;

  /**
   * The label of the item.
   */
  label?: string;
  /**
   * The icon to display on the item. If it's a string, it will be the icon name in antd icons.
   * If the name is in kebab case, it will be auto add '-outlined' post fix and then convert to antd icon name in pascal case.
   * e.g: 'file', 'question-circle'. They will be converted to `FileOutlined`, `QuestionCircleOutlined`.
   * If it's already in pascal case, it will be used directly, e.g: 'FileOutlined'.
   */
  icon?: string | ReactNode;
  /**
   * The parent key of the item. If specified, this will be a child item of the parent.
   * It's same with defining it in the items array in the parent item.
   */
  parent?: string;

  /**
   * The css class name of the item.
   */
  className?: string;

  /**
   * If specified, the item will a link to this url.
   */
  link?: string;

  /**
   * The target of the link. Can be '_blank', '_self', '_parent', '_top', or a frame name.
   */
  linkTarget?: string;

  /**
   * The callback function when the item is clicked.
   */
  onClick?: Function;

  /**
   * The children items of the item.
   */
  children?: MenuItem[];
}
```
### Sider
```ts
/**
 * @museExt
 */
interface Sider {
  /**
   * Get the sider configuration. Note that you need to ensure there's no conflict between the configuration from different plugins.
   * Otherwise the result is unpredictable.
   * @returns
   */
  getConfig?: () => SiderConfig;

  /**
   * Get the sider menu items.
   */
  getItems?: () => SiderItem | SiderItem[] | void;

  /**
   * After get all menu items in the sider, you have opportunity to process the items like insert new ones, delete some, etc.
   */
  processItems?: (items: SiderItem[]) => void;
}
```
### SiderConfig
```ts
interface SiderConfig {
  /**
   * The mode of the sider:
   *  - fixed: The sider is always shown.
   *  - drawer: The sider is hidden by default, and can be shown by clicking a button.
   *  - collapsable: The sider is collapsable icons.
   *  - collapsed: The sider is collapsed by default. Only icons show.
   *  - none: No sider.
   */
  mode?: 'fixed' | 'drawer' | 'collapsable' | 'collapsed' | 'none';

  /**
   * When mode is collapsable, whether the sider is collapsed by default. Default to false.
   */
  siderDefaultCollapsed?: boolean;

  /**
   * Whether to show the home menu item. Default to true.
   */
  homeMenu?: boolean;

  /**
   * The width of sider in px
   */
  width?: number;
  /**
   * The props passed to the antd menu component <Menu /> in the sider.
   */
  menuProps?: Record<string, any>;
}
```
### SiderItem
```ts
interface SiderItem extends MenuItem {
  autoActive: boolean;
  activeMatch?: RegExp | Function;
  activeKeys?: string[];
}
```