import React from 'react';
import { SubAppContainer } from './';

// Get sub app route defined in muse-react plugin
const subAppsRoute = [];
const pMuseLibReact = window.MUSE_GLOBAL?.plugins?.find(p => p.name === '@ebay/muse-lib-react');
// pMuseLibReact.config = {
//   subApps: [
//     {
//       mountPoint: 'default',
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
console.log('found react plugin: ', pMuseLibReact);
pMuseLibReact?.subApps
  ?.filter(s => s.mountPoint === 'default' || !s.mountPoint)
  ?.forEach(subApp => {
    console.log('pushing sub app route: ', subApp);
    subAppsRoute.push({
      path: subApp.path + '/*',
      component: () => (
        <SubAppContainer
          key={subApp.url}
          subApps={pMuseLibReact?.config?.subApps || []}
          subApp={subApp}
        />
      ),
    });
  });

const exportedRoute = {
  path: 'sub-app',
  childRoutes: [...subAppsRoute],
};

export default exportedRoute;
