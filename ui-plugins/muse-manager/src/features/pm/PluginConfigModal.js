import { useCallback } from 'react';
import flat from 'flat';
import _ from 'lodash';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, message, Form } from 'antd';
import NiceForm from '@ebay/nice-form-react';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import utils from '@ebay/muse-lib-antd/src/utils';
import { useSyncStatus, useMuseMutate } from '../../hooks';

const PluginConfigModal = NiceModal.create(({ plugin, app }) => {
  const modal = useModal();
  const [form] = Form.useForm();
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);
  const {
    mutateAsync: updateApp,
    error: updateAppError,
    isLoading: updateAppPending,
  } = useMuseMutate('am.updateApp');

  const initialValues = { ...app, appName: app.name };
  _.unset(initialValues, `pluginConfig.${plugin.name}.core`);
  const meta = {
    columns: 1,
    initialValues,
    fields: [
      {
        key: `pluginConfig.${plugin.name}.core`,
        label: 'Core',
        widget: 'checkbox',
        disabled: plugin.type !== 'normal',
        order: 10,
        initialValue: plugin.type !== 'normal' || _.get(app, `pluginConfig.${plugin.name}.core`),
        tooltip:
          'Core plugins will always be loaded as remote plugins for local development. Boot, init and library plugins are always core plugins.',
      },
      {
        key: `pluginConfig.${plugin.name}.allowlist`,
        label: 'Allow list',
        widget: 'tag',
        order: 20,
        tooltip: 'Restrict who can use the plugin. Leave empty if no restriction.',
        // widget: 'checkbox',
      },
    ],
  };

  // Object.values(app.envs).forEach((env) => {
  //   meta.fields.push(
  //     {
  //       key: env.name,
  //       render: () => (
  //         <h3 style={{ color: 'gray', paddingBottom: '10px', borderBottom: '1px solid #ddd' }}>
  //           {env.name}
  //         </h3>
  //       ),
  //     },
  //     {
  //       key: `${env.name}.pluginConfig.${plugin.name}.core`,
  //       label: 'Core',
  //       widget: 'checkbox',
  //       tooltip: 'Core plugins will always be loaded as remote plugins for local development.',
  //     },
  //     {
  //       key: `${env.name}.pluginConfig.${plugin.name}.allowList`,
  //       label: 'Allow list',
  //       widget: 'tag',
  //       tooltip: 'Restrict who can use the plugin. Leave empty if no restriction.',
  //       // widget: 'checkbox',
  //     },
  //   );
  // });

  const handleFinish = useCallback(() => {
    const values = form.getFieldsValue();
    const payload = {
      appName: app.name,
      changes: {
        set: Object.entries(flat(values)).map(([key, value]) => ({ path: key, value })),
      },
    };

    updateApp(payload)
      .then(async () => {
        modal.hide();
        message.success('Update plugin config success.');
        await syncStatus();
      })
      .catch((err) => {
        console.log('failed to update plugin config', err);
      });
  }, [updateApp, syncStatus, modal, app, form]);

  const { watchingFields } = utils.extendFormMeta(meta, 'museManager.pm.pluginConfigForm', {
    meta,
    form,
    app,
    plugin,
  });
  const updateOnChange = NiceForm.useUpdateOnChange(watchingFields);
  return (
    <Modal
      {...antdModalV5(modal)}
      title={`Plugin Config: ${plugin.name}`}
      width="700px"
      maskClosable={false}
      okText="Save"
      onOk={() => {
        form.validateFields().then(() => form.submit());
      }}
    >
      <RequestStatus loading={updateAppPending} error={updateAppError} />
      <div className="muse-simple-tip">
        Plugin config on the app <b>{app.name}</b>. Note that you can config plugins before
        deploying.
      </div>

      <Form layout="horizontal" form={form} onValuesChange={updateOnChange} onFinish={handleFinish}>
        <NiceForm meta={meta} />
      </Form>
    </Modal>
  );
});

export default PluginConfigModal;
