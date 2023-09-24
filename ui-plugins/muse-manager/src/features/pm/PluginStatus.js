import { usePollingMuseData } from '../../hooks';
import _ from 'lodash';
import { Tag } from 'antd';
import { Loading3QuartersOutlined } from '@ant-design/icons';
import NiceModal from '@ebay/nice-modal-react';
import Nodes from '../common/Nodes';

function PluginStatus({ plugin, app }) {
  const { data: requests } = usePollingMuseData('muse.requests', { interval: 10000 });
  const onTagClick = (request, status) => {
    NiceModal.show('muse-manager.request-detail-modal', { request, status });
  };
  const tags = [];
  requests
    ?.filter((req) => req?.payload?.pluginName === plugin.name)
    .forEach((req) => {
      req.statuses?.forEach((s, i) => {
        const color = {
          failure: 'error',
          success: 'success',
          pending: 'processing',
        }[s.state];

        const icon = color === 'processing' ? <Loading3QuartersOutlined spin /> : null;
        tags.push({
          key: `${req.id}_${s.name}`,
          order: i * 10 + 10,
          component: Tag,
          props: {
            icon,
            style: { cursor: 'pointer' },
            color,
            onClick: () => onTagClick(req, s),
            children: s.message || s.name + ' ' + s.state,
          },
        });
      });
    });

  return (
    <div className="grid gap-1 justify-items-start">
      <Nodes
        items={tags}
        extBase="museManager.pm.pluginStatus"
        extArgs={{ items: tags, plugin, app, requests }}
      />
    </div>
  );
}
export default PluginStatus;
