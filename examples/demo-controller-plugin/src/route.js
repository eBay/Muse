import { PluginsSelector } from './components/DemoController';

/**
 * A route items is in shape of:
 * {
 *   path: '/some-path',
 *   component: SomeComponent,
 * }
 */
const route = {
  childRoutes: [{ path: '/demo-controller', component: PluginsSelector }],
};
export default route;
