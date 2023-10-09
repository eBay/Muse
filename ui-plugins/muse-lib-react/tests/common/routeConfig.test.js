import React from 'react';
import routeConfig from '../../src/common/routeConfig';
import plugin from 'js-plugin';

describe('routeConfig tests', () => {

    beforeEach(() => {
        if (plugin.getPlugin('myplugin')) { plugin.unregister('myplugin') };        
      });

    it('default test', () => {
        expect(routeConfig).toBeTruthy();
    });

    it('normalizes routes', () => {
        plugin.register({
            name: 'myplugin',
            home: {
              homepage: () => {return <div>homepage 1</div>}
            },
            route: {
                path: '/myplugin',
                isIndex: true,
                component: <span>My Plugin</span>,
                childRoutes: [
                  {
                    path: 'foo',
                    component: <span>Foo</span>,
                    id: 'fooRule',
                    childRoutes: [
                      {
                        path: 'bar',
                        component: <span>Bar</span>,
                      },
                    ],
                  },
                  { path: '/abs-route', component: <span>Comp1</span> },
                  { path: 'foo-child', parent: 'fooRule', component: <span>Comp2</span> },
                ],
              }
          });

          const routes = routeConfig();
          const indexRouteChild = routes[0].childRoutes.find(r => r.isIndex === true).childRoutes;

          // this comes from the jest mock setup on /tests/setupAfterEnv.js
          const subAppDemoRoute = routes[0].childRoutes.find(r => r.path === '/demo/*');
          expect(subAppDemoRoute).toBeTruthy();
          
          const fooChildNormalized = indexRouteChild.find(c => c.id === 'fooRule').childRoutes.find(cr => cr.path === 'foo-child');
          expect(fooChildNormalized).toBeTruthy();

    });
});