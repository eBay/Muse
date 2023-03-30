import { useCallback } from 'react';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, Button, Form, message } from 'antd';
import utils from '@ebay/muse-lib-antd/src/utils';
import NiceForm from '@ebay/nice-form-react';
import { useMuseApi, useSyncStatus } from '../../hooks';

import PluginReleaseSelect from './PluginReleaseSelect';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
const DeployPluginModal = NiceModal.create(({ plugin, app, version }) => {
  const [form] = Form.useForm();
  const modal = useModal();
  const {
    action: deployPlugin,
    error: deployPluginError,
    pending: deployPluginPending,
  } = useMuseApi('pm.deployPlugin');
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);

  const meta = {
    columns: 1,
    disabled: deployPluginPending,
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
        widget: 'radio-group',
        options: Object.keys(app.envs),
      },
    ],
  };

  const handleFinish = useCallback(() => {
    const values = form.getFieldsValue();
    deployPlugin({
      appName: app.name,
      pluginName: plugin.name,
      envName: values.envs,
      version: values.version,
      author: window.MUSE_GLOBAL.getUser().username,
    })
      .then(async () => {
        modal.hide();
        message.success('Deploy plugin success.');
        await syncStatus();
        // Modal.success({
        //   title: 'Deploy Success!',
        //   content: `Plugin ${plugin.name}@${values.version} was deployed to ${app.name} successfully. `,
        //   onOk: () => {
        //     modal.hide();
        //   },
        // });
      })
      .catch((err) => {
        console.log('failed to deploy', err);
      });
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
                Are you sure to apply below changes to <b>{app.name}</b>?
                <ul>
                  <li>
                    Deploy{' '}
                    <b>
                      {plugin.name}@{values.version}
                    </b>{' '}
                    to <b>{values.envs}</b>
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
      width="600px"
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
