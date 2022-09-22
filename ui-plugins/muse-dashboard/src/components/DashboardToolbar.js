import { Button } from 'antd';
import NiceModal from '@ebay/nice-modal-react';
import AddWidgetModal from './AddWidgetModal';
import './DashboardToolbar.less';

export default function DashboardToolbar({ setDashboardState, dashboardState }) {
  console.log(dashboardState);
  return (
    <div className="muse-dashboard_toolbar">
      {dashboardState.editing && (
        <Button
          onClick={() => {
            setDashboardState(s => ({ ...s, editing: false }));
          }}
        >
          Cancel
        </Button>
      )}
      {!dashboardState.editing && (
        <Button
          type="primary"
          onClick={() => {
            setDashboardState(s => ({ ...s, editing: true }));
          }}
        >
          Edit
        </Button>
      )}
      {dashboardState.editing && (
        <Button
          type="primary"
          onClick={async () => {
            const addedWidget = await NiceModal.show(AddWidgetModal);
            console.log(addedWidget);
            setDashboardState(s => {
              return { ...s, addedWidget };
            });
          }}
        >
          Add Widget
        </Button>
      )}
    </div>
  );
}
