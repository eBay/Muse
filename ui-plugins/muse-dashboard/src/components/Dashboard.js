import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import GridLayout, { WidthProvider } from 'react-grid-layout';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import _ from 'lodash';
import plugin from 'js-plugin';
import { Alert, Button, message, Tooltip, Modal } from 'antd';
import { RequestStatus, NiceModal } from 'muse-antd/features/common';
import Icon from 'muse-antd/features/common/Icon';
// import { useSetModalVisible } from 'altus-ui/features/common/redux/hooks';
import {
  Widget,
  ShareModal,
  DashboardSelect,
  WidgetNotFound,
  AddWidgetModal,
  WidgetSettingsModal,
  SharedToolbar,
} from './';
import {
  useSetAddWidgetModalVisible,
  useSaveDashboard,
  useFetchDashboard,
  useFetchDashboards,
  useSaveDashboards,
  useDeleteDashboard,
  useFetchSharedDashboard,
} from './redux/hooks';

const ResponsiveGridLayout = WidthProvider(props => {
  const minWidth = 800;
  return <GridLayout {...props} width={Math.max(minWidth, props.width)} />;
});

export default function Dashboard({ dashboardKey, defaultLayout = [], dashboardContext }) {
  const { dashboards, fetchDashboardsPending, fetchDashboardsError } = useFetchDashboards([
    dashboardKey,
    defaultLayout, // this is used to create default dashboard if no dashboard exist.
  ]);
  const { saveDashboard, saveDashboardPending } = useSaveDashboard();
  const { saveDashboards, saveDashboardsPending } = useSaveDashboards();
  const tempDashboardName = useRef();
  const tempDashboardTheme = useRef();
  const history = useHistory();
  const [shared, setShared] = useState();
  const [sharedError, setSharedError] = useState(null);
  const {
    fetchSharedDashboard,
    fetchSharedDashboardPending,
    fetchSharedDashboardError,
  } = useFetchSharedDashboard();
  const query = useSelector(s => _.get(s, 'router.location.query'));
  const dashboardName = decodeURIComponent((query && query.dashboard) || '');
  const sharedStr = query.shared;
  let sharedBy = null;
  let sharedDashboardId = null;

  if (sharedStr) {
    try {
      const arr = atob(sharedStr).split(':');
      if (arr.length < 2) {
        if (!sharedError) setSharedError('Invalid share link.');
      } else {
        sharedBy = arr[0];
        sharedDashboardId = arr[1];
      }
    } catch (err) {
      if (!sharedError) setSharedError('Invalid share link.');
    }
  }

  useEffect(() => {
    if (sharedBy && sharedDashboardId)
      fetchSharedDashboard(sharedBy, sharedDashboardId).then(res => {
        setShared(res);
      });
  }, [sharedBy, sharedDashboardId, fetchSharedDashboard]);

  const [editing, setEditing] = useState(false);
  useEffect(() => {
    // clear temp dashboard name when finish editing
    if (!editing) {
      tempDashboardName.current = '';
      tempDashboardTheme.current = '';
    }
  }, [editing]);

  const { addWidgetModalVisible, setAddWidgetModalVisible } = useSetAddWidgetModalVisible();
  const modalWidgetSettings = NiceModal.useModal('dashboard_dashboard-widget-settings-modal');
  const modalShare = NiceModal.useModal('dashboard-share-modal');
  // const {
  //   visible: widgetSettingsModalVisible,
  //   setModalVisible: setWidgetSettingsModalVisible,
  // } = useSetModalVisible('dashboard_dashboard-widget-settings-modal');

  // const { visible: shareModalVisible, setModalVisible: setShareModalVisible } = useSetModalVisible(
  //   'dashboard-share-modal',
  // );

  const [newWidgets, setNewWidgets] = useState([]);
  const [removedWidgets, setRemovedWidgets] = useState([]);
  const [widgetSettings, setWidgetSettings] = useState({});
  const [widgetGrids, setWidgetGrids] = useState({});
  const allWidgets = useMemo(() => _.flatten(plugin.invoke('dashboard.widget.getWidgets')), []);
  const widgetMetaByKey = useMemo(() => _.keyBy(allWidgets, 'key'), [allWidgets]);

  const current = useMemo(() => {
    let current = null;
    if (dashboards && dashboardName) {
      current = _.find(dashboards, { name: dashboardName });
    } else if (dashboards && !dashboardName) {
      current = dashboards[0];
    }

    if (current) {
      return current;
    } else if (dashboards && dashboardName) {
      // If dashboard name doesn't exist
      history.push(document.location.pathname);
    }
    return null;
  }, [dashboardName, dashboards, history]);
  const { id: dashboardId, theme = 'light' } = current || {};
  const { layout, fetchDashboardPending, fetchDashboardError } = useFetchDashboard([
    dashboardId,
    !!sharedStr,
  ]);
  const widgets = useMemo(() => {
    const newWidgetById = _.keyBy(newWidgets, 'id');
    let arr = [];
    const layoutToRender = (sharedStr ? shared : layout) || [];
    layoutToRender.forEach(item => {
      if (newWidgetById[item.id]) delete newWidgetById[item.id]; // if duplicated, use which from API.
      const widgetMeta = widgetMetaByKey[item.key];

      arr.push({
        id: item.id,
        grid: {
          x: item.x || 0,
          y: item.y || 0,
          w: item.w || 4,
          h: item.h || 5,
        },
        widgetMeta: widgetMeta || {
          key: item.key,
          widget: WidgetNotFound,
          widgetProps: {
            widgetKey: item.key,
          },
        },
        settings: item.settings,
      });
    });
    arr.push(...Object.values(newWidgetById));
    arr = arr.map(w => {
      if (widgetGrids[w.id] || widgetSettings[w.id]) {
        return {
          ...w,
          grid: widgetGrids[w.id] || w.grid,
          settings: widgetSettings[w.id] || w.settings,
        };
      }
      return w;
    });
    return arr.filter(item => !removedWidgets.includes(item.id));
  }, [
    newWidgets,
    layout,
    widgetMetaByKey,
    removedWidgets,
    widgetSettings,
    sharedStr,
    shared,
    widgetGrids,
  ]);

  const doSaveDashboard = useCallback(
    toSave => {
      if (!dashboardId) {
        return;
      }
      const hide = message.loading('Saving dashboard...', 0);
      const newName = tempDashboardName.current;
      const newTheme = tempDashboardTheme.current;

      const saveD = () =>
        saveDashboard({
          id: dashboardId,
          layout: toSave,
        })
          .then(() => {
            hide();
            setNewWidgets([]);
            setRemovedWidgets([]);
          })
          .catch(() => {
            hide();
            message.error('Failed to save dashboard.');
          });
      if ((dashboardName !== newName && newName) || newTheme !== current.theme) {
        const newDashboards = dashboards
          .map(d => {
            if (!d.name) return null; // to fix no name issue.
            if (d.id !== dashboardId) return d;
            return {
              ...d,
              name: newName || current.name,
              theme: newTheme || current.theme || 'light',
            };
          })
          .filter(Boolean);
        saveDashboards(dashboardKey, newDashboards).then(() => {
          saveD().then(() => {
            if (dashboardName !== newName && newName) {
              history.push(
                `${document.location.pathname}?dashboard=${encodeURIComponent(newName)}`,
              );
            }
          });
        });
      } else {
        saveD();
      }
    },
    [
      dashboardId,
      dashboards,
      saveDashboards,
      dashboardKey,
      saveDashboard,
      dashboardName,
      history,
      current,
    ],
  );

  const handleLayoutChange = useCallback(
    layout => {
      setWidgetGrids(
        layout.reduce((p, c) => {
          p[c.i] = {
            w: c.w,
            h: c.h,
            x: c.x,
            y: c.y,
          };
          return p;
        }, {}),
      );
    },
    [setWidgetGrids],
  );

  const widgetsJson = useMemo(() => {
    return widgets.map(item => {
      const obj = {
        id: item.id,
        key: item.widgetMeta.key,
        w: item.grid.w,
        h: item.grid.h,
        x: item.grid.x,
        y: item.grid.y,
      };
      if (item.settings) {
        obj.settings = item.settings;
      }
      return obj;
    });
  }, [widgets]);

  const handleDone = useCallback(() => {
    doSaveDashboard(widgetsJson);
    setEditing(false);
    tempDashboardName.current = '';
    tempDashboardTheme.current = '';
  }, [widgetsJson, doSaveDashboard]);

  const showAddWidget = useCallback(() => {
    setAddWidgetModalVisible(true);
  }, [setAddWidgetModalVisible]);

  const handleSettingsWidget = useCallback(args => modalWidgetSettings.show(args), [
    modalWidgetSettings,
  ]);

  const handleAddWidget = useCallback(
    (id, widgetMeta) => {
      const width = _.castArray(widgetMeta.width || 4);
      const height = _.castArray(widgetMeta.height || 8);
      setNewWidgets([
        ...newWidgets,
        {
          id,
          widgetMeta,
          grid: {
            x: 0,
            y: widgets.length
              ? Math.max(...widgets.map(item => item.grid.y + item.grid.h)) || 0
              : 0,
            w: width[0],
            h: height[0],
            minW: width[1] || 1,
            maxW: width[2] || 12,
            minH: height[1] || 1,
            maxH: height[2] || 100000,
          },
          settings: null,
        },
      ]);

      // Auto show settings dialog if there's settings
      if (widgetMeta.settingsForm) {
        handleSettingsWidget({
          id,
          widgetMeta,
          settings: null,
        });
      }
    },
    [newWidgets, widgets, handleSettingsWidget],
  );

  const handleRemoveWidget = useCallback(
    id => {
      setRemovedWidgets([...removedWidgets, id]);
    },
    [removedWidgets],
  );

  const handleCancel = useCallback(() => {
    setRemovedWidgets([]);
    setNewWidgets([]);
    setWidgetGrids({});
    setWidgetSettings({});
    setEditing(false);
  }, []);

  const handleSaveSettings = useCallback(
    ({ id, values }) => {
      setWidgetSettings({
        ...widgetSettings,
        [id]: values,
      });
    },
    [setWidgetSettings, widgetSettings],
  );
  const handleShare = useCallback(() => {
    modalShare.show({
      dashboardName: dashboardName || dashboards[0].name,
      dashboardKey,
      dashboardId,
      widgetsJson,
    });
  }, [modalShare, dashboardId, dashboards, dashboardName, dashboardKey, widgetsJson]);

  const { deleteDashboard } = useDeleteDashboard();
  const handleDeleteDashboard = useCallback(() => {
    if (dashboards.length === 1) {
      Modal.error('There should be at lease one dashboard.');
      return;
    }
    Modal.confirm({
      title: 'Are you sure to delete the dashboard?',
      onOk() {
        const hide = message.loading('Deleting dashboard...');
        deleteDashboard(dashboardKey, dashboardId, dashboards).then(() => {
          hide();
          setEditing(false);
          history.push(document.location.pathname);
        });
      },
    });
  }, [dashboards, dashboardId, dashboardKey, deleteDashboard, history]);

  const gridLayout = widgets.map(w => {
    const g = {
      ...w.grid,
      i: w.id,
    };
    const width = _.castArray(w.widgetMeta.width);
    const height = _.castArray(w.widgetMeta.height);
    if (width[1]) g.minW = width[1];
    if (width[2]) g.maxW = width[2];
    if (height[1]) g.minH = height[1];
    if (height[2]) g.maxH = height[2];

    return g;
  });

  const backToMy = useCallback(() => {
    history.push(document.location.pathname);
    setShared(undefined);
    setSharedError(undefined);
  }, [history]);
  if (!/^[-a-z0-9_]+$/.test(dashboardKey)) {
    return (
      <div className="dashboard_dashboard-dashboard" style={{ padding: '30px', color: 'red' }}>
        Invalid dashboard key: {dashboardKey}, it should match "^[-a-z0-9_]+$".
      </div>
    );
  }

  if (shared === null) {
    return (
      <div className="dashboard_dashboard-dashboard" style={{ padding: '30px', color: 'red' }}>
        <Alert
          message="Shared dashboard not found"
          description={`The shared dashboard from ${sharedBy} is not found, it may be expired or deleted by the owner.`}
          type="warning"
          showIcon
        />
        <Button onClick={backToMy} style={{ marginTop: 20 }}>
          Back to my dashboards
        </Button>
      </div>
    );
  }

  if (sharedError) {
    return (
      <div className="dashboard_dashboard-dashboard" style={{ padding: '30px', color: 'red' }}>
        <Alert description={sharedError} type="error" showIcon />
        <Button onClick={backToMy} style={{ marginTop: 20 }}>
          Back to my dashboards
        </Button>
      </div>
    );
  }

  const errorStatus = fetchDashboardError || fetchDashboardsError || fetchSharedDashboardError;
  return (
    <div className={`dashboard_dashboard-dashboard dashboard-theme-${theme}`}>
      {(fetchDashboardPending ||
        fetchDashboardsPending ||
        fetchSharedDashboardPending ||
        errorStatus) && (
        <RequestStatus
          loading={!errorStatus && !layout}
          error={errorStatus}
          errorProps={{
            description:
              'Failed to show the dashboard, please refresh to retry or contact altus team for support.',
          }}
        />
      )}
      <RequestStatus loading={saveDashboardPending || saveDashboardsPending} />
      {!sharedStr && !errorStatus && (
        <div className="dashboard-toolbar">
          <DashboardSelect
            dashboardKey={dashboardKey}
            dashboardName={dashboardName}
            onAdd={() => setEditing(true)}
            editing={editing}
            onNameChange={name => (tempDashboardName.current = name)}
            onThemeChange={theme => (tempDashboardTheme.current = theme)}
          />

          {editing ? (
            <Button type="primary" onClick={handleDone}>
              Done
            </Button>
          ) : (
            <Tooltip title="Edit Dashboard">
              <Button onClick={() => setEditing(true)} icon={<Icon type="edit" />} shape="circle" />
            </Tooltip>
          )}
          {editing && <Button onClick={handleCancel}>Cancel</Button>}
          {editing && (
            <Tooltip title="Delete Dashboard">
              <Button
                onClick={handleDeleteDashboard}
                shape="circle"
                icon={<Icon type="delete" />}
                type="danger"
              />
            </Tooltip>
          )}
          {!editing && (
            <Tooltip title="Share Dashboard">
              <Button onClick={handleShare} icon={<Icon type="share-alt" />} shape="circle" />
            </Tooltip>
          )}

          {editing && (
            <Tooltip title="Add Widget">
              <Button onClick={showAddWidget} shape="circle" icon={<Icon type="plus" />} />
            </Tooltip>
          )}
        </div>
      )}
      {sharedBy && (
        <SharedToolbar sharedBy={sharedBy} layout={shared} dashboardKey={dashboardKey} />
      )}
      <ResponsiveGridLayout
        className="layout"
        isDraggable={editing}
        isResizable={editing}
        cols={12}
        rowHeight={30}
        margin={[20, 20]}
        onLayoutChange={handleLayoutChange}
        layout={gridLayout}
      >
        {widgets.map(item => (
          <div key={item.id}>
            <Widget
              id={item.id}
              widgetMeta={item.widgetMeta}
              onSettings={handleSettingsWidget}
              onRemove={handleRemoveWidget}
              editing={editing}
              grid={item.grid}
              settings={item.settings}
              dashboardContext={dashboardContext}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
      {addWidgetModalVisible && (
        <AddWidgetModal onAdd={handleAddWidget} existing={widgets.map(w => w.widgetMeta.key)} />
      )}
      {modalWidgetSettings.visible && <WidgetSettingsModal onOk={handleSaveSettings} />}
      {modalShare.visible && <ShareModal />}
    </div>
  );
}
