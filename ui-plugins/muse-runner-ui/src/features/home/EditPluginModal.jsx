import React, { useCallback } from 'react';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, Form } from 'antd';
import NiceForm from '@ebay/nice-form-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import useRunnerData from './useRunnerData';

import api from './api';

const EditPluginModal = NiceModal.create(({ plugin, appId }) => {
  const queryClient = useQueryClient();
  const {
    configData: { plugins: pluginsConfig },
    settings,
  } = useRunnerData();

  const { data: plugins } = useQuery({
    cacheTime: 0,
    queryKey: ['muse-data', 'muse.plugins'],
    queryFn: async () => {
      return (await api.get('/muse-data?key=muse.plugins')).data;
    },
  });

  const { mutateAsync: updatePlugin } = useMutation({
    mutationFn: async (args) => {
      await api.post('/update-plugin', args);
      await queryClient.refetchQueries({ queryKey: ['config-data'], exact: true });
    },
  });

  const { mutateAsync: attachPlugin } = useMutation({
    mutationFn: async (args) => {
      await api.post('/attach-plugin', args);
      await queryClient.refetchQueries({ queryKey: ['config-data'], exact: true });
    },
  });

  const { mutateAsync: updateSelectedRows } = useMutation({
    mutationFn: async (keys) => {
      await api.post('/settings', { key: 'siderExpandedRows', value: keys });
    },
  });

  const modal = useModal();
  const [form] = Form.useForm();

  const selectedPlugin = plugins?.find((p) => p.name === form.getFieldValue('name'));
  const formMeta = {
    initialValues: { ...plugin, mode: plugin?.mode || 'local' },
    fields: [
      plugin
        ? {
            key: 'name',
            label: 'Name',
            viewMode: true,
          }
        : {
            key: 'name',
            label: 'Name',
            widget: 'select',
            required: true,
            widgetProps: {
              placeholder: plugins ? 'Select a plugin' : 'Loading...',
              showSearch: true,
              loading: !plugins,
              onChange: (value) => {
                form.setFieldValue('dir', pluginsConfig?.[value]?.dir || '');
              },
            },
            disabled: !plugins,
            options: plugins?.map((p) => p.name),
          },

      {
        key: 'mode',
        label: 'Mode',
        required: true,
        widget: 'radio-group',
        options: [
          ['local', 'Local'],
          ['deployed', 'Deployed'],
          ['version', 'Version'],
          ['excluded', 'Excluded'],
          ['url', 'Url'],
        ],
        tooltip: (
          <>
            The source of the plugin:
            <ul>
              <li>
                <b>Local:</b> from local dev bundle started by the runner, it will use the deployed
                one if the dev server not started.
              </li>
              <li>
                <b>Deployed:</b> use the deployed version, not load if not deployed.
              </li>
              <li>
                <b>Excluded:</b> don't use this plugin even if it's a core plugin.
              </li>
              <li>
                <b>Version:</b> specify a version to load even if it's not deployed.
              </li>
              <li>
                <b>Url:</b> load from an arbitrary url.
              </li>
            </ul>
          </>
        ),
      },
      {
        key: 'devServer',
        label: 'Dev Server',
        required: false,
        tooltip:
          'Whether use webpack or vite as dev server. Lib plugin has not been supported yet. For webpack it runs "start" script, for vite it runs "dev" script.',
        widget: 'radio-group',
        // disabled: !selectedPlugin || selectedPlugin.type === 'lib',
        options: [
          ['webpack', 'Webpack'],
          ['vite', 'Vite'],
        ],
        initialValue: 'webpack',
        condition: () => form.getFieldValue('mode') === 'local',
      },
      {
        key: 'dir',
        label: 'Folder',
        required: true,
        tooltip: 'The local folder of the plugin.',
        widget: 'input',
        condition: () => form.getFieldValue('mode') === 'local',
      },
      {
        key: 'version',
        label: 'Version',
        required: true, // if mode is version, this is required
        tooltip: 'A released plugin version, e.g.: 1.0.8',
        condition: () => form.getFieldValue('mode') === 'version',
      },
      {
        key: 'url',
        label: 'Url',
        required: true, // if mode is version, this is required
        tooltip: 'The url to get the plugin bundle.',
        condition: () => form.getFieldValue('mode') === 'url',
      },
    ],
  };

  // This is necessary if the condition is set on the field
  Form.useWatch('mode', form);
  Form.useWatch('name', form);

  const handleFinish = useCallback(async () => {
    form.validateFields().then(async (values) => {
      // update plugin only set the local folder
      if (values.mode === 'local') {
        await updatePlugin({
          dir: values.dir,
          pluginName: values.name,
          devServer: selectedPlugin?.type === 'lib' ? undefined : values.devServer,
        });
      }

      if (appId) {
        await attachPlugin({
          appId,
          pluginName: values.name,
          mode: values.mode,
          version: values.version,
          url: values.url,
        });
      }
      modal.hide();
      const siderExpandedRows = [].concat(settings?.siderExpandedRows || []);
      if (!siderExpandedRows.includes(appId)) siderExpandedRows.push(appId);
      updateSelectedRows(siderExpandedRows);
    });
  }, [
    form,
    updatePlugin,
    modal,
    attachPlugin,
    appId,
    settings?.siderExpandedRows,
    updateSelectedRows,
    selectedPlugin?.type,
  ]);

  return (
    <Modal
      {...antdModalV5(modal)}
      title={plugin ? 'Edit Plugin' : 'Add Plugin Config'}
      maskClosable={false}
      width="800px"
      onOk={() => form.submit()}
    >
      <Form onFinish={handleFinish} form={form}>
        <NiceForm meta={formMeta} />
      </Form>
    </Modal>
  );
});

export default EditPluginModal;
