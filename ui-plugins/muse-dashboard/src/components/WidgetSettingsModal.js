import React, { useCallback } from 'react';
import { Form, Modal } from 'antd';
import FormBuilder from 'antd-form-builder';
import NiceModal, { useModal, antdModal } from '@ebay/nice-modal-react';

const WidgetSettingsModal = NiceModal.create(({ widgetMeta, settings }) => {
  const [form] = Form.useForm();
  const modal = useModal();

  const handleSaveSettings = useCallback(
    evt => {
      if (evt && evt.preventDefault) evt.preventDefault();
      form.validateFields().then(values => {
        modal.resolve(values);
        modal.hide();
      });
    },
    [modal, form],
  );
  const formMeta = { ...widgetMeta.settingsForm };
  if (!formMeta.initialValues) formMeta.initialValues = {};
  if (settings) {
    Object.assign(formMeta.initialValues, settings);
  }

  return (
    <Modal
      {...antdModal(modal)}
      className="dashboard_dashboard-widget-settings-modal"
      title={`Settings: ${widgetMeta.name}`}
      width="600px"
      onOk={handleSaveSettings}
    >
      <Form form={form} onFinish={handleSaveSettings}>
        <FormBuilder form={form} meta={formMeta} />
      </Form>
    </Modal>
  );
});
export default WidgetSettingsModal;
