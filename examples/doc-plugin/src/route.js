import Docs from './components/Docs';

/**
 * A route items is in shape of:
 * {
 *   path: '/some-path',
 *   component: SomeComponent,
 * }
 */
const route = {
  childRoutes: [{ path: '/docs', component: Docs }],
};
export default route;
