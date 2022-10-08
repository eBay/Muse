import UserList from './components/UserList';

/**
 * A route items is in shape of:
 * {
 *   path: '/some-path',
 *   component: SomeComponent,
 * }
 */
const route = {
  childRoutes: [{ path: '/users', component: UserList }],
};
export default route;
