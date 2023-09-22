import { useCallback, useState, useEffect } from 'react';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, Button, Form, message } from 'antd';
import utils from '@ebay/muse-lib-antd/src/utils';
import NiceForm from '@ebay/nice-form-react';
import { useMuseMutation, useSyncStatus, useValidateDeployment } from '../../hooks';

import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import ModalFooter from '../common/ModalFooter';
const UndeployPluginModal = NiceModal.create(({ plugin, app, version }) => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();
  const modal = useModal();
  const {
    mutateAsync: undeployPlugin,
    error: undeployPluginError,
    isLoading: undeployPluginPending,
  } = useMuseMutation('pm.undeployPlugin');

  useEffect(() => {
    setPending((p) => p || undeployPluginPending);
  }, [undeployPluginPending]);

  useEffect(() => {
    setError((e) => e || undeployPluginError);
  }, [undeployPluginError]);

  const syncStatus = useSyncStatus(`muse.app.${app.name}`);
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
    disabled: undeployPluginPending,
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
      },
    ],
  };

  const handleFinish = useCallback(async () => {
    const values = form.getFieldsValue();
    if (
      !(await validateDeployment({
        deployment: [{ pluginName: plugin.name, version: values.version, type: 'remove' }],
        appName: app.name,
        envs: values.envs,
      }))
    ) {
      return;
    }
    await undeployPlugin({
      appName: app.name,
      pluginName: plugin.name,
      envName: values.envs,
    });

    modal.hide();
    message.success('Undeploy plugin success.');
    await syncStatus();
  }, [app.name, plugin.name, modal, form, syncStatus, validateDeployment, undeployPlugin]);

  const footer = [
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
          form.validateFields().then(() => {
            const values = form.getFieldsValue();
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
                form.submit();
              },
            });
          });
        },
      },
    },
  ];
  const { watchingFields } = utils.extendFormMeta(meta, 'museManager.undeployPluginForm', {
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
      <ModalFooter items={footer} />
    </Modal>
  );
});

export default UndeployPluginModal;
