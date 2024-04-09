import type { TabsProps } from 'antd';
import { ComponentType, ReactNode } from 'react';
import NiceFormMeta, { NiceFormFieldType } from '@ebay/nice-form-react/lib/esm/NiceFormMeta';
import type { ColumnsType } from 'antd/es/table';
import type { PopconfirmProps } from 'antd/es/popconfirm';
import type { FormInstance } from 'antd/es/form';

// App type for Muse V2
export type MuseV2App = {
  name: string;
  createdBy: string;
  createdAt: string;
  title: string;
  owners: string[];
  envs?: {
    [key: string]: MuseV2Env;
  };
  iconId?: number;
  config?: {
    entry?: string;
    theme?: 'dark' | 'light' | 'custom'
    noSSO?: boolean;
    allowlist?: string[];
    csp?: string;
  };
  pluginConfig?: {
    [key: string]: MuseV2PluginConfig;
  };
  pluginVariables?: Record<string, any>;
  variables?: Record<string, any>;
  description?: string;
  [key: string]: any;
}

// Environment type for Muse V2
export type MuseV2Env = {
  name: string;
  createdBy: string;
  createdAt: string;
  url: string | string[];
  c2sProxy: boolean;
  e2eTestMode: string;
  pluginVariables?: Record<string, any>;
  variables?: Record<string, any>;
  config?: {
    [key: string]: any;
  };
  [key: string]: any;
}

// Plugin config type for Muse V2
export type MuseV2PluginConfig = {
  core?: boolean;
  allowlist?: string[];
  [key: string]: any;
};

// Plugin type for Muse V2
export type MuseV2Plugin = {
  name: string;
  pluginName?: string; // compatible with Muse V1
  app?: string; // owner app
  createdBy: string;
  createdAt: string;
  type: 'normal' | 'lib' | 'boot' | 'init',
  owners: string[];
  repo: string;
  repoPath?: string; // for monorepo
  ut?: boolean;
  description?: string;
  config?: Record<string, any>; // deprecated ???
  variables?: Record<string, any>; // deprecated
  [key: string]: any;
};

// Release type for Muse V2
export type MuseV2Release = {
  pluginName: string;
  version: string;
  branch: string;
  sha: string;
  createdBy: string;
  createdAt: string;
  description: string;
  [key: string]: any;
};

// Request type for Muse V2
export type MuseV2Request = {
  id: string;
  type: string;
  autoComplete: boolean;
  createdBy: string;
  createdAt: string;
  description: string;
  payload: Record<string, any>;
  statuses: Record<string, any>[];
  [key: string]: any;
}

// Nodes component ext points
export type NodeType<C extends ComponentType<any> = ComponentType<any>> = {
  key?: string;
  order?: number,
  node?: ReactNode;
  component?: C,
  render?: (args: any) => ReactNode,
  props?: React.ComponentProps<C>,
};
export type getNodes = (args: any) => NodeType | NodeType[];
export interface NodesExtPoints<Context> {
  preProcessNodes?: (args: Context) => void;
  getNodes?: (args: Context) => NodeType | NodeType[];
  processNodes?: (args: Context) => void;
  postProcessNodes?: (args: Context) => void;
}


// Ext points on a list data
export type getItems<T> = (args: any) => T | T[];
export interface ListDefaultExtPoints<T> {
  preProcessItems?: (args: any) => void;
  getItems?: getItems<T>;
  processItems?: (args: any) => void;
  postProcessItems?: (args: any) => void;
}

// Table columns ext points
export type getColumns<RecordType> = (args: any) => ColumnsType<RecordType> | ColumnsType<RecordType>[];
export interface TableColumnsExtPoints<RecordType, Context> {
  preProcessColumns?: (args: Context) => void;
  getColumns?: (args: Context) => ColumnsType<RecordType> | ColumnsType<RecordType>[];
  processColumns?: (args: Context) => void;
  postProcessColumns?: (args: Context) => void;
}

// NiceForm ext points
export type getFields = (args: any) => NiceFormFieldType | NiceFormFieldType[];
export interface NiceFormExtPoints<Context> {
  getWatchingFields?: (args: Context) => string[];
  getFields?: (args: Context) => NiceFormFieldType | NiceFormFieldType[];
  preProcessMeta?: (args: Context) => void;
  postProcessMeta?: (args: Context) => void;
  processMeta?: (args: Context) => void;
}

// NiceModal ext points
export interface NiceModalComponent<T, NiceFormContext> {
  form?: NiceFormExtPoints<NiceFormContext>;
  body?: ListDefaultExtPoints<T>;
  footer?: ListDefaultExtPoints<T>;
}

// Actions ext points
export type ActionType = {
  key: string;
  label: ReactNode;
  highlight?: boolean;
  icon?: string | React.JSX.Element;
  onClick?: (args: any) => void;
  order?: number;
  disabled?: boolean;
  disabledText?: string;
  render?: (args: any) => ReactNode;
  confirm?: PopconfirmProps & {
    key: string;
  }
  [key: string]: any;
};
export type getActions = (args: any) => ActionType | ActionType[];
export interface ActionsExtPoints<Context> {
  preProcessActions?: (args: Context) => void;
  getActions?: getActions;
  processActions?: (args: Context) => void;
  postProcessActions?: (args: Context) => void;
}

