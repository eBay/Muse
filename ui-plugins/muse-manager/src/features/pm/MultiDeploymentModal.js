import { useCallback } from 'react';
import { Modal, Button, Form, message } from 'antd';
import NiceForm from '@ebay/nice-form-react';
import { flatten, uniq, concat } from 'lodash';
import NiceModal, { useModal, antdModal } from '@ebay/nice-modal-react';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { useMuseApi, useSyncStatus } from '../../hooks';
import MultiPluginSelector from './MultiPluginSelector';

const MultiDeploymentModal = NiceModal.create(({ app }) => {
  const [form] = Form.useForm();
  const modal = useModal();
  const {
    action: deployPlugin,
    error: deployPluginError,
    pending: deployPluginPending,
  } = useMuseApi('pm.deployPlugin');
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
        key: 'appName',
        label: 'App',
        viewMode: true,
        initialValue: app?.name,
      },
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

  const handleFinish = useCallback(() => {
    form
      .validateFields()
      .then((values) => {
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
            const addList = pluginToAdd?.map((item) => ({
              type: 'add',
              pluginName: item.name,
              version: item.version,
            }));
            const removeList = pluginsToRemove?.map((pluginName) => ({
              type: 'remove',
              pluginName,
            }));

            const args = {
              appName: app.name,
              envMap: values.envs.reduce((map, envName) => {
                map[envName] = concat(addList, removeList);
                return map;
              }, {}),
              author: window.MUSE_GLOBAL.getUser().username,
              msg: `Multi-deployment to ${values.envs.join(', ')} env.`,
            };
            deployPlugin(args)
              .then(async () => {
                modal.hide();
                message.success('Multi-Deploy success.');
                await syncStatus();
              })
              .catch((err) => {
                console.log('failed to multi-deploy', err);
              });
            return Promise.resolve();
          },
        });
      })
      .catch((err) => {
        return;
      });
  }, [app.name, deployPlugin, form, modal, syncStatus]);

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
      onClick: handleFinish,
    },
  ];

  return (
    <Modal
      {...antdModal(modal)}
      title={`Advanced Deployment`}
      maskClosable={false}
      width="800px"
      closable={!deployPluginPending}
      footer={footer.map((props, i) => (
        <Button key={i} {...props} />
      ))}
    >
      <RequestStatus loading={deployPluginPending} error={deployPluginError} />
      <p className="p-5 bg-gray-50 text-neutral-500">
        With advanced deployment, you can deploy/undeploy multiple plugins in one release process.
        Note only app owners can undeploy plugins.
      </p>
      <Form layout="horizontal" form={form}>
        <NiceForm disabled={deployPluginPending} meta={meta} />
      </Form>
    </Modal>
  );
});

export default MultiDeploymentModal;
