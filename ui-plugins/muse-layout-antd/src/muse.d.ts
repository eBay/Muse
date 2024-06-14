import { ReactNode } from 'react';

export type HeaderConfig = {
  backgroundColor?: string;
  icon?: ReactNode;
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
  icon?: ReactNode;
  type?: 'menu' | string;
  className?: string;
  menuMeta?: Record<string, any>;
};

/**
 * @museExt
 */
export interface Header {
  getConfig?: () => HeaderConfig;
  getItems?: () => HeaderItem | HeaderItem[];
  processItems?: (items: HeaderItem[]) => void;
}

export type SiderConfig = {
  mode?: 'fixed' | 'drawer' | 'collapsable' | 'collapsed' | 'none';
  siderDefaultCollapsed?: boolean;
  homeMenu?: boolean;
  theme?: 'dark' | 'light' | 'custom';
  width?: number;
  menuProps?: Record<string, any>;
  [key: string]: any;
};

export type SiderItem = {
  key: string;
  icon?: ReactNode;
  link?: string;
  label: ReactNode;
  order?: number;
};

/**
 * @museExt
 */
export interface Sider {
  getConfig?: () => SiderConfig;
  getItems?: () => SiderItem | SiderItem[];
}

/**
 * @museExt museLayout
 */
export default interface MuseLayoutExtPoints {
  header?: Header;
  sider?: Sider;
}
