import type { TabsProps } from 'antd';

type NodeType = {
  order?: number,
  node?: any,
  component?: any,
};

export type getNodes = (args: any) => NodeType | NodeType[];
export type getFields = (args: any) => any | any[];
export type getScopes = (args: any) => any | any[];
export type getColumns = (args: any) => any | any[];
export type getActions = (args: any) => any | any[];
export type getItems = (args: any) => any | any[];

export type processDropdownItems = (args: any) => void;

export interface ListAbilities {
  preProcessItems: (args: any) => void;
  getItems?: getItems;
  processItems?: (args: any) => void;
  postProcessItems?: (args: any) => void;
}

export interface TableColumnsAbilities {
  preProcessColumns?: (args: any) => void;
  getColumns?: getColumns;
  processColumns?: (args: any) => void;
  postProcessColumns?: (args: any) => void;
}


export interface NiceFormComponent {
  getWatchingFields?: () => string[];
  getFields?: getFields,
  preProcessMeta?: (args: any) => void,
  postProcessMeta?: (args: any) => void,
  processMeta?: (args: any) => void,
}

export interface NiceModalComponent {
  form?: NiceFormComponent;
  body?: ListAbilities;
  footer?: ListAbilities;
}

export interface ListBar {
  getScopes?: getScopes;
  processDropdownItems?: processDropdownItems;
}

export interface AMAppPage {
  getNodes?: getNodes,
  getAppNameActions?: getNodes,
}

export interface AppOverview {
  getNodes?: getNodes;
}

type pluginListBar = ListBar;

export interface AppPage {
  getTabs?: (args: any) => TabsProps['items'];
}

export interface AM {
  appPage?: AMAppPage;
  appOverview?: AppOverview;
  createAppForm?: NiceFormComponent;
  appBasicInfo?: NiceFormComponent;
  editAppForm?: NiceFormComponent;
}

export type PM = {
  pluginInfoForm?: NiceFormComponent;
  pluginList?: TableColumnsAbilities & {
    getPluginBadges?: getNodes;
    preProcessPluginActions?: (args: any) => void;
    getPluginActions?: getActions;
    processPluginActions?: (args: any) => void;
    postProcessPluginActions?: (args: any) => void;
  };
  releaseList?: TableColumnsAbilities & ListAbilities & {
    processReleaseActions: (args: any) => void;
    getExpandNodes: (args: any) => NodeType | NodeType[];
  };
  deployPluginModal?: NiceModalComponent;
  undeployPluginModal?: NiceModalComponent;
  groupDeployModal?: NiceModalComponent;
  releaseInfoModal?: NiceModalComponent;
  pluginConfigForm?: NiceFormComponent;
  pluginStatus?: {
    relatedToPlugin?: (args: any) => void | boolean;
    processRequest?: (args: any) => void;
  };
  createPluginForm?: NiceFormComponent & {
    processValues?: (args: any) => void;
  }
};

export interface Req {
  requestDetailModal?: NiceModalComponent & {
    processModalProps?: (args: any) => void;
  }
}

export default interface MuseManagerExtPoints {
  setConfig?: (fn: (values: Object) => void) => void;
  appPage?: AppPage;
  am?: AM;
  pm?: PM;
  req?: Req;
  editEnvForm?: NiceFormComponent;
  addEnvForm?: NiceFormComponent;
  pluginListBar?: pluginListBar;
  getEnvironmentsColumns?: getColumns;
  processEnvironmentsColumns?: (args: any) => void;
  buildPluginForm?: NiceFormComponent;
}