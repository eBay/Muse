import { useCallback, useState } from 'react';
import { Form, Modal } from 'antd';
import FormBuilder from '@ebay/nice-form-react';
import jsPlugin from 'js-plugin';
import { UserOutlined } from '@ant-design/icons';
import _ from 'lodash';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import './UserInfoModal.less';
import { useAddUser, useEditUser } from '../hooks/useUserMutation';
import useAvatar from '../hooks/useAvatar';
import { useAvatarMutation } from '../hooks/useAvatarMutation';

export default NiceModal.create(({ user }) => {
  const modal = useModal();
  const [form] = Form.useForm();
  const { mutateAsync: addUser } = useAddUser();
  const { mutateAsync: editUser } = useEditUser();
  const [updatedAvatar, setUpdatedAvatar] = useState();
  const avatarUrl = useAvatar({ ...user, avatar: updatedAvatar || user?.avatar });
  const { mutateAsync: updateAvatar } = useAvatarMutation();

  const formFields = [
    { key: 'name', label: 'Name', order: 10, required: true },
    { key: 'job', label: 'Job Title', order: 20 },
    { key: 'city', label: 'City', order: 30 },
    { key: 'address', label: 'Address', order: 40 },
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
    form.validateFields().then(async () => {
      const newUser = { ...form.getFieldsValue() };
      if (updatedAvatar) newUser.avatar = updatedAvatar;
      let savedUser;
      if (!user) {
        savedUser = await addUser(newUser);
      } else {
        newUser.id = user.id;
        await editUser(newUser);
        if (updatedAvatar && updatedAvatar !== user.avatar) {
          await updateAvatar({ id: user.id, avatar: updatedAvatar });
        }
      }
      savedUser = newUser;
      modal.resolve(savedUser);
      modal.hide();
    });
  }, [modal, user, form, updatedAvatar, addUser, editUser, updateAvatar]);

  const handleChangeAvatar = useCallback((evt) => {
    const file = evt.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setUpdatedAvatar(reader.result);
    });
    reader.readAsDataURL(file);
  }, []);

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
          {avatarUrl ? <img src={avatarUrl} alt="user-avatar" /> : <UserOutlined />}
          <input type="file" onChange={handleChangeAvatar} />
        </div>
        <Form form={form}>
          <FormBuilder meta={meta} />
        </Form>
      </div>
    </Modal>
  );
});
