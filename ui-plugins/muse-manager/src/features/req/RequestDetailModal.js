import _ from 'lodash';
import NiceModal, { useModal, antdModal } from '@ebay/nice-modal-react';
import { Modal, Tag } from 'antd';
import FormBuilder from 'antd-form-builder';
import prettyMs from 'pretty-ms';
import TimeAgo from 'react-time-ago';
import plugin from 'js-plugin';
import CiOutput from '../common/CiOutput';

const RequestDetailModal = NiceModal.create(({ request, status }) => {
  const modal = useModal();
  const meta = {
    columns: 2,
    initialValues: { ...request, status },
    elements: [
      {
        key: 'payload.pluginName',
        label: 'Plugin name',
      },
      {
        key: 'branch',
        label: 'Build branch',
      },
      {
        key: 'version',
        label: 'New Version',
      },
      {
        key: 'number',
        label: 'Build',
      },
      {
        key: 'createdBy',
        label: 'Triggered by',
      },
      {
        key: 'status',
        label: 'Status',
        renderView: status => {
          const color = {
            success: 'success',
            failure: 'error',
            pending: 'processing',
          }[status.state];
          return <Tag color={color}>{status?.message || status.state}</Tag>;
        },
      },
      {
        key: 'createdAt',
        label: 'Started at',
        renderView: timestamp => {
          return timestamp ? <TimeAgo date={new Date(timestamp)} /> : 'N/A';
        },
      },
      {
        key: 'duration',
        label: 'Duration',
        renderView: duration => (duration ? prettyMs(duration) : 'N/A'),
      },
      {
        key: 'consoleOutput',
        label: 'Console output',
        colSpan: 2,
        viewWidget: CiOutput,
        viewWidgetProps: status,
      },
    ],
  };

  plugin.invoke('museManager.requestDetailModal.processFormMeta', meta, { request, status, modal });

  return (
    <Modal
      {...antdModal(modal)}
      okButtonProps={{ style: { display: 'none' } }}
      cancelText="Close Dialog"
      title={_.startCase(request.type)}
      width="800px"
      maskClosable={false}
    >
      <FormBuilder viewMode meta={meta} />
    </Modal>
  );
});
export default RequestDetailModal;
