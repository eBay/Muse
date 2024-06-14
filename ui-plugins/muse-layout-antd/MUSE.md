# @ebay/muse-layout-antd
## Extension Points
### museLayout.header.getConfig
*() => [[Header](#header)Config](#[Header](#header)config)*

### museLayout.header.getItems
*() => [[Header](#header)Item](#[Header](#header)item) | [[Header](#header)Item](#[Header](#header)item)[]*

### museLayout.header.processItems
*(items: [[Header](#header)Item](#[Header](#header)item)[]) => void*

### museLayout.sider.getConfig
*() => [[Sider](#sider)Config](#[Sider](#sider)config)*

### museLayout.sider.getItems
*() => [[Sider](#sider)Item](#[Sider](#sider)item) | [[Sider](#sider)Item](#[Sider](#sider)item)[]*

## Interfaces & Types
### Header
```ts
/**
 * @museExt
 */
interface Header {
  getConfig?: () => HeaderConfig;
  getItems?: () => HeaderItem | HeaderItem[];
  processItems?: (items: HeaderItem[]) => void;
}
```
### HeaderConfig
```ts
type HeaderConfig = {
  backgroundColor?: string;
  icon?: ReactNode;
  title?: string;
  noUserMenu?: boolean;
  themeSwitcher?: boolean;
  subTitle?: string;
  [key: string]: any;
};
```
### HeaderItem
```ts
type HeaderItem = {
  position?: 'left' | 'center' | 'right';
  order?: number;
  key: string;
  label?: string;
  link?: string;
  linkTarget?: string;
  onClick?: Function;
  icon?: ReactNode;
  type?: 'menu' | string;
  className?: string;
  menuMeta?: Record<string, any>;
};
```
### Sider
```ts
/**
 * @museExt
 */
interface Sider {
  getConfig?: () => SiderConfig;
  getItems?: () => SiderItem | SiderItem[];
}
```
### SiderConfig
```ts
type SiderConfig = {
  mode?: 'fixed' | 'drawer' | 'collapsable' | 'collapsed' | 'none';
  siderDefaultCollapsed?: boolean;
  homeMenu?: boolean;
  theme?: 'dark' | 'light' | 'custom';
  width?: number;
  menuProps?: Record<string, any>;
  [key: string]: any;
};
```
### SiderItem
```ts
type SiderItem = {
  key: string;
  icon?: ReactNode;
  link?: string;
  label: ReactNode;
  order?: number;
};
```