import { extendArray } from '@ebay/muse-lib-antd/src/utils';
import _ from 'lodash';
import './PluginBadges.less';

const PluginBadges = ({ app, plugin }) => {
  if (!plugin) return null;

  const nodes = [];
  if (app && (app.pluginConfig?.[plugin.name]?.core || plugin.type !== 'normal')) {
    nodes.push({
      order: 10,
      node: (
        <span
          key="core"
          className="plugin-badge-core"
          title="Core plugin, it will be always loaded for local development."
        >
          C
        </span>
      ),
    });
  }

  if (app && !_.isEmpty(app.pluginConfig?.[plugin.name]?.allowlist)) {
    nodes.push({
      order: 20,
      node: (
        <span key="allowlist" className="plugin-badge-allowlist" title="Allowlist defined.">
          A
        </span>
      ),
    });
  }
  // console.log(jsPlugin.invoke('museManager.pm.pluginList.getPluginBadges', {}));
  extendArray(nodes, 'nodes', 'museManager.pm.pluginList.pluginBadges', { app, plugin, nodes });
  return (
    <span className="muse-manager_pm-plugin-badges">
      {nodes.filter(Boolean).map((n) => n.node)}
    </span>
  );
};

export default PluginBadges;