// Table bar ext points
type ScopeType = {
  key: string;
  label: ReactNode;
  order: number;
  onClick: (args: any) => void;
}
export type getScopes = (args: any) => ScopeType | ScopeType[];
export type processDropdownItems = (args: any) => void;



export interface ListBar {
  getScopes?: getScopes;
  processDropdownItems?: processDropdownItems;
}

export interface AMAppPage {
  getNodes?: getNodes;
  getAppNameActions?: getNodes;
}

export interface AppOverview {
  getNodes?: getNodes;
}

type pluginListBar = ListBar;

export interface AppPage {
  getTabs?: (args: any) => TabsProps['items'];
}

type NiceFormContext = {
  meta: NiceFormMeta;
  form?: FormInstance;
  app?: MuseV2App;
  [key: string]: any;
}
type EnvironmentTableContext = {
  app?: MuseV2App;
  columns?: ColumnsType<Record<string, any>>;
}
export interface AM {
  appPage?: AMAppPage;
  appOverview?: AppOverview;
  createAppForm?: NiceFormExtPoints<NiceFormContext>;
  appBasicInfo?: NiceFormExtPoints<NiceFormContext>;
  editAppForm?: NiceFormExtPoints<NiceFormContext>;
  environments?: TableColumnsExtPoints<Record<string, any>, EnvironmentTableContext>;
}

type PluginActionContext<RecordType> = {
  app?: MuseV2App;
  columns?: ColumnsType<RecordType>;
  plugins?: MuseV2Plugin[];
  searchValue?: string;
  latestReleases?: MuseV2Release[];
  [key: string]: any;
};
type EnvFilter = {
  key: string;
  label: ReactNode;
};
type PluginBadgeContext = {
  app?: MuseV2App;
  plugin?: MuseV2Plugin;
  [key: string]: any;
};
type PluginListTableContext = {
  app?: MuseV2App;
  columns?: ColumnsType<any>;
  plugins?: MuseV2Plugin[];
  searchValue?: string;
  latestReleases?: { [key: string]: MuseV2Release };
  [key: string]: any;
}
export interface PluginListExtPoints<RecordType> extends
  TableColumnsExtPoints<RecordType, PluginListTableContext>,
  ActionsExtPoints<PluginActionContext<RecordType>> {
  pluginBadges?: NodesExtPoints<PluginBadgeContext>;
  getEnvFilters?: () => EnvFilter | EnvFilter[];
  getEnvFilterFns?: ({ filterKey, app, envName }: { filterKey: string, app: MuseV2App, envName: string }) => undefined | Function[];
  getScopeFilterFns?: ({ scope }: { scope: string }) => null | Function;
}

type ReleaseActionContext = {
  items?: ActionType[];
  app?: MuseV2App;
  plugin?: MuseV2Plugin;
  ability?: any;
  [key: string]: any;
};
type ReleaseNodeContext = {
  plugin?: MuseV2Plugin;
  releases?: MuseV2Release[];
  [key: string]: any;
}
type ExpandRowNodeContext = {
  release?: MuseV2Release;
};
type ReleaseTableContext = {
  plugin?: MuseV2Plugin, app?: MuseV2App, releases?: MuseV2Release[], [key: string]: any;
};
export interface ReleaseListExtPoints<RecordType> extends
  TableColumnsExtPoints<RecordType, ReleaseTableContext>,
  ActionsExtPoints<ReleaseActionContext>,
  NodesExtPoints<ReleaseNodeContext> {
  expandRow?: NodesExtPoints<ExpandRowNodeContext>
}

export type PluginStatusContext = {
  plugin?: MuseV2Plugin;
  app?: MuseV2App;
  request?: MuseV2Request;
};

export type PluginConfigFormExtPoints = NiceFormExtPoints<NiceFormContext> & {
  processValues?: (context: { values: Record<string, any>, form: FormInstance }) => void;
};


export type PM = {
  pluginInfoForm?: NiceFormExtPoints<NiceFormContext>;
  pluginList?: PluginListExtPoints<any>;
  releaseList?: ReleaseListExtPoints<any>;
  deployPluginModal?: NiceModalComponent<any, NiceFormContext>;
  undeployPluginModal?: NiceModalComponent<any, NiceFormContext>;
  groupDeployModal?: NiceModalComponent<any, NiceFormContext>;
  releaseInfoModal?: NiceModalComponent<any, NiceFormContext>;
  pluginConfigForm?: NiceFormExtPoints<NiceFormContext>;
  pluginStatus?: {
    relatedToPlugin?: (args: PluginStatusContext) => void | boolean;
    processRequest?: (args: PluginStatusContext) => void;
  };
  createPluginForm?: PluginConfigFormExtPoints
};

export interface Req {
  requestDetailModal?: NiceModalComponent<any, NiceFormContext> & {
    processModalProps?: (args: any) => void;
  }
}

export default interface MuseManagerExtPoints {
  setConfig?: (fn: (values: Record<string, any>) => void) => void;
  appPage?: AppPage;
  am?: AM;
  pm?: PM;
  req?: Req;
  editEnvForm?: NiceFormExtPoints<NiceFormContext>;
  addEnvForm?: NiceFormExtPoints<NiceFormContext>;
  pluginListBar?: pluginListBar;
}