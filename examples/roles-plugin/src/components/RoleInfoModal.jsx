import { useCallback } from 'react';
import { Form, Modal } from 'antd';
import FormBuilder from '@ebay/nice-form-react';
import { useDispatch } from 'react-redux';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { useAddRole, useEditRole } from '../hooks/useRoleMutation'; 

const RoleInfoModal = NiceModal.create(({ role }) => {
  const modal = useModal();
  const [form] = Form.useForm();
  const meta = {
    initialValues: role, 
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'description', label: 'Description', widget: 'textarea', required: true },
      { key: 'duty', label: 'Duty', widget: 'textarea', required: true },
      { key: 'roleLevel', label: 'Role Level', widget: 'textarea', required: true },
    ],
  };

  const addRoleMutation = useAddRole();
  const editRoleMutation = useEditRole();

  const handleSubmit = useCallback(() => {
    form.validateFields().then(async () => {
      const formData = form.getFieldsValue();
      let result;
      if (!role) {
        result = await addRoleMutation.mutateAsync(formData);
      } else {
        result = await editRoleMutation.mutateAsync({ ...formData, id: role.id });
      }
      modal.resolve(result);
      modal.hide();
    });
  }, [modal, role, form, addRoleMutation, editRoleMutation]);
  
  return (
    <Modal
      {...antdModalV5(modal)}
      title={role ? 'Edit Role' : 'New Role'}
      okText={role ? 'Update' : 'Create'}
      onOk={handleSubmit}
    >
      <Form form={form}>
        <FormBuilder meta={meta} />
      </Form>
    </Modal>
  );
});
export default RoleInfoModal;
