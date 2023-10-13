import { useCallback } from 'react';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, Form, message } from 'antd';
import utils from '@ebay/muse-lib-antd/src/utils';
import NiceForm from '@ebay/nice-form-react';
import { useMuseMutation, useSyncStatus, usePendingError, useAbility } from '../../hooks';
import useValidateDeployment from '../../hooks/useValidateDeployment';
import PluginReleaseSelect from './PluginReleaseSelect';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import ModalFooter from '../common/ModalFooter';
import jsPlugin from 'js-plugin';

const DeployPluginModal = NiceModal.create(({ plugin, app, version }) => {
  const ability = useAbility();
  const [form] = Form.useForm();
  const modal = useModal();
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);
  const {
    mutateAsync: deployPlugin,
    error: deployPluginError,
    isLoading: deployPluginPending,
  } = useMuseMutation('pm.deployPlugin');

  const { validateDeployment, validateDeploymentError, validateDeploymentPending } =
    useValidateDeployment();

  const { pending, error, setPending, setError } = usePendingError(
    [deployPluginPending, validateDeploymentPending],
    [validateDeploymentError, deployPluginError],
  );

  const confirmDeployment = useCallback(async () => {
    // Validate form
    try {
      await form.validateFields();
    } catch (e) {
      return false;
    }

    // User confirm deployment
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

    // Validate shared modules
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
    const payload = {
      appName: app.name,
      pluginName: plugin.name,
      envName: values.envs,
      version: values.version,
    };
    jsPlugin.invoke('museManager.pm.deployPluginModal.forceDeploy.processPayload', {
      payload,
      values,
    });
    await deployPlugin(payload);
    modal.hide();
    message.success('Deploy plugin succeeded.');
    await syncStatus();
  }, [app.name, plugin.name, modal, form, syncStatus, deployPlugin, confirmDeployment]);
  const extArgs = {
    ability,
    app,
    form,
    plugin,
    version,
    setPending,
    setError,
    pending,
    error,
    modal,
    syncStatus,
    confirmDeployment,
    validateDeployment,
  };

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
  const { watchingFields } = utils.extendFormMeta(meta, 'museManager.pm.deployPluginModal.form', {
    meta,
    ...extArgs,
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
    items: footerItems,
    ...extArgs,
  });

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
