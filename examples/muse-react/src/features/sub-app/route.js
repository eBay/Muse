// This is the JSON way to define React Router rules in a Rekit app.
// Learn more from: http://rekit.js.org/docs/routing.html
import React from 'react';
import route from '../home/route';
import { SubAppContainer } from './';

// Get sub app route defined in muse-react plugin
const subAppsRoute = [];
const pMuseReact = window.MUSE_GLOBAL?.pluginList?.find((p) => p.id === 'muse-react');
// pMuseReact.config = {
//   subApps: [
//     {
//       name: 'musedemo',
//       path: '/demo',
//       // persist: true,
//       url: 'https://demo.muse.qa.ebay.com',
//       // url: 'http://local.cloud.ebay.com:3031',
//       // url: 'https://sam.muse.vip.ebay.com',
//       // url: 'https://besconsole.muse.qa.ebay.com',
//     },
//   ],
// };

pMuseReact?.config?.subApps?.forEach((subApp) => {
  // check app allowlist
  if (subApp.name && window.MUSE_GLOBAL?.allowlistByApp && window.MUSE_CURRENT_USER) {
    const allowlist = window.MUSE_GLOBAL?.allowlistByApp[subApp.name];
    if (
      allowlist &&
      allowlist.length &&
      allowlist.includes &&
      !allowlist.includes(window.MUSE_CURRENT_USER.username)
    ) {
      // user is not allowed to access the app
      return;
    }
  }
  subAppsRoute.push({
    path: subApp.path, //[subApp.path, subApp.path + '/*'],
    exact: false,
    component: () => <SubAppContainer subApps={pMuseReact?.config?.subApps || []} />,
  });
});

const exportedRoute = {
  path: 'sub-app',
  childRoutes: [...subAppsRoute],
};

export default exportedRoute;
