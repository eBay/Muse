import { useCallback, useState } from 'react';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, message, Form } from 'antd';
import NiceForm from '@ebay/nice-form-react';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { useSyncStatus, useMuseMutation } from '../../hooks';
import utils from '@ebay/muse-lib-antd/src/utils';
import jsPlugin from 'js-plugin';

const EditAppModal = NiceModal.create(({ app }) => {
  const modal = useModal();
  const [form] = Form.useForm();
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    mutateAsync: updateApp,
    error: updateAppError,
    isLoading: updateAppPending,
  } = useMuseMutation('am.updateApp');

  const meta = {
    initialValues: app,
    columns: 2,
    fields: [
      {
        key: 'title',
        order: 10,
        label: 'Site Title',
        required: true,
      },
      {
        key: 'config.entry',
        order: 20,
        label: 'App entry',
        tooltip: "The entry function of the app. Usually you don't need to set it.",
        initialValue: '',
      },

      {
        key: 'description',
        order: 1000,
        colSpan: 2,
        label: 'Description',
        widget: 'textarea',
        widgetProps: {
          rows: 8,
        },
        required: false,
      },
    ],
  };
  const { watchingFields } = utils.extendFormMeta(meta, 'museManager.am.editAppForm', {
    meta,
    form,
    app,
    setLoading,
    setError,
  });
  const updateOnChange = NiceForm.useUpdateOnChange(watchingFields);

  const handleFinish = useCallback(() => {
    const values = form.getFieldsValue();
    const payload = {
      appName: app.name,
      changes: {
        set: Object.entries(values).map(([k, v]) => {
          return {
            path: k,
            value: v,
          };
        }),
      },
    };
    jsPlugin.invoke('museManager.am.editAppForm.processPayload', { payload, values });
    updateApp(payload)
      .then(async () => {
        modal.hide();
        message.success('Update app success.');
        await syncStatus();
      })
      .catch((err) => {
        console.log('failed to update', err);
      });
  }, [updateApp, syncStatus, modal, form, app.name]);

  return (
    <Modal
      {...antdModalV5(modal)}
      title={`Edit App: ${app.name}`}
      width="800px"
      okText={updateAppPending ? 'Updating...' : 'Update'}
      maskClosable={false}
      onOk={() => {
        form.validateFields().then(() => form.submit());
      }}
    >
      <RequestStatus loading={updateAppPending} error={updateAppError} />
      <RequestStatus loading={loading} error={error} />
      <Form layout="horizontal" form={form} onFinish={handleFinish} onValuesChange={updateOnChange}>
        <NiceForm meta={meta} />
      </Form>
    </Modal>
  );
});

export default EditAppModal;
