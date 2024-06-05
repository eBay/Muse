import { ComponentType, ReactNode } from 'react';
import { Reducer, AnyAction } from 'redux';

type ProviderType = {
  order: number;
  key: string;
  provider: React.ComponentType<any> | null;
  props?: Record<string, any> | null;
  renderProvider?: ((children: React.ReactNode) => React.ReactNode) | null;
};

type ProvidersContextType = {
  providers: ProviderType[];
  [key: string]: any;
};

export type RootExtPoints = {
  beforeRender?: Function;
  afterRender?: Function;
  renderChildren?: Function;
  preProcessProviders?: (context: ProvidersContextType) => void;
  getProviders?: (context: ProvidersContextType) => ProviderType | ProviderType[];
  processProviders?: (context: ProvidersContextType) => void;
  postProcessProviders?: (context: ProvidersContextType) => void;
};
export type MuseRoute = {
  id?: string;
  path?: string | Array<string>;
  component?: ComponentType;
  element: ReactNode;
  childRoutes?: MuseRoute[];
  isIndex?: boolean;
  index?: boolean;
  render?: Function;
  parent?: string;
  [key: string]: any;
};

export default interface MuseLibReactExtPoints {
  onReady?: Function;
  root?: RootExtPoints;
  routerProps?: Record<string, any>;
  home?: {
    mainLayout?: ComponentType;
    homepage?: ReactNode;
  };
  rootComponent?: ComponentType;
  reducer?: Reducer<any, AnyAction>;
  reducers?: Record<string, Reducer<any, AnyAction>>;
}
