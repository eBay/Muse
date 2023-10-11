import React from 'react';
import { Modal, Form } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import NiceForm from '@ebay/nice-form-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from './api';

const AddAppModal = NiceModal.create(({ app }) => {
  const { data: apps } = useQuery({
    cacheTime: 0,
    queryKey: ['muse-data', 'muse.apps'],
    queryFn: async () => {
      return (await api.get('/muse-data?key=muse.apps')).data;
    },
  });

  const modal = useModal();
  const [form] = Form.useForm();
  Form.useWatch('app', form);

  const queryClient = useQueryClient();
  const { mutateAsync: newApp } = useMutation({
    mutationFn: async (args) => {
      await api.post('/new-app', args);
    },
  });

  const { mutateAsync: updateApp } = useMutation({
    mutationFn: async (args) => {
      await api.post('/update-app', args);
    },
  });

  const selectedApp = form.getFieldValue('app');
  const formMeta = {
    initialValues: app,
    fields: [
      {
        key: 'app',
        required: true,
        label: 'App',
        widget: 'select',
        widgetProps: {
          placeholder: apps ? 'Select an app' : 'Loading...',
          showSearch: true,
          loading: !apps,
        },
        disabled: !apps,
        options: apps?.map((a) => ({
          label: a.name,
          value: a.name,
        })),
      },
      {
        key: 'env',
        required: true,
        label: 'Envrionment',
        widget: 'select',
        widgetProps: {
          showSearch: true,
        },
        disabled: !selectedApp,
        placeholder: 'Select an envrionment',
        options: Object.keys(apps?.find((a) => a.name === selectedApp)?.envs || {}),
        condition: () => !!form.getFieldValue('app'),
      },
      {
        key: 'loadAllPlugins',
        label: (
          <>
            Load all plugins&nbsp;
            <AppstoreOutlined title="App plugins will be loaded." className="text-violet-500" />
          </>
        ),
        tooltip: (
          <>
            By default the app only loads deployed core plugins, boot/lib/init plugins and
            configured plugins. If you want all plugins are loaded without configure, check load all
            plugins. Then all deployed plugins are loaded except excluded. (The icon
            <AppstoreOutlined
              title="App plugins will be loaded."
              className="text-violet-500"
            />{' '}
            indicates it in the app row)
          </>
        ),
        widget: 'switch',
      },
    ],
  };

  const handleFinish = async (values) => {
    if (!app) {
      await newApp({ app: values.app, env: values.env, loadAllPlugins: values.loadAllPlugins });
    } else {
      await updateApp({
        id: app.id,
        app: values.app,
        env: values.env,
        loadAllPlugins: values.loadAllPlugins,
      });
    }
    queryClient.refetchQueries({ queryKey: ['config-data'], exact: true });
    modal.hide();
  };

  return (
    <Modal
      {...antdModalV5(modal)}
      maskClosable={false}
      title={app ? 'Edit App' : 'Add App'}
      onOk={() => form.validateFields().then(() => form.submit())}
    >
      <Form form={form} onFinish={handleFinish}>
        <NiceForm meta={formMeta} />
      </Form>
    </Modal>
  );
});

export default AddAppModal;
