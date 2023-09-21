import { useCallback } from 'react';
import { Modal, Button, Form, Alert, message } from 'antd';
import NiceForm from '@ebay/nice-form-react';
import { flatten, uniq, concat } from 'lodash';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import utils from '@ebay/muse-lib-antd/src/utils';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { useMuseMutation, useSyncStatus, useValidateDeployment } from '../../hooks';
import MultiPluginSelector from './MultiPluginSelector';

const GroupDeploymentModal = NiceModal.create(({ app }) => {
  const [form] = Form.useForm();
  const modal = useModal();
  const {
    mutateAsync: deployPlugin,
    error: deployPluginError,
    isLoading: deployPluginPending,
  } = useMuseMutation('pm.deployPlugin');

  const { validateDeployment, validateDeploymentError, validateDeploymentPending } =
    useValidateDeployment();

  const syncStatus = useSyncStatus(`muse.app.${app.name}`);
  const deployedPlugins = uniq(
    flatten(
      Object.keys(app?.envs || {})?.map((env) => app?.envs?.[env]?.plugins?.map((p) => p.name)),
    ),
  );

  const meta = {
    columns: 1,
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
      },
    ],
  };

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

    if (
      !(await validateDeployment({
        deployment: [...addList, ...removeList],
        appName: app.name,
        envs: values.envs,
      }))
    ) {
      return;
    }

    const args = {
      appName: app.name,
      envMap: values.envs.reduce((map, envName) => {
        map[envName] = concat(addList, removeList);
        return map;
      }, {}),
      author: window.MUSE_GLOBAL.getUser().username,
    };
    await deployPlugin(args);
    modal.hide();
    message.success('Group deployment succeeded.');
    await syncStatus();
  }, [app.name, deployPlugin, form, modal, validateDeployment, syncStatus]);

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
        form.validateFields().then((values) => {
          const { pluginToAdd = [], pluginsToRemove = [], envs } = values;
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
            onOk: () => {
              form.submit();
            },
          });
        });
      },
    },
  ];
  const { watchingFields } = utils.extendFormMeta(meta, 'museManager.GroupDeploymentForm', {
    meta,
    form,
    app,
  });
  const updateOnChange = NiceForm.useUpdateOnChange(watchingFields);
  return (
    <Modal
      {...antdModalV5(modal)}
      title={`Group deployment for application : ${app?.name}`}
      maskClosable={false}
      width="800px"
      closable={!deployPluginPending}
      footer={footer.map((props, i) => (
        <Button key={i} {...props} />
      ))}
    >
      <div style={{ display: 'flex', rowGap: '30px', flexFlow: 'column wrap' }}>
        <RequestStatus
          loading={deployPluginPending || validateDeploymentPending}
          error={validateDeploymentError || deployPluginError}
        />
        <Alert
          message="With group deployment, you can deploy/undeploy multiple plugins in one release process.
        Note only app owners can undeploy plugins."
          type="info"
        />
        <Form
          layout="horizontal"
          form={form}
          onValuesChange={updateOnChange}
          onFinish={handleFinish}
        >
          <NiceForm disabled={deployPluginPending} meta={meta} />
        </Form>
      </div>
    </Modal>
  );
});

export default GroupDeploymentModal;
