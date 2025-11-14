import { useCallback, useMemo } from 'react';
import { Button, message, Menu, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import jsPlugin from 'js-plugin';
import NiceModal from '@ebay/nice-modal-react';
import AddWidgetModal from './AddWidgetModal';
import './DashboardToolbar.less';
import WidgetSettingsModal from './WidgetSettingsModal';
import useStorage from '../hooks/useStorage';
import useSearchState from '../hooks/useSearchState';
import NewDashboardModal from './NewDashboardModal';

export default function DashboardToolbar({
  title,
  defaultLayout,
  setDashboardState,
  dashboardKey,
  nameQuery,
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

    setDashboardState((s) => {
      const dataToRender = [...s.dataToRender];

      const width = _.castArray(widgetMeta.width || 4);
      const height = _.castArray(widgetMeta.height || 8);

      dataToRender.push({
        id: `w-${Date.now()}`,
        widget: addedWidget.key,
        grid: {
          x: 0,
          y: dataToRender.length
            ? Math.max(...dataToRender.map((item) => item.grid.y + item.grid.h)) || 0
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

      return {
        ...s,
        dataToRender,
      };
    });
  }, [setDashboardState, widgetMetaByKey]);

  const {
    action: saveDashboard,
    pending: saveDashboardPending,
    error: saveDashboardError,
  } = useStorage('saveDashboard');

  const handleSave = () => {
    saveDashboard(dashboardKey, dashboardName, dashboardState.dataToRender).then(() => {
      message.success({ content: 'Dashboard saved!', duration: 2 });
      setDashboardState((s) => ({ ...s, editing: false }));
    });
  };

  const {
    data: dashboardList,
    action: getDashboardList,
    // pending: getDashboardListPending,
    // error: getDashboardListError,
  } = useStorage('getDashboardList', [dashboardKey]);
  const [dashboardName, setDashboardName] = useSearchState(nameQuery, 'default');
  const menuItems = dashboardList?.map((d) => ({ key: _.kebabCase(d.name), label: d.name })) || [];
  menuItems.push({
    key: '__new_dashboard',
    label: <Button type="link">+ New Dashboard</Button>,
  });

  const menu = dashboardList ? (
    <Menu
      onClick={async ({ key }) => {
        if (key === '__new_dashboard') {
          const { name } = await NiceModal.show(NewDashboardModal, {
            currentLayout: dashboardState.dataToRender,
            dashboardKey,
            dashboardList,
            defaultLayout,
          });
          await getDashboardList(dashboardKey);
          setDashboardName(_.kebabCase(name));
          return;
        }
        setDashboardName(key);
      }}
      items={menuItems}
    />
  ) : null;

  const currentDashboardName =
    dashboardList?.find((d) => _.kebabCase(d.name) === dashboardName)?.name || 'Unknown Dashboard';
  return (
    <div className="muse-dashboard_toolbar">
      {dashboardList && !title ? (
        <Dropdown overlay={menu}>
          <h3 style={{ marginRight: 'auto' }}>
            <label style={{ marginRight: '10px' }}>{currentDashboardName}</label>
            <DownOutlined />
          </h3>
        </Dropdown>
      ) : null}
      {(title && <h3 style={{ marginRight: 'auto' }}>{title}</h3>) || null}
      <RequestStatus pending={saveDashboardPending} error={saveDashboardError} />

      {dashboardState.editing && (
        <Button
          onClick={() => {
            setDashboardState((s) => ({
              ...s,
              editing: false,
              dataToRender: _.cloneDeep(s.rawData),
            }));
          }}
        >
          Cancel
        </Button>
      )}
      {dashboardState.editing && (
        <Button
          type="primary"
          loading={saveDashboardPending}
          disabled={saveDashboardPending}
          onClick={handleSave}
        >
          {saveDashboardPending ? 'Saving...' : 'Save'}
        </Button>
      )}
      {!dashboardState.editing && (
        <Button
          onClick={() => {
            setDashboardState((s) => ({ ...s, editing: true }));
          }}
        >
          Edit Dashboard
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
