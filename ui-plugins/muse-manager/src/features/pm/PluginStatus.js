import { useCallback, useMemo } from 'react';
import { usePollingMuseData } from '../../hooks';
import { Tag } from 'antd';
import _ from 'lodash';
import jsPlugin from 'js-plugin';
import { Loading3QuartersOutlined, ClockCircleOutlined } from '@ant-design/icons';
import NiceModal from '@ebay/nice-modal-react';
import Nodes from '../common/Nodes';

const StatusTag = ({ message, state, ...rest }) => {
  const color = {
    failure: 'error',
    success: 'success',
    pending: 'processing',
    running: 'processing',
    waiting: 'cyan',
  }[state];

  const icon =
    {
      pending: <Loading3QuartersOutlined spin />,
      running: <Loading3QuartersOutlined spin />,
      waiting: <ClockCircleOutlined />,
    }[state] || null;
  return (
    <Tag color={color} style={{ cursor: 'pointer' }} icon={icon} {...rest}>
      {message}
    </Tag>
  );
};

const stateOrder = { failure: 1, pending: 2, running: 3, waiting: 4, success: 5 };

function PluginStatus({ plugin, app }) {
  const { data: requests = [] } = usePollingMuseData({ interval: 10000 }, 'muse.requests');

  const tags = requests
    ?.filter(
      (req) =>
        req?.payload?.pluginName === plugin.name ||
        jsPlugin
          .invoke('museManager.pm.pluginStatus.relatedToPlugin', { plugin, app, request: req })
          .some((b) => b),
    )
    .map((req, i) => {
      req = _.clone(req);
      jsPlugin.invoke('museManager.pm.pluginStatus.processRequest', { request: req, app, plugin });
      const statuses = req.statuses || [];
      statuses.sort((a, b) => (stateOrder[a.state] || 1000) - (stateOrder[b.state] || 1000));

      const message =
        req.status?.message ||
        `${req.type}: ${statuses?.map((s) => s.message || s.name + ' ' + s.state).join(', ')}.`;

      const state = req.status?.state || statuses[0]?.state;

      const tagProps = {
        message,
        state,
        onClick: () => NiceModal.show('muse-manager.request-detail-modal', { requestId: req.id }),
      };

      return {
        order: i * 10 + 10,
        node: <StatusTag key={req.id} {...tagProps} />,
      };
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
