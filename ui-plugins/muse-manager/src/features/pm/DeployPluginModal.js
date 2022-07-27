import { useCallback } from 'react';
import NiceModal, { useModal, antdModal } from '@ebay/nice-modal-react';
import { Modal, Button, Form } from 'antd';
import FormBuilder from 'antd-form-builder';
import { useMuseApi } from '../../hooks';

import PluginReleaseSelect from './PluginReleaseSelect';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
const DeployPluginModal = NiceModal.create(({ plugin, app }) => {
  const [form] = Form.useForm();
  const modal = useModal();
  const {
    action: deployPlugin,
    error: deployPluginError,
    pending: deployPluginPending,
  } = useMuseApi('pm.deployPlugin');

  const meta = {
    columns: 1,
    elements: [
      {
        key: 'appName',
        label: 'App',
        viewMode: true,
        initialValue: app?.name,
      },
      {
        key: 'pluginName',
        label: 'Plugin',
        viewMode: true,
        initialValue: plugin?.name,
      },
      {
        key: 'version',
        label: 'Version to deploy',
        required: true,
        widget: PluginReleaseSelect,
        widgetProps: { plugin, app },
      },
      {
        key: 'envs',
        label: 'Environments',
        widget: 'radio-group',
        options: Object.keys(app.envs),
      },
    ],
  };

  const handleFinish = useCallback(() => {
    const values = form.getFieldsValue();
    deployPlugin({
      appName: app.name,
      pluginName: plugin.name,
      envName: 'staging',
      version: values.version,
      author: window.MUSE_GLOBAL.getUser().username,
    })
      .then(() => {
        Modal.success({
          title: 'Deploy Success!',
          content: `Plugin ${plugin.name}@${values.version} was deployed to ${app.name} successfully. `,
          onOk: () => {
            modal.hide();
          },
        });
      })
      .catch(err => {
        console.log('failed to deploy', err);
      });
  }, [app.name, plugin.name, modal, form, deployPlugin]);

  const footer = [
    {
      disabled: deployPluginPending,
      children: 'Cancel',
      onClick: modal.hide,
    },
    {
      type: 'primary',
      loading: deployPluginPending,
      disabled: deployPluginPending,
      onClick: () => {
        console.log(form.getFieldsValue());
        form.validateFields().then(() => form.submit());
      },
      children: deployPluginPending ? 'Deploying...' : 'Deploy',
    },
  ];

  return (
    <Modal
      {...antdModal(modal)}
      title={`Deploy Plugin`}
      maskClosable={false}
      width="600px"
      closable={!deployPluginPending}
      footer={footer.map((props, i) => (
        <Button key={i} {...props} />
      ))}
    >
      <RequestStatus loading={deployPluginPending} error={deployPluginError} />
      <Form layout="horizontal" form={form} onFinish={handleFinish}>
        <FormBuilder disabled={deployPluginPending} form={form} meta={meta} />
      </Form>
    </Modal>
  );
});

export default DeployPluginModal;
