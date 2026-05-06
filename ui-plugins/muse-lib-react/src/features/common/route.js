// This is the JSON way to define React Router rules in a Rekit app.
// Learn more from: http://rekit.js.org/docs/routing.html

import HelloWorld from './HelloWorld';

export default {
  path: 'common',
  name: 'Common',
  childRoutes: [
    {
      path: '/hello',
      name: 'Hello World',
      component: HelloWorld,
    },
  ],
};
