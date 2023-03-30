import { useCallback, useState } from 'react';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, message, Select, Form, Tag } from 'antd';
import NiceForm from '@ebay/nice-form-react';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import utils from '@ebay/muse-lib-antd/src/utils';
import { useSyncStatus, useMuseApi } from '../../hooks';

const PluginInfoModal = NiceModal.create(({ plugin, app }) => {
  const modal = useModal();
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState(true);
  const syncStatus = useSyncStatus('muse.plugins');
  const {
    action: updatePlugin,
    error: updatePluginError,
    pending: updatePluginPending,
  } = useMuseApi('pm.updatePlugin');

  const meta = {
    columns: 1,
    initialValues: { ...plugin, pluginName: plugin.name },
    viewMode,
    fields: [
      {
        key: 'type',
        label: 'Type',
        widget: 'radio-group',
        options: [
          ['normal', 'Normal'],
          ['lib', 'Library'],
          ['init', 'Init'],
          ['boot', 'Boot'],
        ],
        viewMode: true,
        renderView: (v) => {
          return (
            <Tag color="blue">
              {{
                normal: 'Normal',
                lib: 'Library',
                init: 'Init',
                boot: 'Boot',
              }[v] || v}
            </Tag>
          );
        },
        tooltip: 'Plugin type is readonly.',
        initialValue: 'normal',
        order: 20,
      },

      {
        key: 'owners',
        label: 'Owners',
        order: 30,
        initialValue: [window.MUSE_GLOBAL.getUser()?.username].filter(Boolean),
        widget: Select,
        widgetProps: {
          mode: 'tags',
          style: { width: '100%' },
          popupClassName: 'hidden',
          tokenSeparators: [' '],
        },
        renderView: (owners) => {
          return owners?.map((o) => <Tag>{o}</Tag>);
        },
        tooltip:
          'If ACL plugin enabled, only owners can manage the plugin. Seperated by whitespace.',
      },
      {
        key: 'description',
        label: 'Description',
        order: 100,
        widget: 'textarea',
        widgetProps: { rows: 5 },
        initialValue: '',
      },
    ],
  };

  const handleFinish = useCallback(() => {
    const values = form.getFieldsValue();
    const payload = {
      pluginName: plugin.name,
      changes: {
        set: Object.entries(values).map(([key, value]) => ({ path: key, value })),
      },
    };

    updatePlugin(payload)
      .then(async () => {
        modal.hide();
        message.success('Create plugin success.');
        await syncStatus();
      })
      .catch((err) => {
        console.log('failed to deploy', err);
      });
  }, [updatePlugin, syncStatus, modal, plugin, form]);

  const { watchingFields } = utils.extendFormMeta(meta, 'museManager.pm.pluginInfoForm', {
    meta,
    form,
    app,
    plugin,
    viewMode,
  });
  const updateOnChange = NiceForm.useUpdateOnChange(watchingFields);

  const nodes = [];
  nodes.push({
    order: 10,
    node: (
      <>
        <RequestStatus loading={updatePluginPending} error={updatePluginError} />
        <Form
          layout="horizontal"
          form={form}
          onValuesChange={updateOnChange}
          onFinish={handleFinish}
        >
          <NiceForm meta={meta} />
        </Form>
      </>
    ),
  });

  utils.extendArray(nodes, 'nodes', 'museManager.pm.pluginInfoView', {
    viewMode,
    plugin,
    app,
  });
  return (
    <Modal
      {...antdModalV5(modal)}
      title={(viewMode ? 'Plugin Detail: ' : `Edit Plugin: `) + plugin.name}
      width="700px"
      maskClosable={viewMode}
      className="muse-manager_pm-plugin-info-modal"
      okText={viewMode ? 'Edit' : 'Save'}
      okButtonProps={{ type: viewMode ? 'default' : 'primary' }}
      cancelText={viewMode ? 'Close Dialog' : 'Cancel'}
      onCancel={() => {
        if (viewMode) {
          modal.hide();
        } else {
          form.resetFields();
          setViewMode(true);
        }
      }}
      onOk={() => {
        if (viewMode) {
          setViewMode(false);
        } else {
          form.validateFields().then(() => form.submit());
        }
      }}
    >
      {nodes.map((n) => n.node)}
    </Modal>
  );
});

export default PluginInfoModal;
