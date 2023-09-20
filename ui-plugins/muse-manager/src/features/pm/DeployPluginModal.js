import { useCallback } from 'react';
import axios from 'axios';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, Button, Form, message } from 'antd';
import utils from '@ebay/muse-lib-antd/src/utils';
import NiceForm from '@ebay/nice-form-react';
import { useMuseMutation, useSyncStatus } from '../../hooks';

import PluginReleaseSelect from './PluginReleaseSelect';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
const DeployPluginModal = NiceModal.create(({ plugin, app, version }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const modal = useModal();
  const {
    mutateAsync: deployPlugin,
    error: deployPluginError,
    isLoading: deployPluginPending,
  } = useMuseMutation('pm.deployPlugin');
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);

  const {
    mutateAsync: validateDeployment,
    error: validateDeploymentError,
    isLoading: validateDeploymentPending,
  } = useMuseMutation('analyzer.validateDeployment');

  const meta = {
    columns: 1,
    disabled: deployPluginPending,
    fields: [
      {
        key: 'appName',
        label: 'App',
        viewMode: true,
        initialValue: app.name,
      },
      {
        key: 'pluginName',
        label: 'Plugin',
        viewMode: true,
        initialValue: plugin.name,
      },
      {
        key: 'version',
        label: 'Version to deploy',
        required: true,
        widget: PluginReleaseSelect,
        widgetProps: { plugin, app },
        initialValue: version || undefined,
      },
      {
        key: 'envs',
        label: 'Environments',
        widget: 'checkbox-group',
        options: Object.keys(app.envs),
      },
    ],
  };

  const handleFinish = useCallback(async () => {
    const values = form.getFieldsValue();
    const validationResult = {};
    messageApi.loading({ key: 'deployment-msg', content: 'Validating deployment...', duration: 0 });
    try {
      await Promise.all(
        values.envs.map(async (env) => {
          validationResult[env] = null; // to keep the order
          const result = await validateDeployment({
            _museParams: [app.name, env, [{ pluginName: plugin.name, version: values.version }]],
          });
          validationResult[env] = result;
        }),
      );
    } catch (e) {
      console.error(e);
      Modal.error({ title: 'Error', content: 'Failed to validate deployment, please retry.' });
      return;
    } finally {
      messageApi.destroy('deployment-msg');
    }

    const success = Object.values(validationResult).every((r) => r.success);
    let continueDeploy = success; // if continue deployment after validation failed
    if (!success) {
      continueDeploy = await NiceModal.show('muse-manager.validation-result-modal', {
        result: validationResult,
      });
    }
    if (!continueDeploy) return;
    messageApi.loading({ key: 'deployment-msg', content: 'Deploying plugins...', duration: 0 });
    await deployPlugin({
      appName: app.name,
      pluginName: plugin.name,
      envName: values.envs,
      version: values.version,
      author: window.MUSE_GLOBAL.getUser().username,
    });
    messageApi.destroy('deployment-msg');
    modal.hide();
    message.success('Deploy plugin succeeded.');
    await syncStatus();
  }, [
    app.name,
    plugin.name,
    modal,
    form,
    syncStatus,
    messageApi,
    validateDeployment,
    deployPlugin,
  ]);

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
      children: deployPluginPending ? 'Deploying...' : 'Deploy',

      onClick: () => {
        form.validateFields().then(() => {
          const values = form.getFieldsValue();
          Modal.confirm({
            title: 'Confirm Deployment',
            width: 550,
            content: (
              <>
                Are you sure to apply below change to <b>{app.name}</b>?
                <ul>
                  <li>
                    Deploy{' '}
                    <b>
                      {plugin.name}@{values.version}
                    </b>{' '}
                    to <b>{values.envs.join(', ')}.</b>
                  </li>
                </ul>
              </>
            ),
            onOk: () => {
              form.submit();
            },
          });
        });
      },
    },
  ];
  const { watchingFields } = utils.extendFormMeta(meta, 'museManager.deployPluginForm', {
    meta,
    form,
    app,
    plugin,
    version,
  });
  const updateOnChange = NiceForm.useUpdateOnChange(watchingFields);
  return (
    <Modal
      {...antdModalV5(modal)}
      title={`Deploy Plugin`}
      maskClosable={false}
      width="700px"
      closable={!deployPluginPending}
      footer={footer.map((props, i) => (
        <Button key={i} {...props} />
      ))}
    >
      {contextHolder}
      <RequestStatus
        loading={deployPluginPending || validateDeploymentPending}
        error={deployPluginError || validateDeploymentError}
      />
      <Form layout="horizontal" form={form} onValuesChange={updateOnChange} onFinish={handleFinish}>
        <NiceForm meta={meta} />
      </Form>
    </Modal>
  );
});

export default DeployPluginModal;
