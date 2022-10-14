import { useCallback } from 'react';
import { Form, Modal } from 'antd';
import FormBuilder from 'antd-form-builder';
import { useDispatch } from 'react-redux';
import NiceModal, { useModal, antdModal } from '@ebay/nice-modal-react';

const RoleInfoModal = NiceModal.create(({ role }) => {
  const dispatch = useDispatch();
  const modal = useModal();
  const [form] = Form.useForm();
  const meta = {
    initialValues: role,
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'description', label: 'Description', widget: 'textarea', required: true },
    ],
  };

  const handleSubmit = useCallback(() => {
    form.validateFields().then(() => {
      const newRole = { ...form.getFieldsValue() };
      if (!role) {
        // Create a new role
        dispatch({
          type: 'new-role',
          payload: newRole,
        });
      } else {
        // Update a role
        newRole.id = role.id;
        dispatch({
          type: 'update-role',
          payload: newRole,
        });
      }

      modal.resolve(newRole);
      modal.hide();
    });
  }, [modal, role, dispatch, form]);
  return (
    <Modal
      {...antdModal(modal)}
      title={role ? 'Edit Role' : 'New Role'}
      okText={role ? 'Update' : 'Create'}
      onOk={handleSubmit}
    >
      <Form form={form}>
        <FormBuilder meta={meta} form={form} />
      </Form>
    </Modal>
  );
});
export default RoleInfoModal;
