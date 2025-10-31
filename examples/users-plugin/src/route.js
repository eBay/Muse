import UserList from './components/UserList';
import UserDetail from './components/UserDetail'; 

/**
 * A route items is in shape of:
 * {
 *   path: '/some-path',
 *   component: SomeComponent,
 * }
 */
const route = {
  childRoutes: [
    { path: '/users', component: UserList },
    { path: '/users/:id', component: UserDetail },
  ],
};
export default route;
