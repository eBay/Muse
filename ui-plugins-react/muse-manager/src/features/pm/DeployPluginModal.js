import NiceModal, { useModal, antdModal } from '@ebay/nice-modal-react';
import { Modal, Button, Form } from 'antd';
import FormBuilder from 'antd-form-builder';

import PluginReleaseSelect from './PluginReleaseSelect';
const DeployPluginModal = NiceModal.create(({ plugin, app }) => {
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
        widget: PluginReleaseSelect,
        widgetProps: { pluginName: plugin.name },
      },
      {
        key: 'envs',
        label: 'Environments',
      },
    ],
  };

  return (
    <Modal {...antdModal(modal)} title={`Deploy Plugin: ${plugin.name}`} width="600px">
      <Form>
        <FormBuilder meta={meta} />
      </Form>
    </Modal>
  );
});

export default DeployPluginModal;
