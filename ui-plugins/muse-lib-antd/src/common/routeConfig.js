import commonRoute from '../features/common/route';

// NOTE: DO NOT CHANGE the 'childRoutes' name and the declaration pattern.
// This is used for Rekit cmds to register routes config for new features, and remove config when remove features, etc.
const childRoutes = [ commonRoute];

const routes = [
  {
    path: '/plugin-muse-antd',
    childRoutes: [...childRoutes].filter(
      r => r.component || (r.childRoutes && r.childRoutes.length > 0),
    ),
  },
];

export default routes;
