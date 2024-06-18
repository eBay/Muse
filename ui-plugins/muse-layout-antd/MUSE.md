# @ebay/muse-layout-antd
## Extension Points
### museLayout.header.getConfig
*() => [HeaderConfig](#headerconfig)*

### museLayout.header.getItems
*() => [HeaderItem](#headeritem) | [HeaderItem](#headeritem)[]*

### museLayout.header.processItems
*(items: [HeaderItem](#headeritem)[]) => void*

### museLayout.sider.getConfig
*() => [SiderConfig](#siderconfig)*

### museLayout.sider.getItems
*() => [SiderItem](#sideritem) | [SiderItem](#sideritem)[]*

## Interfaces & Types
### Header
```ts
/**
 * @museExt
 */
type Header = {
  getConfig?: () => HeaderConfig;
  getItems?: () => HeaderItem | HeaderItem[];
  processItems?: (items: HeaderItem[]) => void;
};
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