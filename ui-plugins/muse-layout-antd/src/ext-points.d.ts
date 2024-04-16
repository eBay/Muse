export type HeaderConfig = {
  backgroundColor?: string;
  icon?: React.ReactNode;
  title?: string;
  noUserMenu?: boolean;
  themeSwitcher?: boolean;
  subTitle?: string;
  [key: string]: any;
};

export type HeaderItem = {
  position?: 'left' | 'center' | 'right';
  order?: number;
  key: string;
  label?: string;
  link?: string;
  linkTarget?: string;
  onClick?: Function;
  icon?: React.ReactNode;
  type?: 'menu' | string;
  className?: string;
  menuMeta?: Record<string, any>;
};

export type Header = {
  getConfig?: () => HeaderConfig;
  getItems?: () => HeaderItem | HeaderItem[];
  processItems?: (items: HeaderItem[]) => void;
};

export type SiderConfig = {
  mode?: 'fixed' | 'drawer' | 'collapsable' | 'collapsed' | 'none';
  siderDefaultCollapsed?: boolean;
  homeMenu?: boolean;
  theme?: 'dark' | 'light' | 'custom';
  width?: number;
  menuProps?: Record<string, any>;
  [key: string]: any;
}

export type SiderItem = {
  key: string;
  icon?: React.ReactNode;
  link?: string;
  label: React.ReactNode;
  order?: number;
};

export type Sider = {
  getConfig?: () => SiderConfig;
  getItems?: () => SiderItem | SiderItem[]
}
export default interface MuseLayoutExtPoints {
  header?: Header;
  sider?: Sider;
}