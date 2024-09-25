import React, { useCallback, useState } from 'react';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, message, Select, Form, Tag } from 'antd';
import NiceForm from '@ebay/nice-form-react';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import utils from '@ebay/muse-lib-antd/src/utils';
import { useSyncStatus, useMuseMutation, useAbility } from '../../hooks';
import ModalFooter from '../common/ModalFooter';

const PluginInfoModal = NiceModal.create(({ plugin, app }) => {
  const modal = useModal();
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState(true);
  const syncStatus = useSyncStatus('muse.plugins');
  const ability = useAbility();
  const {
    mutateAsync: updatePlugin,
    error: updatePluginError,
    isLoading: updatePluginPending,
  } = useMuseMutation('pm.updatePlugin');

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
        viewWidget: ({ value: v }) => {
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
        viewWidget: ({ value: owners }) => {
          return (
            <span>
              {owners?.map((o) => (
                <Tag key={o}>{o}</Tag>
              ))}
            </span>
          );
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
        message.success('Updated plugin success.');
        await syncStatus();
      })
      .catch((err) => {
        console.log('failed to update', err);
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
      <React.Fragment key="form">
        <RequestStatus loading={updatePluginPending} error={updatePluginError} />
        <Form
          layout="horizontal"
          form={form}
          onValuesChange={updateOnChange}
          onFinish={handleFinish}
        >
          <NiceForm meta={meta} />
        </Form>
      </React.Fragment>
    ),
  });

  utils.extendArray(nodes, 'nodes', 'museManager.pm.pluginInfoView', {
    viewMode,
    plugin,
    app,
  });

  const cannotEdit = ability.cannot('edit', 'Plugin', { app, plugin });

  const footerItems = [
    {
      key: 'cancel-btn',
      order: 10,
      props: {
        children: viewMode ? 'Close Dialog' : 'Cancel',
        onClick: () => {
          if (viewMode) {
            modal.hide();
          } else {
            form.resetFields();
            setViewMode(true);
          }
        },
      },
    },
    {
      key: 'ok-btn',
      order: 20,
      tooltip: cannotEdit ? 'Only plugin owners can edit plugin.' : '',
      props: {
        type: viewMode ? 'default' : 'primary',
        disabled: cannotEdit,
        children: viewMode ? 'Edit' : 'Save',
        onClick: () => {
          if (viewMode) {
            setViewMode(false);
          } else {
            form.validateFields().then(() => form.submit());
          }
        },
      },
    },
  ];

  utils.extendArray(footerItems, 'items', 'museManager.pm.pluginInfoModal.footer', {
    items: footerItems,
  });

  return (
    <Modal
      {...antdModalV5(modal)}
      title={(viewMode ? 'Plugin Detail: ' : `Edit Plugin: `) + plugin.name}
      width="600px"
      maskClosable={viewMode}
      className="muse-manager_pm-plugin-info-modal"
      footer={false}
    >
      {nodes.map((n) => n.node)}
      <ModalFooter items={footerItems} />
    </Modal>
  );
});

export default PluginInfoModal;
