/* This is the Root component mainly initializes Redux and React Router. */

import React, { useState, useEffect, useCallback } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import _ from 'lodash';
import { hot } from 'react-hot-loader/root';
import NiceModal from '@ebay/nice-modal-react';
import plugin from 'js-plugin';
import store from './common/store';
import routeConfig from './common/routeConfig';
import history from './common/history';
import SubAppContext from './features/sub-app/SubAppContext';

function renderRouteConfigV3(routes, contextPath) {
  // Resolve route config object in React Router v3.
  const children = []; // children component list

  const renderRoute = (item, routeContextPath) => {
    let newContextPath;
    const isPathArray = _.isArray(item.path);
    if (/^\//.test(item.path) || isPathArray) {
      newContextPath = item.path;
    } else {
      newContextPath = `${routeContextPath}/${item.path}`;
    }
    if (!isPathArray) newContextPath = newContextPath.replace(/\/+/g, '/');
    if ((item.render || item.component) && item.childRoutes) {
      const childRoutes = renderRouteConfigV3(item.childRoutes, newContextPath);
      children.push(
        <Route
          key={newContextPath.toString()}
          render={(props) =>
            item.render ? (
              item.render(props)
            ) : (
              <item.component {...props}>{childRoutes}</item.component>
            )
          }
          path={newContextPath}
        />,
      );
    } else if (item.component || item.render) {
      children.push(
        <Route
          key={newContextPath.toString()}
          render={(props) => (item.render ? item.render(props) : <item.component {...props} />)}
          path={newContextPath}
          exact={'exact' in item ? item.exact : true}
        />,
      );
    } else if (item.childRoutes) {
      item.childRoutes.forEach((r) => renderRoute(r, newContextPath));
    }
  };

  routes.forEach((item) => renderRoute(item, contextPath));

  // Use Switch so that only the first matched route is rendered.
  return <Switch>{children}</Switch>;
}

const renderChildren = (children) => {
  const providers = plugin.invoke('!root.renderChildren');
  providers.forEach((p) => {
    if (!_.isFunction(p)) throw new Error('root.renderChildren should be a function.');
    children = p(children);
  });
  return children;
};

const WrappedInRedux = () => {
  const children = renderRouteConfigV3(routeConfig(), '/');
  const dispatch = useDispatch();
  const modals = useSelector((s) => s.modals);
  return (
    <NiceModal.Provider dispatch={dispatch} modals={modals}>
      <ConnectedRouter history={history}>{renderChildren(children)}</ConnectedRouter>
    </NiceModal.Provider>
  );
};

const Root = () => {
  const [subAppContext, setSubAppContext] = useState(null);
  const handleMsg = useCallback((msg) => {
    if (msg.type === 'sub-app-context-change') {
      setSubAppContext(msg.data);
    }
  }, []);
  useEffect(() => {
    window.MUSE_CONFIG?.msgEngine?.addListener('sub-app-context-change', handleMsg);
    return () => window.MUSE_CONFIG?.msgEngine?.removeListener('sub-app-context-change');
  }, [handleMsg]);

  return (
    <Provider store={store.getStore()}>
      <SubAppContext.Provider value={subAppContext}>
        <WrappedInRedux />
      </SubAppContext.Provider>
    </Provider>
  );
};

export default hot(Root);
