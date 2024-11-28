import { UserAddOutlined } from '@ant-design/icons';
import NiceModal from '@ebay/nice-modal-react';
import UserInfoModal from './UserInfoModal';
import './CreateUserWidget.less';

const CreateUserWidget = () => {
  return (
    <div className="create-user-widget" onClick={() => NiceModal.show(UserInfoModal)}>
      <UserAddOutlined />
      <label>Create an User</label>
    </div>
  );
};
export default CreateUserWidget;
