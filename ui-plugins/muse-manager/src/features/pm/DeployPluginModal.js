import { useCallback, useEffect, useState } from 'react';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, Form, message } from 'antd';
import utils from '@ebay/muse-lib-antd/src/utils';
import NiceForm from '@ebay/nice-form-react';
import { useMuseMutation, useSyncStatus } from '../../hooks';
import useValidateDeployment from '../../hooks/useValidateDeployment';
import PluginReleaseSelect from './PluginReleaseSelect';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import ModalFooter from '../common/ModalFooter';

const DeployPluginModal = NiceModal.create(({ plugin, app, version }) => {
  const [form] = Form.useForm();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const modal = useModal();
  const {
    mutateAsync: deployPlugin,
    error: deployPluginError,
    isLoading: deployPluginPending,
  } = useMuseMutation('pm.deployPlugin');
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);

  useEffect(() => {
    setPending((p) => p || deployPluginPending);
  }, [deployPluginPending]);

  useEffect(() => {
    setError((e) => e || deployPluginError);
  }, [deployPluginError]);

  const { validateDeployment, validateDeploymentError, validateDeploymentPending } =
    useValidateDeployment();

  useEffect(() => {
    setPending((p) => p || validateDeploymentPending);
  }, [validateDeploymentPending]);

  useEffect(() => {
    setError((e) => e || validateDeploymentError);
  }, [validateDeploymentError]);

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

  const confirmDeployment = useCallback(async () => {
    try {
      await form.validateFields();
      const values = form.getFieldValue();
      await new Promise((resolve) => {
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
            resolve(true);
          },
          onCancel: () => {
            resolve(false);
          },
        });
      });
      return true;
    } catch (e) {
      return false;
    }
  }, [form, app.name, plugin.name]);
  const handleFinish = useCallback(async () => {
    const values = form.getFieldsValue();
    if (
      !(await validateDeployment({
        deployment: [{ pluginName: plugin.name, version: values.version }],
        appName: app.name,
        envs: values.envs,
      }))
    ) {
      return;
    }

    await deployPlugin({
      appName: app.name,
      pluginName: plugin.name,
      envName: values.envs,
      version: values.version,
      author: window.MUSE_GLOBAL.getUser().username,
    });

    modal.hide();
    message.success('Deploy plugin succeeded.');
    await syncStatus();
  }, [app.name, plugin.name, modal, form, syncStatus, validateDeployment, deployPlugin]);

  const { watchingFields } = utils.extendFormMeta(meta, 'museManager.pm.deployPluginModal.form', {
    meta,
    form,
    app,
    plugin,
    version,
    setPending,
    setError,
    pending,
    error,
    syncStatus,
    confirmDeployment,
  });

  const footerItems = [
    {
      key: 'cancel-btn',
      order: 10,
      props: {
        disabled: pending,
        children: 'Cancel',
        onClick: modal.hide,
      },
    },
    {
      key: 'deploy-btn',
      order: 20,
      props: {
        type: 'primary',
        loading: pending,
        disabled: pending,
        children: pending ? 'Deploying...' : 'Deploy',

        onClick: async () => {
          if (!(await confirmDeployment())) return;
          form.submit();
        },
      },
    },
  ];

  utils.extendArray(footerItems, 'items', 'museManager.pm.deployPluginModal.footer', {
    app,
    form,
    plugin,
    version,
    items: footerItems,
    setPending,
    setError,
    pending,
    error,
    modal,
    syncStatus,
    confirmDeployment,
  });
  const updateOnChange = NiceForm.useUpdateOnChange(watchingFields);
  return (
    <Modal
      {...antdModalV5(modal)}
      title={`Deploy Plugin`}
      maskClosable={false}
      width="700px"
      closable={!deployPluginPending}
      footer={false}
    >
      <RequestStatus loading={pending} error={error} />
      <Form layout="horizontal" form={form} onValuesChange={updateOnChange} onFinish={handleFinish}>
        <NiceForm meta={meta} />
      </Form>
      <ModalFooter items={footerItems} />
    </Modal>
  );
});

export default DeployPluginModal;
