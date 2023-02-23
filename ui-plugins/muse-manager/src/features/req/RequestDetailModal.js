import _ from 'lodash';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, Tag, Form } from 'antd';
import NiceForm from '@ebay/nice-form-react';
// import FormBuilder from 'antd-form-builder';
import prettyMs from 'pretty-ms';
import TimeAgo from 'react-time-ago';
import utils from '@ebay/muse-lib-antd/src/utils';
import CiOutput from '../common/CiOutput';

const RequestDetailModal = NiceModal.create(({ request, status }) => {
  const modal = useModal();
  const [form] = Form.useForm();
  const meta = {
    columns: 2,
    viewMode: true,
    initialValues: { ...request, status },
    fields: [
      {
        key: 'payload.pluginName',
        label: 'Plugin name',
      },
      {
        key: 'payload.buildBranch',
        label: 'Build branch',
      },
      {
        key: 'payload.newVersion',
        label: 'New Version',
      },
      {
        key: 'status.buildNumber',
        label: 'Build',
        renderView: (buildNumber) => {
          return buildNumber ? (
            <a href={`${status.ci}`} target="_blank" rel="noreferrer">
              #{buildNumber}
            </a>
          ) : (
            'N/A'
          );
        },
      },
      {
        key: 'createdBy',
        label: 'Triggered by',
      },
      {
        key: 'status',
        label: 'Status',
        renderView: (status) => {
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
        renderView: (timestamp) => {
          console.log(timestamp);
          return timestamp ? <TimeAgo date={new Date(timestamp)} /> : 'N/A';
        },
      },
      {
        key: 'duration',
        label: 'Duration',
        renderView: (duration) => (duration ? prettyMs(duration) : 'N/A'),
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

  // plugin.invoke('museManager.requestDetailModal.processFormMeta', meta, { request, status, modal });
  utils.extendFormMeta(meta, 'museManager.requestDetailForm', {
    meta,
    request,
    status,
    modal,
  });
  const updateOnChange = NiceForm.useUpdateOnChange('*');
  return (
    <Modal
      {...antdModalV5(modal)}
      okButtonProps={{ style: { display: 'none' } }}
      cancelText="Close Dialog"
      title={_.startCase(request.type)}
      width="800px"
      maskClosable={false}
    >
      <Form form={form}>
        <NiceForm meta={meta} />
      </Form>
    </Modal>
  );
});
export default RequestDetailModal;
