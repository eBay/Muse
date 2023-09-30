import { useCallback, useMemo } from 'react';
import { usePollingMuseData } from '../../hooks';
import { Tag } from 'antd';
import _ from 'lodash';
import jsPlugin from 'js-plugin';
import { Loading3QuartersOutlined, ClockCircleOutlined } from '@ant-design/icons';
import NiceModal from '@ebay/nice-modal-react';
import RequestDetailModal from '../req/RequestDetailModal';
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
const ModalHolder = ({ modal, handler = {}, ...restProps }) => {
  const mid = useMemo(() => `req_modal_${Math.random()}`, []);
  const ModalComp = modal;

  if (!handler) {
    throw new Error('No handler found in NiceModal.ModalHolder.');
  }
  if (!ModalComp) {
    throw new Error(`No modal found for id: ${modal} in NiceModal.ModalHolder.`);
  }
  handler.show = useCallback((args) => NiceModal.show(mid, args), [mid]);
  handler.hide = useCallback(() => NiceModal.hide(mid), [mid]);

  return <ModalComp id={mid} {...restProps} />;
};

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

      const modalHanlder = {};
      const tagProps = {
        message,
        state,
        onClick: () => modalHanlder.show(),
      };

      return {
        order: i * 10 + 10,
        node: (
          <span key={req.id}>
            <ModalHolder modal={RequestDetailModal} handler={modalHanlder} request={req} />
            <StatusTag {...tagProps} />
          </span>
        ),
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
