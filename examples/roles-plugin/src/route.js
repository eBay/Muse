import RoleList from './components/RoleList';
import RoleDetail from './components/RoleDetail';

/**
 * A route items is in shape of:
 * {
 *   path: '/some-path',
 *   component: SomeComponent,
 * }
 */
const route = {
  childRoutes: [
    {
      path: '/roles',
      component: RoleList,
    },
    {
      path: '/roles/:id',
      component: RoleDetail,
    },
  ],
};
export default route;
