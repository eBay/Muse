import { usePollingMuseData } from '../../hooks';
import _ from 'lodash';
import { Tag } from 'antd';
import { Loading3QuartersOutlined } from '@ant-design/icons';
import NiceModal from '@ebay/nice-modal-react';
function PluginStatus({ plugin }) {
  const { data: requests } = usePollingMuseData('muse.requests', { interval: 10000 });

  const onTagClick = (request, status) => {
    NiceModal.show('muse-manager.request-detail-modal', { request, status });
  };
  return _.flatten(
    requests?.map(req => {
      if (req?.payload?.pluginName === plugin.name) {
        return req.statuses?.map(s => {
          const color = {
            failure: 'error',
            success: 'success',
            pending: 'processing',
          }[s.state];

          const icon = color === 'processing' ? <Loading3QuartersOutlined spin /> : null;
          return (
            <Tag
              key={req.id + '_' + s.name}
              icon={icon}
              style={{ cursor: 'pointer' }}
              color={color}
              onClick={() => onTagClick(req, s)}
            >
              {s.message || s.name + ' ' + s.state}
            </Tag>
          );
        });
      }
      return null;
    }),
  ).filter(Boolean);
}
export default PluginStatus;
