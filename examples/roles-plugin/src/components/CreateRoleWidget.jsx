import { SolutionOutlined } from '@ant-design/icons';
import NiceModal from '@ebay/nice-modal-react';
import RoleInfoModal from './RoleInfoModal';
import './CreateRoleWidget.less';

const CreateRoleWidget = () => {
  return (
    <div
      className="create-role-widget"
      onClick={() => NiceModal.show(RoleInfoModal)}
    >
      <SolutionOutlined />
      <label>Create a Role</label>
    </div>
  );
};

export default CreateRoleWidget;