import { ComponentType } from "react";

type ProviderType = {
  order: number;
  key: string;
  provider: React.ComponentType<any> | null;
  props?: object;
  renderProvider?: ((children: React.ReactNode) => React.ReactNode) | null;
};

type ProvidersContextType = {
  providers: ProviderType[];
  [key: string]: any;
}

export type RootExtPoints = {
  beforeRender?: Function;
  afterRender?: Function;
  renderChildren?: Function;
  preProcessProviders?: (context: ProvidersContextType) => void;
  getProviders?: (context: ProvidersContextType) => ProviderType | ProviderType[];
  processProviders?: (context: ProvidersContextType) => void;
  postProcessProviders?: (context: ProvidersContextType) => void;
};
export type MuseRouter = {
  path?: string;
  component?: ComponentType;
  childRoutes?: MuseRouter[];
  isIndex?: boolean;
  parent?: string;
  [key: string]: any;
};

export default interface MuseLibReactExtPoints {
  onReady?: Function;
  root?: RootExtPoints;
  routerProps?: Record<string, any>;
}