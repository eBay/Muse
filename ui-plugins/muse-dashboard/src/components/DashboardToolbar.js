import { useCallback, useMemo } from 'react';
import { Button } from 'antd';
import _ from 'lodash';
import jsPlugin from 'js-plugin';
import NiceModal from '@ebay/nice-modal-react';
import AddWidgetModal from './AddWidgetModal';
import './DashboardToolbar.less';
import WidgetSettingsModal from './WidgetSettingsModal';
import useStorage from '../hooks/useStorage';

export default function DashboardToolbar({
  setDashboardState,
  dashboardKey,
  dashboardName,
  dashboardState,
}) {
  const widgetMetaByKey = useMemo(
    () => _.keyBy(_.flatten(jsPlugin.invoke('museDashboard.widget.getWidgets')), 'key'),
    [],
  );
  const handleAddWidget = useCallback(async () => {
    const addedWidget = await NiceModal.show(AddWidgetModal);
    const widgetMeta = widgetMetaByKey[addedWidget.key];
    let settings = null;
    if (widgetMeta.settingsForm) {
      settings = await NiceModal.show(WidgetSettingsModal, {
        widgetMeta,
        settings: {},
      });
    }

    setDashboardState(s => {
      const dataToRender = [...s.dataToRender];

      const width = _.castArray(widgetMeta.width || 4);
      const height = _.castArray(widgetMeta.height || 8);

      dataToRender.push({
        id: _.uniqueId('new-widget'),
        widget: addedWidget.key,
        grid: {
          x: 0,
          y: dataToRender.length
            ? Math.max(...dataToRender.map(item => item.grid.y + item.grid.h)) || 0
            : 0,
          w: width[0],
          h: height[0],
          minW: width[1] || 1,
          maxW: width[2] || 12,
          minH: height[1] || 1,
          maxH: height[2] || 100000,
        },
        settings,
      });
      // setDashboardState(s => ({ ...s, dataToRender }));

      return {
        ...s,
        dataToRender,
      };
    });
  }, [setDashboardState, widgetMetaByKey]);

  const {
    action: saveDashboard,
    pending: saveDashboardPeding,
    error: saveDashboardError,
  } = useStorage('saveDashboard');
  const handleSave = () => {
    saveDashboard(dashboardKey, dashboardName, dashboardState.dataToRender);
  };
  return (
    <div className="muse-dashboard_toolbar">
      {dashboardState.editing && (
        <Button
          onClick={() => {
            setDashboardState(s => ({ ...s, editing: false, dataToRender: _.clone(s.rawData) }));
          }}
        >
          Cancel
        </Button>
      )}
      {dashboardState.editing && (
        <Button type="primary" onClick={handleSave}>
          Save
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
        <Button type="primary" onClick={handleAddWidget}>
          Add Widget
        </Button>
      )}
    </div>
  );
}
