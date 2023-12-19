/* This is the Root component mainly initializes Redux and React Router. */

import React, { useState, useEffect, useCallback } from 'react';
import { Provider } from 'react-redux';
import {
  Route,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  createHashRouter,
  createMemoryRouter,
  createRoutesFromElements,
} from 'react-router-dom';
import _ from 'lodash';
import NiceModal from '@ebay/nice-modal-react';
import plugin from 'js-plugin';
import store from './common/store';
import routeConfig from './common/routeConfig';
import history from './common/history';
import SubAppContext from './features/sub-app/SubAppContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { extendArray } from './utils';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: 0,
      refetchOnWindowFocus: false,
    },
  },
});

function renderRouteConfigV3(routes, contextPath) {
  // Resolve route config object in React Router v3.
  const children = []; // children component list

  const renderRoute = (item, routeContextPath) => {
    const { path, exact, render, component: RouteComponent, childRoutes, ...restRouteProps } = item;
    let newContextPath;
    if (/^\//.test(path)) {
      newContextPath = path;
    } else {
      newContextPath = `${routeContextPath}/${path}`;
    }
    newContextPath = newContextPath.replace(/\/+/g, '/');
    if ((render || RouteComponent) && childRoutes) {
      const descendantRoutes = renderRouteConfigV3(childRoutes, newContextPath);
      children.push(
        <Route
          exact={false}
          key={newContextPath.toString()}
          element={
            render ? (
              render()
            ) : (
              <RouteComponent>
                <Outlet />
              </RouteComponent>
            )
          }
          path={newContextPath}
          {...restRouteProps}
        >
          {descendantRoutes}
        </Route>,
      );
    } else if (RouteComponent || render) {
      children.push(
        <Route
          key={newContextPath.toString()}
          element={render ? render() : <RouteComponent />}
          path={newContextPath}
          exact={'exact' in item ? exact : true}
          {...restRouteProps}
        />,
      );
    } else if (childRoutes) {
      childRoutes.forEach(r => renderRoute(r, newContextPath));
    }
  };

  routes
    .reduce((p, c) => {
      if (_.isArray(c.path)) {
        // support path as an array, like react router v5
        c.path.forEach(path => {
          p.push({
            ...c,
            path,
          });
        });
      } else {
        p.push(c);
      }
      return p;
    }, [])
    .forEach(item => renderRoute(item, contextPath));

  return children;
}

const renderChildren = children => {
  const providers = plugin.invoke('!root.renderChildren');
  providers.forEach(p => {
    if (!_.isFunction(p)) throw new Error('root.renderChildren should be a function.');
    children = p(children);
  });
  return children;
};

const routerMap = {
  browser: createBrowserRouter,
  hash: createHashRouter,
  memory: createMemoryRouter,
};

const Root = () => {
  const [subAppContext, setSubAppContext] = useState(null);

  const handleMsg = useCallback(msg => {
    if (msg.type === 'sub-app-context-change') {
      // Allows parent to send data to children
      setSubAppContext(msg.data);
    }
  }, []);

  useEffect(() => {
    const k = 'muse-react_handle-context-change';
    window.MUSE_GLOBAL?.msgEngine?.addListener(k, handleMsg);
    return () => window.MUSE_GLOBAL?.msgEngine?.removeListener(k);
  }, [handleMsg]);

  const children = renderRouteConfigV3(routeConfig(), '/');
  const ele = renderChildren(children);

  const { routerType = 'browser', basePath } = window.MUSE_GLOBAL.appVariables || {};
  const Router = routerMap[routerType](createRoutesFromElements(ele));
  const routerProps = plugin.invoke('!routerProps')[0] || {};
  if (routerType === 'browser') {
    routerProps.navigator = history;
  }
  const providers = [
    {
      order: 10,
      key: 'react-query',
      provider: QueryClientProvider,
      props: { client: queryClient },
      renderProvider: null,
    },
    {
      order: 20,
      key: 'redux-provider',
      provider: Provider,
      props: { store: store.getStore() },
    },
    {
      order: 30,
      key: 'muse-sub-app',
      provider: SubAppContext.Provider,
      props: { value: subAppContext },
    },
    {
      order: 40,
      key: 'nice-modal',
      provider: NiceModal.Provider,
    },
    {
      order: 50,
      key: 'react-router',
      provider: RouterProvider,
      props: {
        basename: basePath,
        router: Router,
        ...routerProps,
      },
    },
  ];

  extendArray(providers, 'providers', 'root', { providers });

  return providers.filter(Boolean).reduceRight((p, c) => {
    if (c.provider)
      return (
        <c.provider key={p?.key} {...c.props}>
          {p}
        </c.provider>
      );
    else if (c.renderProvider) return c.renderProvider(p);
    return p;
  }, <></>);
};

export default Root;
