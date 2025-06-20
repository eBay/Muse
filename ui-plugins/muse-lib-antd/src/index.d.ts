declare module '@ebay/muse-lib-antd/src/features/common' {
  import { FC, Component, ReactNode, MouseEventHandler, PureComponent } from 'react';
  import { ConfigProviderProps } from 'antd/es/config-provider';
  import { Moment } from 'moment';

  export interface BlockViewProps {
    value?: any;
    openEmail?: boolean;
  }
  export class BlockView extends Component<BlockViewProps> { }

  export interface CodeViewerProps {
    theme?: 'dark' | 'light';
    title?: string;
    language?: string;
    allowCopy?: boolean;
    code: string;
    [key: string]: any; // for other props
  }
  export const CodeViewer: FC<CodeViewerProps>;

  export interface ConfigProviderWrapperProps extends ConfigProviderProps {
    children: ReactNode;
  }
  export const ConfigProviderWrapper: FC<ConfigProviderWrapperProps>;

  export interface DateViewProps {
    value: string | Moment;
    dateOnly?: boolean;
    timeOnly?: boolean;
    dateTime?: boolean;
    dateFormat?: string;
    timeFormat?: string;
    dateTimeFormat?: string;
  }
  export const DateView: FC<DateViewProps>;

  type ItemProps = {
    key: string;
    label: ReactNode;
    order?: number;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
    icon?: ReactNode;
    highlight?: boolean;
    link?: string;
    [key: string]: any;
  }
  export interface DropdownMenuProps {
    items: ItemProps[];
    triggerNode: ReactNode,
    extPoint?: string,
    extPointParams?: Record<string, any>,
    size?: 'small' | 'default' | 'large',
    [key: string]: any,
  }
  export const DropdownMenu: FC<DropdownMenuProps>;

  interface ErrorBoxProps {
    title?: ReactNode;
    content?: ReactNode;
    description?: any;
    preDescription?: any;
    onRetry?: () => void;
    retryText?: string;
    error?: object;
    btnSize?: string;
    showStack?: boolean;
  }

  export class ErrorBox extends Component<ErrorBoxProps> {
    static defaultProps: Partial<ErrorBoxProps>;
  }

  interface ErrorBoundaryProps {
    message?: ReactNode;
    children: ReactNode;
  }

  interface ErrorBoundaryState {
    hasError: boolean;
    error?: any;
  }
  export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> { }

  interface GlobalLoadingProps {
    full?: boolean;
  }

  export default class GlobalLoading extends Component<GlobalLoadingProps> { }

  interface GlobalErrorBoxProps {
    title?: string;
    error: object;
    onOk?: () => void;
    okText?: string;
    onClose?: () => void;
  }

  export class GlobalErrorBox extends Component<GlobalErrorBoxProps> {
    static defaultProps: Partial<GlobalErrorBoxProps>;
  }

  interface HighlighterProps {
    search: string | string[];
    text: string;
  }
  export const Highlighter: FC<HighlighterProps>;

  interface IconProps {
    type: string;
    className?: string;
    onClick?: () => void;
    style?: React.CSSProperties;
  }
  export const Icon: FC<IconProps>;

  export class LoadingMask extends Component { }

  export interface MetaMenuItem {
    key: string;
    label: ReactNode;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    link?: string;
    type?: 'group' | 'divider';
    children?: MetaMenuItem[];
  }

  export interface MetaMenuProps {
    meta: {
      items: MetaMenuItem[];
      collapsed?: boolean;
      onClick?: MouseEventHandler<HTMLButtonElement>;
      activeKeys?: string[];
    };
    onClick?: MouseEventHandler<HTMLButtonElement>;
    autoSort?: boolean;
    baseExtPoint?: string;
  }
  export const MetaMenu: FC<MetaMenuProps>;

  export class PageNotFound extends PureComponent { }

  export interface RequestStatusProps {
    pending?: boolean;
    loading?: boolean;
    error?: any;
    errorMode?: 'inline' | 'modal';
    loadingMode?: 'container' | 'global' | 'skeleton';
    dismissError?: () => void;
    skeletonProps?: object;
    errorProps?: object;
  }
  export const RequestStatus: FC<RequestStatusProps>;

  interface StatusLabelProps {
    label: string;
    type: 'SUCCESS' | 'FAILURE' | 'PROCESSING' | 'Retired' | 'INFO' | 'DORMANT';
    [key: string]: any; // for other props
  }
  export const StatusLabel: FC<StatusLabelProps>;

  interface TableBarProps {
    children?: ReactNode;
    className?: string;
    onSearch?: (value: string) => void;
    search?: string;
    placeholder?: string;
  }
  export const TableBar: FC<TableBarProps>;

  interface TagInputProps {
    max?: number;
    value?: any;
    onChange?: (value: any) => void;
    [key: string]: any; // for other props
  }
  export const TagInput: FC<TagInputProps>;

  // export const Wizard: FC;
}

declare module '@ebay/muse-lib-antd/src/utils' {
  export interface FormMeta {
    fields: any[];
    [key: string]: any;
  }

  export interface ExtendedFormMeta {
    watchingFields: any[];
    meta: FormMeta;
  }

  export function extendFormMeta(meta: FormMeta, extBase: string, ...args: any[]): ExtendedFormMeta;

  export function extendArray(arr: any[], extName: string, extBase: string, ...args: any[]): any[];
}