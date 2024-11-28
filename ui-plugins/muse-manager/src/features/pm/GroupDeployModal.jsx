import { useCallback, useState } from 'react';
import { Modal, Form, Alert, message } from 'antd';
import NiceForm from '@ebay/nice-form-react';
import { flatten, uniq } from 'lodash';
import jsPlugin from 'js-plugin';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import utils from '@ebay/muse-lib-antd/src/utils';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import {
  useMuseMutation,
  useSyncStatus,
  useValidateDeployment,
  usePendingError,
  useAbility,
} from '../../hooks';
import MultiPluginSelector from './MultiPluginSelector';
import ModalFooter from '../common/ModalFooter';

const GroupDeployModal = NiceModal.create(({ app }) => {
  const ability = useAbility();
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
  const [deployments, setDeployments] = useState([]);

  const confirmDeployment = useCallback(async () => {
    try {
      await form.validateFields();
    } catch (e) {
      return false;
    }

    const { envs } = form.getFieldsValue();
    const pluginsToAdd = deployments.filter((d) => d.type === 'add');
    const pluginsToRemove = deployments.filter((d) => d.type === 'remove');

    if (pluginsToAdd.length < 1 && pluginsToRemove.length < 1) {
      message.warning('Please choose plugin(s) to deploy or undeploy.');
      return false;
    }

    const deployMsg =
      pluginsToAdd.length > 0 ? (
        <>
          deploy <b>{pluginsToAdd.map((p) => `${p.pluginName}@${p.version}`).join(', ')}</b>
        </>
      ) : null;
    const undeployMsg =
      pluginsToRemove.length > 0 ? (
        <>
          undeploy <b>{pluginsToRemove.map(p => p.pluginName).join(', ')}</b>
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

    if (
      !(await validateDeployment({
        deployment: deployments,
        appName: app.name,
        envs: envs,
      }))
    ) {
      return false;
    }
    return true;
  }, [app.name, form, validateDeployment, deployments]);

  const handleFinish = useCallback(async () => {
    const values = form.getFieldsValue();

    const payload = {
      appName: app.name,
      envMap: values.envs?.reduce((map, envName) => {
        map[envName] = deployments; //concat(addList, removeList);
        return map;
      }, {}),
    };

    jsPlugin.invoke('museManager.pm.groupDeployModal.form.processPayload', {
      payload,
      values,
    });
    await deployPlugin(payload);
    modal.hide();
    message.success('Group deployment succeeded.');
    await syncStatus();
  }, [app.name, deployPlugin, form, modal, syncStatus, deployments]);

  const deployedPlugins = uniq(
    flatten(
      Object.keys(app?.envs || {})?.map((env) => app?.envs?.[env]?.plugins?.map((p) => p.name)),
    ),
  );

  const canRequestDeploy = ability.can('create', 'Request', {
    type: 'deploy-plugin',
    payload: {
      appName: app.name,
      deployments,
    },
  });

  const extArgs = {
    ability,
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

  const handleValuesChange = useCallback(
    (...args) => {
      updateOnChange(...args);
      const values = form.getFieldsValue();
      const { pluginToAdd = [], pluginsToRemove = [] } = values;
      setDeployments([
        ...pluginToAdd.map((item) => ({
          pluginName: item.name,
          version: item.version,
          type: 'add',
        })),
        ...pluginsToRemove.map((pluginName) => ({ pluginName, version: null, type: 'remove' })),
      ]);
    },
    [updateOnChange, form],
  );

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
      tooltip: canRequestDeploy ? '' : 'No permission to deploy/undeploy some plugins.',
      props: {
        type: 'primary',
        disabled: pending || !canRequestDeploy,
        children: 'Deploy',
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
      <Form layout="horizontal" form={form} onValuesChange={handleValuesChange}>
        <NiceForm meta={meta} />
      </Form>
      <ModalFooter items={footerItems} />
    </Modal>
  );
});

export default GroupDeployModal;
