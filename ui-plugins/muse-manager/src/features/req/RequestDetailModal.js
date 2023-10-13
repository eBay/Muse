import _ from 'lodash';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, message, Form, Tag } from 'antd';
import jsPlugin from 'js-plugin';
import NiceForm from '@ebay/nice-form-react';
import TimeAgo from 'react-time-ago';
import utils from '@ebay/muse-lib-antd/src/utils';
import ModalFooter from '../common/ModalFooter';
import usePendingError from '../../hooks/usePendingError';
import { useMuseMutation, useSyncStatus, useAbility, useMuseData } from '../../hooks';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import Nodes from '../common/Nodes';

const RequestStatuses = ({ request }) => {
  const colorMap = {
    success: 'success',
    failure: 'error',
    pending: 'processing',
    running: 'processing',
    waiting: 'cyan',
  };
  return (
    <div className="grid gap-1 justify-items-start">
      {request.statuses?.map((s) => (
        <Tag key={s.name} color={colorMap[s.state]}>
          {s.message || s.name + ': ' + s.state}
        </Tag>
      )) || 'N/A'}
    </div>
  );
};

const RequestDetailModalInner = ({ request, retry = true }) => {
  const ability = useAbility();
  const modal = useModal();
  const [form] = Form.useForm();
  const syncStatus = useSyncStatus('muse.requests');

  console.log(request);

  const canRetryRequest = ability.can('retry', 'Request', request);
  const canCancelRequest = ability.can('cancel', 'Request', request);
  const {
    mutateAsync: deleteRequest,
    error: deleteRequestError,
    isLoading: deleteRequestPending,
  } = useMuseMutation('req.deleteRequest');

  const {
    mutateAsync: createRequest,
    error: createRequestError,
    isLoading: createRequestPending,
  } = useMuseMutation('req.createRequest');

  const { setPending, setError, pending, error } = usePendingError(
    [deleteRequestPending, createRequestPending],
    [deleteRequestError, createRequestError],
  );

  const extArgs = {
    ability,
    request,
    form,
    modal,
    setPending,
    setError,
    pending,
    error,
  };
  const meta = {
    columns: 2,
    viewMode: true,
    initialValues: request,
    fields: [
      {
        key: 'id',
        label: 'Request id',
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
    meta,
    ...extArgs,
  });

  const footerItems = [
    {
      key: 'cancel-btn',
      order: 10,
      position: 'left',
      tooltip: canCancelRequest
        ? 'This will delete the request.'
        : 'You do not have permission to cancel this request.',
      props: {
        disabled: pending || !canCancelRequest,
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
    retry &&
      request?.statuses?.some((s) => s.state === 'failure') && {
        key: 'retry-btn',
        order: 20,
        tooltip: canRetryRequest ? '' : 'You do not have permission to retry this request.',
        props: {
          disabled: pending || !canRetryRequest,
          type: 'primary',
          children: 'Retry',
          onClick: () => {
            Modal.confirm({
              title: 'Confirm',
              content: 'Are you sure to retry this request?',
              onOk: () => {
                (async () => {
                  await createRequest({
                    id: request.id,
                    type: request.type,
                    payload: request.payload,
                  });
                  message.success('Request created.');
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
      order: 30,
      props: {
        disabled: pending,
        children: 'Close Dialog',
        onClick: modal.hide,
      },
    },
  ].filter(Boolean);

  utils.extendArray(footerItems, 'items', 'museManager.req.requestDetailModal.footer', {
    items: footerItems,
    ...extArgs,
  });

  const modalProps = {
    title: _.startCase(request.type),
    width: '800px',
    maskClosable: false,
    footer: false,
  };

  jsPlugin.invoke('museManager.req.requestDetailModal.processModalProps', {
    modalProps,
    ...extArgs,
  });

  const bodyNodes = [
    {
      key: 'request-status',
      order: 10,
      node: <RequestStatus loading={pending} error={error} />,
    },
    {
      key: 'nice-form',
      order: 20,
      node: (
        <Form form={form}>
          <NiceForm meta={meta} />
        </Form>
      ),
    },
    {
      key: 'modal-footer',
      order: 10000,
      node: <ModalFooter items={footerItems} />,
    },
  ];
  return (
    <Modal {...antdModalV5(modal)} {...modalProps}>
      <Nodes
        items={bodyNodes}
        extName="items"
        extBase="museManager.req.requestDetailModal.body"
        extArgs={{ items: bodyNodes, ...extArgs }}
      />
    </Modal>
  );
};

const RequestDetailModal = NiceModal.create(({ requestId, ...restProps }) => {
  const { data: requests } = useMuseData('muse.requests');
  const request = requests?.find((r) => r.id === requestId);
  if (request) {
    return <RequestDetailModalInner request={request} {...restProps} />;
  }
  return null;
});

export default RequestDetailModal;
