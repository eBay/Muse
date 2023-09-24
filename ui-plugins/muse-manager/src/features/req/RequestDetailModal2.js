import _ from 'lodash';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, message, Form, Tag } from 'antd';
import NiceForm from '@ebay/nice-form-react';
import TimeAgo from 'react-time-ago';
import utils from '@ebay/muse-lib-antd/src/utils';
import ModalFooter from '../common/ModalFooter';
import usePendingError from '../../hooks/usePendingError';
import { useMuseMutation, useSyncStatus } from '../../hooks';
import { useEffect } from 'react';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';

const RequestStatuses = ({ request }) => {
  const colorMap = {
    success: 'success',
    failure: 'error',
    pending: 'processing',
  };
  return (
    <div className="grid gap-1 justify-items-start">
      {request.statuses.map((s) => (
        <Tag color={colorMap[s.state]}>
          {s.name}: {s.state}
        </Tag>
      ))}
    </div>
  );
};

const RequestDetailModal = NiceModal.create(({ request }) => {
  const modal = useModal();
  const [form] = Form.useForm();
  const { setPending, setError, pending, error } = usePendingError();
  const syncStatus = useSyncStatus(`muse.requests`);

  const {
    mutateAsync: deleteRequest,
    error: deleteRequestError,
    isLoading: deleteRequestPending,
  } = useMuseMutation('req.deleteRequest');

  useEffect(() => {
    setPending('deleteReqestPending', deleteRequestPending);
  }, [setPending, deleteRequestPending]);

  useEffect(() => {
    setError('deleteRequestError', deleteRequestError);
  }, [setError, deleteRequestError]);

  const meta = {
    columns: 2,
    viewMode: true,
    initialValues: request,
    fields: [
      {
        key: 'id',
        label: 'Id',
        colSpan: 2,
        order: 10,
      },
      {
        key: 'type',
        label: 'Type',
        order: 20,
      },
      {
        key: 'statuses',
        label: 'Status',
        order: 30,

        renderView: () => {
          return <RequestStatuses request={request} />;
        },
        // renderView: (status) => {
        //   const color = {
        //     success: 'success',
        //     failure: 'error',
        //     pending: 'processing',
        //   }[status.state];
        //   return <Tag color={color}>{status?.message || status.state}</Tag>;
        // },
      },
      {
        key: 'createdBy',
        label: 'Created by',
        order: 40,
      },
      {
        key: 'createdAt',
        label: 'Started at',
        order: 50,
        renderView: (timestamp) => {
          return timestamp ? <TimeAgo date={new Date(timestamp)} /> : 'N/A';
        },
      },
      {
        key: 'payload',
        label: 'Payload',
        order: 60,
        clear: 'left',
        colSpan: 2,
        renderView: (payload) => {
          return <pre className="bg-slate-100 p-1">{JSON.stringify(payload, null, 2)}</pre>;
        },
      },
    ],
  };

  utils.extendFormMeta(meta, 'museManager.req.requestDetailModal.form', {
    request,
    form,
    modal,
    setPending,
    setError,
    pending,
    error,
  });

  const footerItems = [
    {
      key: 'cancel-btn',
      order: 10,
      position: 'left',
      tooltip: 'This will delete the request.',
      props: {
        disabled: pending,
        type: 'primary',
        danger: true,
        children: 'Cancel Request',
        onClick: () => {
          Modal.confirm({
            title: 'Confirm',
            okButtonProps: { danger: true },
            content: 'Are you sure to cancel this request?',
            onOk: () => {
              (async () => {
                await deleteRequest({ requestId: request.id });
                message.success('Request canceled.');
                syncStatus();
                modal.hide();
              })();
            },
          });
        },
      },
    },
    {
      key: 'close-btn',
      order: 20,
      disabled: pending,
      props: {
        disabled: pending,
        children: 'Close Dialog',
        onClick: modal.hide,
      },
    },
  ];

  utils.extendArray(footerItems, 'items', 'museManager.pm.requestDetailModal.footer', {
    items: footerItems,
    request,
    form,
    modal,
    setPending,
    setError,
    pending,
    error,
  });

  return (
    <Modal
      {...antdModalV5(modal)}
      title={_.startCase(request.type)}
      width="800px"
      maskClosable={false}
      footer={false}
    >
      <RequestStatus loading={pending} error={error} />
      <Form form={form}>
        <NiceForm meta={meta} />
      </Form>
      <ModalFooter items={footerItems} />
    </Modal>
  );
});
export default RequestDetailModal;
