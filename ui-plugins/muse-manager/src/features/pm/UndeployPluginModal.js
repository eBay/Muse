import { useCallback } from 'react';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, Button, Form, message } from 'antd';
import utils from '@ebay/muse-lib-antd/src/utils';
import NiceForm from '@ebay/nice-form-react';
import { useMuseMutation, useSyncStatus } from '../../hooks';

import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
const UndeployPluginModal = NiceModal.create(({ plugin, app, version }) => {
  const [form] = Form.useForm();
  const modal = useModal();
  const {
    mutateAsync: undeployPlugin,
    error: undeployPluginError,
    isLoading: undeployPluginPending,
  } = useMuseMutation('pm.undeployPlugin');
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);

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

  const handleFinish = useCallback(() => {
    const values = form.getFieldsValue();
    undeployPlugin({
      appName: app.name,
      pluginName: plugin.name,
      envName: values.envs,
    })
      .then(async () => {
        modal.hide();
        message.success('Undeploy plugin success.');
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
  }, [app.name, plugin.name, modal, form, syncStatus, undeployPlugin]);

  const footer = [
    {
      disabled: undeployPluginPending,
      children: 'Cancel',
      onClick: modal.hide,
    },
    {
      type: 'primary',
      loading: undeployPluginPending,
      disabled: undeployPluginPending,
      children: undeployPluginPending ? 'Undeploying...' : 'Undeploy',

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
      closable={!undeployPluginPending}
      footer={footer.map((props, i) => (
        <Button key={i} {...props} />
      ))}
    >
      <RequestStatus loading={undeployPluginPending} error={undeployPluginError} />
      <Form layout="horizontal" form={form} onValuesChange={updateOnChange} onFinish={handleFinish}>
        <NiceForm meta={meta} />
      </Form>
    </Modal>
  );
});

export default UndeployPluginModal;
