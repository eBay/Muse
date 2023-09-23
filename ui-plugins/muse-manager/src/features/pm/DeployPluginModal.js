import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const [pendingMap, setPendingMap] = useState({});
  const [errorMap, setErrorMap] = useState({});
  const modal = useModal();
  const {
    mutateAsync: deployPlugin,
    error: deployPluginError,
    isLoading: deployPluginPending,
  } = useMuseMutation('pm.deployPlugin');
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);

  useEffect(() => {
    setPendingMap((m) => ({ ...m, deployPluginPending }));
  }, [deployPluginPending]);

  useEffect(() => {
    setErrorMap((m) => ({ ...m, deployPluginError }));
  }, [deployPluginError]);

  const { validateDeployment, validateDeploymentError, validateDeploymentPending } =
    useValidateDeployment();

  useEffect(() => {
    setPendingMap((m) => ({ ...m, validateDeploymentPending }));
  }, [validateDeploymentPending]);

  useEffect(() => {
    setErrorMap((m) => ({ ...m, validateDeploymentError }));
  }, [validateDeploymentError]);

  const pending = useMemo(() => Object.values(pendingMap).some(Boolean), [pendingMap]);
  const error = useMemo(() => Object.values(errorMap).filter(Boolean)[0] || null, [errorMap]);
  const meta = {
    columns: 1,
    disabled: pending,
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
        required: true,
        options: Object.keys(app.envs),
      },
    ],
  };

  const confirmDeployment = useCallback(async () => {
    try {
      await form.validateFields();
    } catch (e) {
      return false;
    }
    const values = form.getFieldValue();
    if (
      !(await new Promise((resolve) => {
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
      }))
    ) {
      return false;
    }

    if (
      !(await validateDeployment({
        deployment: [{ pluginName: plugin.name, version: values.version }],
        appName: app.name,
        envs: values.envs,
      }))
    ) {
      return;
    }
    return true;
  }, [form, app.name, plugin.name, validateDeployment]);
  const handleFinish = useCallback(async () => {
    if (!(await confirmDeployment())) return;
    const values = form.getFieldsValue();

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
  }, [app.name, plugin.name, modal, form, syncStatus, deployPlugin, confirmDeployment]);

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

        onClick: () => {
          handleFinish();
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
    setPendingMap,
    setErrorMap,
    pending,
    error,
    modal,
    syncStatus,
    confirmDeployment,
    validateDeployment,
  });

  const { watchingFields } = utils.extendFormMeta(meta, 'museManager.pm.deployPluginModal.form', {
    meta,
    form,
    app,
    plugin,
    version,
    setPendingMap,
    setErrorMap,
    pending,
    error,
    syncStatus,
    confirmDeployment,
    validateDeployment,
  });
  const updateOnChange = NiceForm.useUpdateOnChange(watchingFields);

  return (
    <Modal
      {...antdModalV5(modal)}
      title={`Deploy Plugin`}
      maskClosable={false}
      width="700px"
      closable={!pending}
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
