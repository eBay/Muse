import React, { useCallback } from 'react';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, Form, Alert } from 'antd';
import NiceForm from '@ebay/nice-form-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useRunnerData from './useRunnerData';

import api from './api';

const LinkPluginModal = NiceModal.create(({ plugin, appId }) => {
  const queryClient = useQueryClient();
  const {
    plugins,
    configData: { pluginDir },
  } = useRunnerData();

  const { mutateAsync: linkPlugin } = useMutation({
    mutationFn: async ({ linkedPlugin, dir }) => {
      await api.post('/update-plugin', { dir, pluginName: linkedPlugin });
      await api.post('/link-plugin', { mainPlugin: plugin.name, linkedPlugin });
      await queryClient.refetchQueries({ queryKey: ['config-data'], exact: true });
    },
  });

  const modal = useModal();
  const formMeta = {
    fields: [
      {
        key: 'name',
        label: 'Target',
        viewMode: true,
        renderView: (value) => {
          return plugin.name;
        },
      },
      {
        key: 'linkedPlugin',
        label: 'Link plugin',
        widget: 'select',
        required: true,
        widgetProps: {
          placeholder: 'Select a plugin',
          showSearch: true,
          onChange: (value) => {
            form.setFieldValue('dir', pluginDir?.[value] || '');
          },
        },
        options: plugins?.map((p) => p.name),
      },

      {
        key: 'dir',
        label: 'Folder',
        required: true,
        tooltip: 'The local folder of the plugin.',
        widget: 'input',
      },
    ],
  };
  const [form] = Form.useForm();

  const handleFinish = useCallback(async () => {
    form.validateFields().then(async (values) => {
      await linkPlugin({
        dir: values.dir,
        linkedPlugin: values.linkedPlugin,
      });

      modal.resolve('changed');
      modal.hide();
    });
  }, [form, modal, linkPlugin]);

  return (
    <Modal
      {...antdModalV5(modal)}
      title="Link Plugin"
      maskClosable={false}
      width="800px"
      onOk={() => form.submit()}
    >
      <Alert
        type="info"
        className="mb-5"
        message={
          <>
            <p>
              When a plugin is linked, it will be compiled together with the main plugin. This is
              same with MUSE_LOCAL_PLUGINS config. It's usually only useful when you want to work on
              a shared module used by other plugins.
            </p>
            <p>
              NOTE:{' '}
              <ul>
                <li>
                  This is usually a temp config. Change of linked plugins will stop the dev server.
                  You need to start it again manually.
                </li>
                <li>
                  If MUSE_LOCAL_PLUGINS is configured in the main plugin's .env file, the linked
                  plugins will be ignored.
                </li>
              </ul>
            </p>
          </>
        }
      />
      <Form onFinish={handleFinish} form={form}>
        <NiceForm meta={formMeta} />
      </Form>
    </Modal>
  );
});

export default LinkPluginModal;
