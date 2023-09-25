import { useCallback, useState, useEffect, useMemo } from 'react';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, Form, message } from 'antd';
import utils from '@ebay/muse-lib-antd/src/utils';
import NiceForm from '@ebay/nice-form-react';
import { useMuseMutation, useSyncStatus, useValidateDeployment } from '../../hooks';

import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import ModalFooter from '../common/ModalFooter';
const UndeployPluginModal = NiceModal.create(({ plugin, app, version }) => {
  const [pendingMap, setPendingMap] = useState({});
  const [errorMap, setErrorMap] = useState({});

  const [form] = Form.useForm();
  const modal = useModal();
  const {
    mutateAsync: undeployPlugin,
    error: undeployPluginError,
    isLoading: undeployPluginPending,
  } = useMuseMutation('pm.undeployPlugin');

  useEffect(() => {
    setPendingMap((m) => ({ ...m, undeployPluginPending }));
  }, [undeployPluginPending]);

  useEffect(() => {
    setErrorMap((m) => ({ ...m, undeployPluginError }));
  }, [undeployPluginError]);

  const { validateDeployment, validateDeploymentError, validateDeploymentPending } =
    useValidateDeployment();

  useEffect(() => {
    setPendingMap((m) => ({ ...m, validateDeploymentPending }));
  }, [validateDeploymentPending]);

  useEffect(() => {
    setErrorMap((m) => ({ ...m, validateDeploymentError }));
  }, [validateDeploymentError]);

  const syncStatus = useSyncStatus(`muse.app.${app.name}`);

  const pending = useMemo(() => Object.values(pendingMap).some(Boolean), [pendingMap]);
  const error = useMemo(() => Object.values(errorMap).filter(Boolean)[0] || null, [errorMap]);

  const confirmUndeployment = useCallback(async () => {
    try {
      await form.validateFields();
    } catch (e) {
      return false;
    }
    const values = form.getFieldsValue();
    if (
      !(await new Promise((resolve) => {
        Modal.confirm({
          title: 'Confirm Undeployment',
          width: 550,
          content: (
            <>
              Are you sure to apply below changes to <b>{app.name}</b>?
              <ul>
                <li>
                  Undeploy{' '}
                  <b>
                    {plugin.name}@{values.version}
                  </b>{' '}
                  from <b>{values.envs.join(', ')}.</b>
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
        deployment: [{ pluginName: plugin.name, version: values.version, type: 'remove' }],
        appName: app.name,
        envs: values.envs,
      }))
    ) {
      return false;
    }
    return true;
  }, [app.name, form, plugin.name, validateDeployment]);

  const handleFinish = useCallback(async () => {
    if (!(await confirmUndeployment())) return;

    const values = form.getFieldsValue();
    await undeployPlugin({
      appName: app.name,
      pluginName: plugin.name,
      envName: values.envs,
    });

    modal.hide();
    message.success('Undeploy plugin success.');
    syncStatus();
  }, [app.name, plugin.name, modal, form, syncStatus, undeployPlugin, confirmUndeployment]);

  const meta = {
    columns: 1,
    disabled: pending,
    fields: [
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
        key: 'envs',
        label: 'Environments',
        widget: 'checkbox-group',
        options: Object.keys(app.envs),
        required: true,
      },
    ],
  };
  const { watchingFields } = utils.extendFormMeta(meta, 'museManager.undeployPluginModal.form', {
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
    confirmUndeployment,
    modal,
  });
  const updateOnChange = NiceForm.useUpdateOnChange(watchingFields);

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
      key: 'undeploy-btn',
      order: 20,
      props: {
        type: 'primary',
        loading: pending,
        disabled: pending,
        children: pending ? 'Undeploying...' : 'Undeploy',

        onClick: () => {
          handleFinish();
        },
      },
    },
  ];
  utils.extendArray(footerItems, 'items', 'museManager.pm.undeployPluginModal.footer', {
    items: footerItems,
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
    confirmUndeployment,
    modal,
  });

  return (
    <Modal
      {...antdModalV5(modal)}
      title={`Undeploy Plugin`}
      maskClosable={false}
      width="600px"
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

export default UndeployPluginModal;
