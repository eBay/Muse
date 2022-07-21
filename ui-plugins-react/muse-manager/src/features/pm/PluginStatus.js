import { useMuseData } from '../../hooks/useMuse';
import _ from 'lodash';
import { Tag } from 'antd';
import { Loading3QuartersOutlined } from '@ant-design/icons';

function PluginStatus({ plugin }) {
  const { data: requests } = useMuseData('muse.requests');

  return _.flatten(
    requests?.map(req => {
      if (req?.payload?.pluginName === plugin.name) {
        return req.statuses?.map(s => {
          const color = {
            failed: 'error',
            success: 'success',
            error: 'error',
            pending: 'processing',
            building: 'processing',
            queued: 'processing',
          }[s.state];

          const icon = color === 'processing' ? <Loading3QuartersOutlined spin /> : null;
          return (
            <Tag icon={icon} style={{ cursor: 'pointer' }} color={color}>
              {s.description || s.name + ' ' + s.state}
            </Tag>
          );
        });
      }
    }),
  ).filter(Boolean);
}
export default PluginStatus;
