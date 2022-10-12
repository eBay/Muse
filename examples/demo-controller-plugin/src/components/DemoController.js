import { Button, Popover, Switch, Alert } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useSessionStorage } from 'react-use';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import './DemoController.less';
import MovingEyes from './MovingEyes';
const plugins = [
  {
    name: 'demo-init-plugin',
    description: 'Hook to the plugin loader to exclude some plugins.',
    alwaysLoad: true,
  },
  {
    name: 'demo-controller-plugin',
    description: 'Provide this UI in the header to allow select plugins.',
    alwaysLoad: true,
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

export const PluginsSelector = () => {
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

  return (
    <div className="plugins-selector">
      <section className="move-area"></section>
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

const Title = () => {
  const msg = (
    <span>
      This is the demo controller. You can select which plugins to load in the page, then see what's
      the difference. To see more introduction, read docs <Link to="/docs">here</Link>.
    </span>
  );
  return <Alert type="info" className="plugin-selector-header" message={msg} />;
};
const DemoController = () => {
  return (
    <Popover
      content={<PluginsSelector />}
      title={<Title />}
      placement="bottom"
      className="demo-controller"
      trigger="hover"
    >
      <MovingEyes />
      <label>Select Plugins</label>
      <DownOutlined />
    </Popover>
  );
};

export default DemoController;
