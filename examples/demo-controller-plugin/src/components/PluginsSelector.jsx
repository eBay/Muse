import { Button, Switch } from 'antd';
import { useSessionStorage } from 'react-use';
import { Link } from 'react-router-dom';
import _ from 'lodash';
const plugins = [
  // {
  //   name: 'demo-init-plugin',
  //   description: 'Hook to the plugin loader to exclude some plugins.',
  //   alwaysLoad: true,
  // },
  // {
  //   name: 'demo-controller-plugin',
  //   description: 'Provide this UI in the header to allow select plugins.',
  //   alwaysLoad: true,
  // },
  {
    name: '@ebay/muse-layout-antd',
    description: 'Provides the main layout for other plugins to extend.',
    alwaysLoad: false,
  },
  {
    name: '@ebay/muse-dashboard',
    description: 'A reusable dashboard plugin allows you to create dashboard pages easily.',
    alwaysLoad: false,
  },
  {
    name: 'users-plugin',
    description: 'A simple feature for user info management.',
    alwaysLoad: false,
  },
  {
    name: 'roles-plugin',
    description: 'A simple roles management feature to user profile. ',
    alwaysLoad: false,
  },
  {
    name: 'doc-plugin',
    description: 'Provide some docs/introductions for the Muse sample app.',
    alwaysLoad: false,
  },
];
const PluginsSelector = () => {
  const [strExcluded, setExcluded] = useSessionStorage('muse-demo:excluded-plugins', '[]', true);
  let excluded = [];
  try {
    excluded = JSON.parse(strExcluded);
  } catch (err) {
    excluded = [];
  }
  if (!_.isArray(excluded)) excluded = [];

  const selectPlugin = (selected, name) => {
    if (selected) {
      _.pull(excluded, name);
    } else {
      if (!excluded.includes(name)) excluded.push(name);
    }
    setExcluded(JSON.stringify(excluded));
  };
  const msg = (
    <div>
      This is the demo controller. You can select which plugins to load in the page, then see the
      difference (remember to open dev console to see what bundles are loaded). To see more
      introduction, read docs <Link to="/docs">here</Link>.
    </div>
  );
  return (
    <div className="plugins-selector">
      <p style={{ color: 'gray' }}>
        Select which plugins are loaded on the page to see the difference.
      </p>
      <ul>
        {plugins.map(p => (
          <li key={p.name}>
            <label>{p.name}</label>
            <p>{p.description}</p>
            <Switch
              disabled={p.alwaysLoad}
              checked={!excluded.includes(p.name)}
              onChange={selected => selectPlugin(selected, p.name)}
            />
          </li>
        ))}
      </ul>
      <Button type="primary" onClick={() => window.location.reload()}>
        Reload Page
      </Button>
    </div>
  );
};

export default PluginsSelector;
