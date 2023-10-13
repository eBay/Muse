import ItemPage from './features/home/ItemPage';
import Homepage from './features/home/Homepage';

const route = {
  childRoutes: [
    {
      path: '/*',
      component: Homepage,
      childRoutes: [
        {
          path: ':currentItemId/:tabKey',
          component: ItemPage,
        },
        {
          path: ':currentItemId',
          component: ItemPage,
        },
      ],
    },
  ],
};
export default route;
