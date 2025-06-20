import React from 'react';
import plugin from 'js-plugin';
import useParentRouteChange from '../sub-app/hooks/useParentRouteChange';

export default function App({ children }) {
  // home.rootComponent is used to define some global placeholder for something like Modals, Drawers, etc.
  const rootComponentPlugins = plugin.getPlugins('rootComponent');

  // home.mainLayout is used to define the main layout component
  const layouts = plugin.invoke('!home.mainLayout');
  useParentRouteChange();
  if (layouts.length > 1) {
    const ids = plugin.getPlugins('home.mainLayout').map(p => p.name);
    return (
      <div style={{ color: 'red', margin: '20px' }}>
        Error: multiple layouts found from plugins: {ids.join(', ')}. Each application should only
        have one main layout.
      </div>
    );
  }
  const Layout = layouts[0];
  const ele = Layout ? <Layout>{children}</Layout> : children;
  return (
    <div className="home-app muse-app">
      <div className="muse-app_main-page-container">{ele}</div>
      <div className="muse-app_plugin-root-placeholder">
        {rootComponentPlugins.map(p => (
          <p.rootComponent key={p.name} />
        ))}
      </div>
    </div>
  );
}
