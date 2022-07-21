import { useCallback } from 'react';
import NiceModal, { useModal, antdModal } from '@ebay/nice-modal-react';
import { Modal, Button, Form } from 'antd';
import FormBuilder from 'antd-form-builder';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { useMuseApi } from '../../hooks/useMuse';
import { getPluginId } from '../../utils';

const user = window.MUSE_GLOBAL.getUser();
const BuildPluginModal = NiceModal.create(({ plugin }) => {
  const modal = useModal();
  const [form] = Form.useForm();

  const {
    action: createRequest,
    error: createRequestError,
    pending: createRequestPending,
  } = useMuseApi('req.createRequest');
  const meta = {
    columns: 1,
    elements: [
      {
        key: 'pluginName',
        label: 'Plugin name',
        viewMode: true,
        initialValue: plugin.name,
      },
      {
        key: 'currentVersion',
        label: 'Current Version',
        viewMode: true,
      },
      {
        key: 'version',
        label: 'Version',
      },
      {
        key: 'branch',
        label: 'Branch to build',
      },
      {
        key: 'autoDeploy',
        label: 'Auto Deploy',
        widget: 'checkbox',
      },
    ],
  };

  const handleFinish = useCallback(() => {
    const values = form.getFieldsValue();
    createRequest({
      id: `build-plugin_${getPluginId(plugin.name)}`,
      type: 'build-plugin',
      msg: `Build plugin ${plugin.name} by ${user.username}`,
      payload: {
        pluginName: plugin.name,
        buildBranch: values.branch || 'main',
        newVersion: 'patch',
      },
    })
      .then(() => {
        Modal.success({
          title: 'Request build success!',
          content: `The jenkins job is triggered to build the plugin. `,
          onOk: () => {
            modal.hide();
          },
        });
      })
      .catch(err => {
        console.log('failed to deploy', err);
      });
  }, [createRequest, plugin.name, modal, form]);

  return (
    <Modal
      {...antdModal(modal)}
      title={`Build Plugin`}
      width="600px"
      okText="Build"
      onOk={() => {
        form.validateFields().then(() => form.submit());
      }}
    >
      <RequestStatus loading={createRequestPending} error={createRequestError} />
      <Form layout="horizontal" form={form} onFinish={handleFinish}>
        <FormBuilder form={form} meta={meta} />
      </Form>
    </Modal>
  );
});

export default BuildPluginModal;
