import { useCallback, useState } from 'react';
import { Form, Modal } from 'antd';
import FormBuilder from '@ebay/nice-form-react';
import jsPlugin from 'js-plugin';
import { useDispatch } from 'react-redux';
import { UserOutlined } from '@ant-design/icons';
import _ from 'lodash';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import './UserInfoModal.less';

export default NiceModal.create(({ user }) => {
  const modal = useModal();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [updatedAvatar, setUpdatedAvatar] = useState();

  const formFields = [
    { key: 'name', label: 'Name', order: 10, required: true },
    { key: 'job', label: 'Job Title', order: 20 },
    { key: 'address', label: 'Address', order: 30 },
  ];
  formFields.push(
    ..._.flatten(jsPlugin.invoke('userInfo.fields.getFields', { formFields })).filter(Boolean),
  );
  jsPlugin.sort(formFields);

  const meta = {
    initialValues: user,
    fields: formFields,
    formItemLayout: [6, 18],
  };

  const handleSubmit = useCallback(() => {
    form.validateFields().then(() => {
      const newUser = { ...form.getFieldsValue() };
      if (updatedAvatar) newUser.avatar = updatedAvatar;
      if (!user) {
        // Create a new user
        dispatch({
          type: 'new-user',
          payload: newUser,
        });
      } else {
        // Update an existing user
        newUser.id = user.id;
        dispatch({
          type: 'update-user',
          payload: newUser,
        });
      }
      modal.resolve(newUser);
      modal.hide();
    });
  }, [modal, user, form, dispatch, updatedAvatar]);

  const handleChangeAvatar = useCallback((evt) => {
    const file = evt.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setUpdatedAvatar(reader.result);
    });
    reader.readAsDataURL(file);
  }, []);

  const avatarToShow = updatedAvatar || user?.avatar;
  return (
    <Modal
      {...antdModalV5(modal)}
      title={user ? 'Edit User' : 'New User'}
      okText={user ? 'Update' : 'Create'}
      onOk={handleSubmit}
      width="800px"
    >
      <div className="user-info-modal">
        <div className="user-avatar">
          {avatarToShow ? <img src={avatarToShow} alt="user-avatar" /> : <UserOutlined />}
          <input type="file" onChange={handleChangeAvatar} />
        </div>

        <Form form={form}>
          <FormBuilder meta={meta} />
        </Form>
      </div>
    </Modal>
  );
});
