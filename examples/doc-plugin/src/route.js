import Docs from './components/Docs';
import { Link } from 'react-router-dom';
/**
 * A route items is in shape of:
 * {
 *   path: '/some-path',
 *   component: SomeComponent,
 * }
 */
const route = [{ path: '/docs', component: () => <Link to="aa">link</Link> }];
export default route;
