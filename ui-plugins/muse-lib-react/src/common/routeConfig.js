import React from 'react';
import plugin from 'js-plugin';
import { App, Homepage } from '../features/home';
import { PageNotFound } from '../features/common';
import homeRoute from '../features/home/route';
import commonRoute from '../features/common/route';
import _ from 'lodash';
import userRoute from '../features/user/route';
import subAppRoute from '../features/sub-app/route';

// NOTE: DO NOT CHANGE the 'childRoutes' name and the declaration pattern.
// This is used for Rekit cmds to register routes config for new features, and remove config when remove features, etc.
const childRoutes = [homeRoute, commonRoute, userRoute, subAppRoute];

// Handle isIndex property of route config:
//  Dupicate it and put it as the first route rule.
function handleIndexRoute(route) {
  if (!route.childRoutes || !route.childRoutes.length) {
    return;
  }

  const indexRoute = _.find(route.childRoutes, child => child.isIndex);
  if (indexRoute) {
    const first = { ...indexRoute };
    first.path = '';
    first.exact = true;
    first.autoIndexRoute = true; // mark it so that the simple nav won't show it.
    route.childRoutes.unshift(first);
  }
  route.childRoutes.forEach(handleIndexRoute);
}

// routes.forEach(handleIndexRoute);

function handleParentRoutes(routes) {
  const byId = {};
  const arr = [...routes];
  const hasParent = [];
  // traverse routes recursively
  while (arr.length > 0) {
    const r = arr.shift();

    if (r?.id) {
      byId[r.id] = r;
    }
    if (r.childRoutes) {
      arr.push(...r.childRoutes);
      // find all routes which have parents
      [...r.childRoutes].forEach(cr => {
        if (cr.parent) {
          hasParent.push(cr);
          _.pull(r.childRoutes, cr);
        }
      });
    }
  }

  // for all routes which have parents, put them in the correct childRoutes
  hasParent.forEach(r => {
    const parentId = r.parent;
    if (byId[parentId]) {
      if (!byId[parentId].childRoutes) byId[parentId].childRoutes = [];
      byId[parentId].childRoutes.unshift(r);
    } else {
      console.warn(`Warning: no parent route found with id ${parentId}.`, r);
    }
  });
}

const normalizeRoutes = routes => {
  const byId = {};
  const arr = [...routes];
  const hasParent = [];

  // traverse routes recursively
  while (arr.length > 0) {
    const r = arr.shift();
    // allow a route point to a parent
    if (r?.id) {
      byId[r.id] = r;
    }
    if (r.childRoutes) {
      _.forEachRight([...r.childRoutes], (cr, i) => {
        // Support path as an array by expanding it to multiple rules
        if (_.isArray(cr?.path)) {
          r.childRoutes.splice(
            i,
            1,
            ...cr.path.map(p => {
              return { ...r, path: p };
            }),
          );
        }
      });
      arr.push(...r.childRoutes);
      [...r.childRoutes].forEach(cr => {
        // if a route has parent, move it to the correct parent
        if (cr?.path?.startsWith('/')) {
          // If it's an absolute path, move it to the top level
          _.pull(r.childRoutes, cr);
          routes.unshift(cr);
        } else if (cr.parent) {
          hasParent.push(cr);
          _.pull(r.childRoutes, cr);
        }
      });
    }
  }

  // for all routes which have parents, put them in the correct childRoutes
  hasParent.forEach(r => {
    const parentId = r.parent;
    if (byId[parentId]) {
      if (!byId[parentId].childRoutes) byId[parentId].childRoutes = [];
      byId[parentId].childRoutes.unshift(r);
    } else {
      console.warn(`Warning: no parent route found with id ${parentId}.`, r);
    }
  });
};

const routeConfig = () => {
  const newChildRoutes = [...childRoutes];
  // Get routes from plugins
  plugin.invoke('!route').forEach(route => {
    newChildRoutes.push(..._.castArray(route));
  });

  // Generate the root route '/'
  const museGlobal = window.MUSE_GLOBAL || {};

  // Find the homepage
  let homepage = Homepage;
  const homepagePlugins = plugin.getPlugins('home.homepage');
  if (homepagePlugins.length === 1) {
    homepage = homepagePlugins[0].home.homepage;
  } else if (homepagePlugins.length > 1) {
    const definedHomepagePlugin = _.find(homepagePlugins, { name: museGlobal.homepage });
    if (definedHomepagePlugin) homepage = definedHomepagePlugin.home.homepage;
    else {
      homepage = () => (
        <div style={{ color: 'red', padding: '20px' }}>
          Failed to show homepage: multiple homepages found from:{' '}
          {homepagePlugins.map(p => p.name).join(', ')}. You should load only one plugin which
          defines homepage.
        </div>
      );
    }
  }

  newChildRoutes.unshift({
    path: '',
    component: homepage,
  });

  const routes = [
    {
      path: '/',
      component: App,
      childRoutes: [
        ..._.cloneDeep(newChildRoutes),
        { path: '*', name: 'Page not found', component: PageNotFound },
      ].filter(r => r.component || r.render || (r.childRoutes && r.childRoutes.length > 0)),
    },
  ];
  routes.forEach(handleIndexRoute);

  // Handle parent routes
  normalizeRoutes(routes[0].childRoutes);

  return routes;
};
export default routeConfig;
