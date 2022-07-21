import NiceModal, { useModal, antdModal } from '@ebay/nice-modal-react';
import { Modal, Button, Form } from 'antd';
import FormBuilder from 'antd-form-builder';
const BuildPluginModal = NiceModal.create(({ plugin }) => {
  const modal = useModal();

  const meta = {
    columns: 1,
    elements: [
      {
        key: 'currentVersion',
        label: 'Current Version',
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

  return (
    <Modal {...antdModal(modal)} title={`Build Plugin: ${plugin.name}`} width="600px">
      <Form>
        <FormBuilder meta={meta} />
      </Form>
    </Modal>
  );
});

export default BuildPluginModal;
