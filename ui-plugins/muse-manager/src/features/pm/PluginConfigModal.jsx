import { useCallback } from 'react';
import flat from 'flat';
import _ from 'lodash';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, message, Form, Alert } from 'antd';
import NiceForm from '@ebay/nice-form-react';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import utils from '@ebay/muse-lib-antd/src/utils';
import { useSyncStatus, useMuseMutation } from '../../hooks';
import { LightOnIcon } from './';
import jsPlugin from 'js-plugin';

const user = window.MUSE_GLOBAL.getUser();

const PluginConfigModal = NiceModal.create(({ plugin, app }) => {
  const modal = useModal();
  const [form] = Form.useForm();
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);
  const {
    mutateAsync: updateApp,
    error: updateAppError,
    isLoading: updateAppPending,
  } = useMuseMutation('am.updateApp');

  const initialValues = _.cloneDeep(app);
  initialValues.appName = app.name;
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
    ],
  };

  const handleFinish = useCallback(() => {
    const values = form.getFieldsValue();
    const payload = {
      appName: app.name,
      changes: {
        set: Object.entries(flat(values)).map(([key, value]) => ({ path: key, value })),
      },
      msg: `Updated plugin config of ${plugin.name} by ${user.username}.`,
    };
    jsPlugin.invoke('museManager.pm.pluginConfigForm.processPayload', { payload, values });
    updateApp(payload)
      .then(async () => {
        modal.hide();
        message.success('Update plugin config success.');
        await syncStatus();
      })
      .catch((err) => {
        console.log('failed to update plugin config', err);
      });
  }, [updateApp, syncStatus, modal, app, form, plugin.name]);

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
        form
          .validateFields()
          .then(() => form.submit())
          .catch((err) => {
            return;
          });
      }}
    >
      <RequestStatus loading={updateAppPending} error={updateAppError} />

      <Alert
        style={{ padding: '1.25rem', marginBottom: '1em' }}
        icon={<LightOnIcon style={{ fill: 'currentColor' }} />}
        message={
          <>
            Plugin config on the app <b>{app.name}</b>. Note that you can config plugins before
            deploying.
          </>
        }
        type="info"
        showIcon
      />
      <Form layout="horizontal" form={form} onValuesChange={updateOnChange} onFinish={handleFinish}>
        <NiceForm meta={meta} />
      </Form>
    </Modal>
  );
});

export default PluginConfigModal;
