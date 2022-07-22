import { usePollingMuseData } from '../../hooks/useMuse';
import _ from 'lodash';
import { Tag } from 'antd';
import { Loading3QuartersOutlined } from '@ant-design/icons';

function PluginStatus({ plugin }) {
  const { data: requests } = usePollingMuseData('muse.requests');

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
            <Tag icon={icon} style={{ cursor: 'pointer' }} color={color}>
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
