import _ from 'lodash';
import { Modal } from 'antd';
import NiceModal from '@ebay/nice-modal-react';
import WidgetSettingsModal from './WidgetSettingsModal';
import './Widget.less';
const Widget = ({
  name,
  id,
  editing,
  meta,
  setDashboardState,
  component: WidgetComp,
  dashboardContext,
  settings,
}) => {
  const handleRemove = () => {
    Modal.confirm({
      title: 'Confirm to Remove',
      content: `Are you sure to remove the widget "${name}"?`,
      onOk: () => {
        setDashboardState((s) => {
          const dataToRender = [...s.dataToRender];
          _.remove(dataToRender, { id });
          return {
            ...s,
            dataToRender,
          };
        });
      },
    });
  };
  const handleSettings = async () => {
    const values = await NiceModal.show(WidgetSettingsModal, { settings, widgetMeta: meta });
    setDashboardState((s) => {
      const dataToRender = [...s.dataToRender];
      const i = _.findIndex(dataToRender, { id });
      dataToRender[i] = { ...dataToRender[i], settings: values };
      return {
        ...s,
        dataToRender,
      };
    });
  };
  return (
    <div className="muse-dashboard_widget">
      {editing && (
        <div className="muse-dashboard_widget-toolbar">
          {meta.settingsForm && (
            <div className="widget-toolbar-btn" onClick={handleSettings}>
              <i className="gg-more-vertical-alt" />
            </div>
          )}
          <div className="widget-toolbar-btn" onClick={handleRemove}>
            <i className="gg-close" />
          </div>
        </div>
      )}
      {editing && <div className="dragging-overlay" />}
      <div className="muse-dashboard_widget-content">
        <WidgetComp name={name} dashboardContext={dashboardContext} {...settings} />
      </div>
    </div>
  );
};
export default Widget;
