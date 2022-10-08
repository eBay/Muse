import RoleList from './components/RoleList';

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
  ],
};
export default route;
