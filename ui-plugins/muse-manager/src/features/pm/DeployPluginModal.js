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
  const [form] = Form.useForm();
  const modal = useModal();
  const {
    mutateAsync: deployPlugin,
    error: deployPluginError,
    isLoading: deployPluginPending,
  } = useMuseMutation('pm.deployPlugin');
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);

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
    await Promise.all(
      values.envs.map(async (env) => {
        validationResult[env] = null; // to keep the order
        const res = await axios.post('http://localhost:6070/api/v2/analyzer/validateDeployment', {
          args: [app.name, env, [{ pluginName: plugin.name, version: values.version }]],
        });
        validationResult[env] = res.data.data;
      }),
    );

    const success = Object.values(validationResult).every((r) => r.success);
    let continueDeploy = success; // if continue deployment after validation failed
    if (!success) {
      continueDeploy = await NiceModal.show('muse-manager.validation-result-modal', {
        result: validationResult,
      });
    }
    if (!continueDeploy) return;
    await deployPlugin({
      appName: app.name,
      pluginName: plugin.name,
      envName: values.envs,
      version: values.version,
      author: window.MUSE_GLOBAL.getUser().username,
    });
    modal.hide();
    message.success('Deploy plugin success.');
    await syncStatus();
  }, [app.name, plugin.name, modal, form, syncStatus, deployPlugin]);

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
      <RequestStatus loading={deployPluginPending} error={deployPluginError} />
      <Form layout="horizontal" form={form} onValuesChange={updateOnChange} onFinish={handleFinish}>
        <NiceForm meta={meta} />
      </Form>
    </Modal>
  );
});

export default DeployPluginModal;
