import homeRoute from '../features/home/route';

// NOTE: DO NOT CHANGE the 'childRoutes' name and the declaration pattern.
// This is used for Rekit cmds to register routes config for new features, and remove config when remove features, etc.
const childRoutes = [homeRoute];

const routes = [
  {
    path: '/plugin-muse-layout',
    childRoutes: [...childRoutes].filter(
      (r) => r.component || (r.childRoutes && r.childRoutes.length > 0),
    ),
  },
];

export default routes;
