import { useCallback } from 'react';
import { Modal, Form, Alert, message } from 'antd';
import NiceForm from '@ebay/nice-form-react';
import { flatten, uniq, concat } from 'lodash';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import utils from '@ebay/muse-lib-antd/src/utils';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import {
  useMuseMutation,
  useSyncStatus,
  useValidateDeployment,
  usePendingError,
} from '../../hooks';
import MultiPluginSelector from './MultiPluginSelector';
import ModalFooter from '../common/ModalFooter';

const GroupDeployModal = NiceModal.create(({ app }) => {
  const [form] = Form.useForm();
  const modal = useModal();
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

  const syncStatus = useSyncStatus(`muse.app.${app.name}`);

  const confirmDeployment = useCallback(async () => {
    try {
      await form.validateFields();
    } catch (e) {
      return false;
    }

    const values = form.getFieldsValue();
    const { pluginToAdd = [], pluginsToRemove = [], envs } = values;

    if (pluginToAdd.length < 1 && pluginsToRemove.length < 1) {
      message.warning('Please choose plugin(s) to deploy or undeploy.');
      return false;
    }
    const deployMsg =
      pluginToAdd.length > 0 ? (
        <>
          deploy <b>{pluginToAdd.map((p) => `${p.name}@${p.version}`).join(', ')}</b>
        </>
      ) : null;
    const undeployMsg =
      pluginsToRemove.length > 0 ? (
        <>
          undeploy <b>{pluginsToRemove.join(', ')}</b>
        </>
      ) : null;
    if (
      !(await new Promise((resolve) => {
        Modal.confirm({
          title: 'Confirm Deployment',
          okText: 'Yes',
          cancelText: 'No',
          content: (
            <>
              Are you sure to {deployMsg}
              {deployMsg && undeployMsg ? ' and ' : ''}
              {undeployMsg} to <b> {envs.join(', ')}</b> environment of application
              <b> {app.name}</b>?
            </>
          ),
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      }))
    ) {
      return false;
    }

    const addList = pluginToAdd?.map((item) => ({
      type: 'add',
      pluginName: item.name,
      version: item.version,
    }));
    const removeList = pluginsToRemove?.map((pluginName) => ({
      type: 'remove',
      pluginName,
      verion: null,
    }));

    if (
      !(await validateDeployment({
        deployment: [...addList, ...removeList],
        appName: app.name,
        envs: envs,
      }))
    ) {
      return false;
    }
    return true;
  }, [app.name, form, validateDeployment]);

  const handleFinish = useCallback(async () => {
    const values = form.getFieldsValue();
    const { pluginToAdd = [], pluginsToRemove = [], envs } = values;

    const addList = pluginToAdd?.map((item) => ({
      type: 'add',
      pluginName: item.name,
      version: item.version,
    }));
    const removeList = pluginsToRemove?.map((pluginName) => ({
      type: 'remove',
      pluginName,
      verion: null,
    }));

    const args = {
      appName: app.name,
      envMap: envs.reduce((map, envName) => {
        map[envName] = concat(addList, removeList);
        return map;
      }, {}),
      author: window.MUSE_GLOBAL.getUser().username,
    };
    await deployPlugin(args);
    modal.hide();
    message.success('Group deployment succeeded.');
    await syncStatus();
  }, [app.name, deployPlugin, form, modal, syncStatus]);

  const deployedPlugins = uniq(
    flatten(
      Object.keys(app?.envs || {})?.map((env) => app?.envs?.[env]?.plugins?.map((p) => p.name)),
    ),
  );

  const extArgs = {
    form,
    app,
    setPending,
    setError,
    pending,
    error,
    syncStatus,
    confirmDeployment,
    modal,
    validateDeployment,
    validateDeploymentPending,
    deployPluginPending,
    deployPluginError,
    validateDeploymentError,
  };

  const meta = {
    columns: 1,
    disabled: pending,
    fields: [
      {
        key: 'pluginToAdd',
        label: 'Plugins to deploy',
        widget: MultiPluginSelector,
        widgetProps: {
          app,
        },
      },
      {
        key: 'pluginsToRemove',
        label: 'Plugins to undeploy',
        widget: 'select',
        placeholder: 'Select which plugins to undeploy',
        widgetProps: { mode: 'multiple', allowClear: true },
        options: deployedPlugins,
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
  const { watchingFields } = utils.extendFormMeta(meta, 'museManager.pm.groupDeployModal.form', {
    meta,
    ...extArgs,
  });
  const updateOnChange = NiceForm.useUpdateOnChange(watchingFields);

  const footerItems = [
    {
      key: 'cancel-btn',
      props: {
        disabled: pending,
        children: 'Cancel',
        onClick: modal.hide,
      },
    },
    {
      key: 'deploy-btn',
      props: {
        type: 'primary',
        loading: pending,
        disabled: pending,
        children: pending ? 'Deploying...' : 'Deploy',
        onClick: async () => {
          if (await confirmDeployment()) {
            handleFinish();
          }
        },
      },
    },
  ];
  utils.extendArray(footerItems, 'items', 'museManager.pm.groupDeployModal.footer', {
    items: footerItems,
    ...extArgs,
  });

  return (
    <Modal
      {...antdModalV5(modal)}
      title={`Group deployment for application : ${app?.name}`}
      maskClosable={false}
      width="800px"
      closable={!pending}
      footer={false}
    >
      <RequestStatus loading={pending} error={error} />
      <Alert
        message="With group deployment, you can deploy/undeploy multiple plugins in one release process.
        Note only app owners can undeploy plugins."
        type="info"
        className="mb-5"
      />
      <Form layout="horizontal" form={form} onValuesChange={updateOnChange}>
        <NiceForm meta={meta} />
      </Form>
      <ModalFooter items={footerItems} />
    </Modal>
  );
});

export default GroupDeployModal;
