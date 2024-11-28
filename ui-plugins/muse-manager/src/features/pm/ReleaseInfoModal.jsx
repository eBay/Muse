import NiceModal, { antdModalV5 } from '@ebay/nice-modal-react';
import NiceForm from '@ebay/nice-form-react';
import { Modal, Form } from 'antd';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { extendFormMeta } from '@ebay/muse-lib-antd/src/utils';
import TimeAgo from 'react-time-ago';
import Nodes from '../common/Nodes';
import { useMuseData } from '../../hooks';
import NA from '../common/NA';

const ReleaseInfoModal = NiceModal.create(({ release, app, plugin, version }) => {
  const modal = NiceModal.useModal();
  const [form] = Form.useForm();
  const { data: releases, isFetching } = useMuseData(
    { enabled: !release },
    `muse.plugin-releases.${plugin.name}`,
  );
  release = release || releases?.find((r) => r.version === version);
  const extArgs = {
    form,
    modal,
    release,
    app,
    plugin,
  };
  const meta = {
    viewMode: true,
    columns: 2,
    initialValues: release,
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
          return value ? <TimeAgo date={new Date(value).getTime()} /> : <NA />;
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
        <Form form={form} key="nice-form">
          <NiceForm meta={meta}></NiceForm>
        </Form>
      ),
    },
  ];

  extendFormMeta(meta, 'museManager.pm.releaseInfoModal.form', {
    meta,
    form,
    release,
    app,
    plugin,
  });
  return (
    <Modal
      {...antdModalV5(modal)}
      width={680}
      title={`Release Details of ${plugin.name}`}
      okText="Close"
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      {!release && isFetching ? (
        <RequestStatus loadingMode="skeleton" loading={true} />
      ) : (
        <Nodes
          items={bodyNodes}
          extName="items"
          extBase="museManager.pm.releaseInfoModal.body"
          extArgs={{ items: bodyNodes, ...extArgs }}
        />
      )}
    </Modal>
  );
});

export default ReleaseInfoModal;
