import { Button } from 'antd';
import NiceModal from '@ebay/nice-modal-react';
import AddWidgetModal from './AddWidgetModal';

export default function DashboardToolbar({ setDashArgs }) {
  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          setDashArgs(s => ({ ...s, editing: !s.editing }));
        }}
      >
        Edit
      </Button>
      <Button
        type="primary"
        onClick={() => {
          NiceModal.show(AddWidgetModal);
        }}
      >
        Add Widget
      </Button>
    </div>
  );
}
