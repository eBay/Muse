import NiceModal, { antdModalV5 } from '@ebay/nice-modal-react';
import NiceForm from '@ebay/nice-form-react';
import { Modal, Form } from 'antd';
import { extendFormMeta } from '@ebay/muse-lib-antd/src/utils';
import TimeAgo from 'react-time-ago';
import Nodes from '../common/Nodes';

const LatestReleaseInfoModal = NiceModal.create(({ latestRelease, app, plugin }) => {
  const modal = NiceModal.useModal();
  const [form] = Form.useForm();
  const extArgs = {
    form,
    modal,
    latestRelease,
    app,
    plugin,
  };
  const meta = {
    viewMode: true,
    columns: 2,
    initialValues: latestRelease,
    fields: [
      {
        key: 'version',
        label: 'Version',
        colSpan: 2,
      },
      {
        key: 'createdAt',
        label: 'Started at',
        viewWidget: ({ value }) => {
          return value ? <TimeAgo date={new Date(value).getTime()} /> : 'N/A';
        },
      },
      {
        key: 'createdBy',
        label: 'Triggered by',
      },
    ],
  };

  const bodyNodes = [
    {
      key: 'nice-form',
      order: 20,
      node: (
        <Form form={form}>
          <NiceForm meta={meta}></NiceForm>
        </Form>
      ),
    },
  ];

  extendFormMeta(meta, 'museManager.pm.latestReleaseInfoModal.form', {
    meta,
    form,
    latestRelease,
    app,
    plugin,
  });

  return (
    <Modal
      {...antdModalV5(modal)}
      width={650}
      title={`Latest Release Details of ${plugin.name}`}
      okText="Close"
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      <Nodes
        items={bodyNodes}
        extName="items"
        extBase="museManager.pm.latestReleaseInfoModal.body"
        extArgs={{ items: bodyNodes, ...extArgs }}
      />
    </Modal>
  );
});

export default LatestReleaseInfoModal;
