import { useCallback } from 'react';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, Select, message, Form } from 'antd';
import NiceForm from '@ebay/nice-form-react';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import utils from '@ebay/muse-lib-antd/src/utils';
import jsPlugin from 'js-plugin';
import { useSyncStatus, useMuseMutation } from '../../hooks';
import validateNpmPackageName from 'validate-npm-package-name';

const CreatePluginModal = NiceModal.create(({ app }) => {
  const modal = useModal();
  const [form] = Form.useForm();
  const syncStatus = useSyncStatus('muse.plugins');

  const {
    mutateAsync: createPlugin,
    error: createPluginError,
    isLoading: createPluginPending,
  } = useMuseMutation('pm.createPlugin');

  const meta = {
    columns: 1,
    fields: [
      app && {
        key: 'appName',
        label: 'App',
        viewMode: true,
        renderView: () => app,
        order: 5,
        tooltip: `You are creating a plugin under the app ${app}. The app owners have permission to edit, build and deploy this plugin as well.`,
      },
      {
        key: 'pluginName',
        label: 'Name',
        tooltip: 'The uniq name of the plugin. Recommend to follow same pattern with npm package.',
        required: true,
        order: 10,
        rules: [
          {
            pattern: /^[@\/\w\d-]{1,30}$/,
            message:
              'Plugin name should be 1-30 characters and contains only alphabets, numbers, "@", "/" , or "-".',
          },
          {
            validator: (t, value) => {
              const result = validateNpmPackageName(value || '');
              if (!result.validForNewPackages) {
                return Promise.reject(new Error('Invalid plugin name:' + result.errors.join(', ')));
              }
              return Promise.resolve();
            },
          },
        ],
      },
      {
        key: 'type',
        label: 'Type',
        widget: 'radio-group',
        options: [
          ['normal', 'Normal'],
          ['lib', 'Library'],
          ['init', 'Init'],
          ['boot', 'Boot'],
        ],
        required: true,
        initialValue: 'normal',
        tooltip: 'The type of the plugin. See Muse docs for more details.',
        order: 20,
      },
      {
        key: 'owners',
        label: 'Owners',
        order: 21,
        initialValue: [window.MUSE_GLOBAL.getUser()?.username].filter(Boolean),
        widget: Select,
        widgetProps: {
          mode: 'tags',
          style: { width: '100%' },
          popupClassName: 'hidden',
          tokenSeparators: [' '],
        },
        tooltip:
          'If ACL plugin enabled, only owners can manage the plugin. Seperated by whitespace.',
      },
      {
        key: 'description',
        label: 'Description',
        widget: 'textarea',
        widgetProps: { rows: 5 },
        order: 100,
      },
    ].filter(Boolean),
  };

  const handleFinish = useCallback(() => {
    const values = form.getFieldsValue();
    if (app) values.appName = app;
    jsPlugin.invoke('museManager.pm.createPluginModal.form.processPayload', {
      payload: values,
      form,
    });

    createPlugin({ ...values })
      .then(async () => {
        modal.hide();
        message.success('Create plugin success.');
        await syncStatus();
      })
      .catch((err) => {
        console.log('failed to deploy', err);
      });
  }, [createPlugin, syncStatus, modal, form, app]);

  const { watchingFields } = utils.extendFormMeta(meta, 'museManager.pm.createPluginModal.form', {
    meta,
    form,
  });
  const updateOnChange = NiceForm.useUpdateOnChange(watchingFields);

  return (
    <Modal
      {...antdModalV5(modal)}
      title={`Create Plugin`}
      width="600px"
      okText="Create"
      maskClosable={false}
      className="muse-manager_pm-create-plugin-modal"
      onOk={() => {
        form.validateFields().then(() => form.submit());
      }}
    >
      <RequestStatus loading={createPluginPending} error={createPluginError} />
      <Form layout="horizontal" form={form} onValuesChange={updateOnChange} onFinish={handleFinish}>
        <NiceForm meta={meta} />
      </Form>
    </Modal>
  );
});

export default CreatePluginModal;
