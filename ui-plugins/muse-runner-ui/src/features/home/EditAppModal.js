import React from 'react';
import { Modal, Form } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import NiceForm from '@ebay/nice-form-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from './api';
import yaml from 'js-yaml';

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
    initialValues: {
      ...app,
      variables: app?.variables ? yaml.dump(app.variables) : '',
      pluginVariables: app?.pluginVariables ? yaml.dump(app.pluginVariables) : '',
    },
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
        // condition: () => !!form.getFieldValue('app'),
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
      {
        key: 'variables',
        label: 'App variables',
        widget: 'textarea',
        rules: [
          {
            message: 'Invalid yaml format',
            validator: (_, value) => {
              try {
                yaml.load(value);
                return Promise.resolve();
              } catch (err) {
                return Promise.reject(err);
              }
            },
          },
        ],
        tooltip:
          'Override app variables in yaml format. e.g. key: value. Only take effects at local.',
      },
      {
        key: 'pluginVariables',
        label: 'Plugin variables',
        widget: 'textarea',
        tooltip:
          'Set plugin variables in yaml format. e.g. \n@ebay/muse-lib-react: \n  key:value\nOnly take effects at local.',
      },
    ],
  };

  const handleFinish = async (values) => {
    const payload = {
      app: values.app,
      env: values.env,
      loadAllPlugins: values.loadAllPlugins,
      variables: values.variables ? yaml.load(values.variables) : undefined,
      pluginVariables: values.pluginVariables ? yaml.load(values.pluginVariables) : undefined,
    };
    if (!app) {
      await newApp(payload);
    } else {
      await updateApp({
        id: app.id,
        ...payload,
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
      onOk={() => {
        form
          .validateFields()
          .then(() => form.submit())
          .catch((err) => {
            // do nothing
          });
      }}
    >
      <Form form={form} onFinish={handleFinish}>
        <NiceForm meta={formMeta} />
      </Form>
    </Modal>
  );
});

export default AddAppModal;
