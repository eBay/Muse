import { useCallback } from 'react';
import { Form, Modal } from 'antd';
import FormBuilder from 'antd-form-builder';
import jsPlugin from 'js-plugin';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
import NiceModal, { useModal, antdModal } from '@ebay/nice-modal-react';

export default NiceModal.create(({ user }) => {
  const modal = useModal();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const formFields = [
    { key: 'name', label: 'Name', order: 10, required: true },
    { key: 'job', label: 'Job Title', order: 20, required: true },
  ];
  formFields.push(
    ..._.flatten(jsPlugin.invoke('userInfo.fields.getFields', { formFields })).filter(Boolean),
  );
  jsPlugin.sort(formFields);
  const meta = {
    initialValues: user,
    fields: formFields,
  };

  const handleSubmit = useCallback(() => {
    form.validateFields().then(() => {
      const newUser = { ...form.getFieldsValue() };
      newUser.id = user.id;
      dispatch({
        type: 'update-user',
        payload: newUser,
      });
      modal.resolve(newUser);
      modal.hide();
    });
  }, [modal, user, form, dispatch]);
  return (
    <Modal
      {...antdModal(modal)}
      title={user ? 'Edit User' : 'New User'}
      okText={user ? 'Update' : 'Create'}
      onOk={handleSubmit}
    >
      <Form form={form}>
        <FormBuilder meta={meta} form={form} />
      </Form>
    </Modal>
  );
});
