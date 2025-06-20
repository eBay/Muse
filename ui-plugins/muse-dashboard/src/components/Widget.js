import React from 'react';
import _ from 'lodash';
import { Modal } from 'antd';
import NiceModal from '@ebay/nice-modal-react';
// import { ErrorBoundary } from '@ebay/muse-lib-react/src/features/common';
import WidgetSettingsModal from './WidgetSettingsModal';
import './Widget.less';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <p className="failed-render-widget">{this.props.message || 'Something went wrong.'}</p>
      );
    }

    return this.props.children;
  }
}

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
        <ErrorBoundary message={`Failed to render the widget: ${name}.`}>
          <WidgetComp name={name} dashboardContext={dashboardContext} {...settings} />
        </ErrorBoundary>
      </div>
    </div>
  );
};
export default Widget;
