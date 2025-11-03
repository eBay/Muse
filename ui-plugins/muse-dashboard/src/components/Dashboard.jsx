import { useMemo, useState, useEffect } from 'react';
import GridLayout, { WidthProvider } from 'react-grid-layout';
import { useSearchParam } from 'react-use';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import _ from 'lodash';
import jsPlugin from 'js-plugin';
import Widget from './Widget';
import './Dashboard.less';
import useStorage from '../hooks/useStorage';
import WidgetNotFound from './WidgetNotFound';
import DashboardToolbar from './DashboardToolbar';

const ResponsiveGridLayout = WidthProvider((props) => {
  const minWidth = 800;
  return <GridLayout {...props} width={Math.max(minWidth, props.width)} />;
});

// defaultLayout is used if no layouts provided
const defaultLayout = [
  {
    id: 'someid1',
    widget: 'dashboardNoteWidget',
    settings: {
      content:
        'This is the default dashboard. \nUsually you should define your own default dashboard.',
    },
    grid: { w: 6, x: 0, y: 6, h: 6 },
  },
];
const Dashboard = ({
  dashboardKey = 'muse-default-dashboard',
  nameQuery = 'name',
  title = null,
  name = '',
  noToolbar,
  defaultDashboard = defaultLayout,
  dashboardContext,
}) => {
  const widgetMetaByKey = useMemo(
    () => _.keyBy(_.flatten(jsPlugin.invoke('museDashboard.widget.getWidgets')), 'key'),
    [],
  );

  const [dashboardState, setDashboardState] = useState({ editing: false, dataToRender: [] });
  const dashboardName = useSearchParam(nameQuery) || 'default';

  let {
    action: getDashboard,
    data,
    pending,
    error,
  } = useStorage('getDashboard', [dashboardKey, dashboardName]);
  useEffect(() => {
    getDashboard(dashboardKey, dashboardName);
  }, [dashboardKey, dashboardName, getDashboard]);
  if (data === null) data = defaultDashboard;

  // Clone data  allows to be updated
  useEffect(() => {
    if (!data) return;
    setDashboardState((s) => ({
      ...s,
      rawData: data,
      dataToRender: _.cloneDeep(data),
    }));
  }, [data]);

  // Original layout
  const layout = useMemo(() => {
    return dashboardState.dataToRender.map((item) => {
      const g = {
        ...item.grid,
        i: item.id,
      };
      const widgetMeta = widgetMetaByKey[item.widget]?.meta || {};
      const width = _.castArray(widgetMeta.width);
      const height = _.castArray(widgetMeta.height);
      // width[0], height[0] means the default value
      if (width[1]) g.minW = width[1];
      if (width[2]) g.maxW = width[2];
      if (height[1]) g.minH = height[1];
      if (height[2]) g.maxH = height[2];

      return g;
    });
  }, [dashboardState.dataToRender, widgetMetaByKey]);

  // Original widgets
  const widgets = useMemo(() => {
    return dashboardState.dataToRender.map((item) => {
      const w = widgetMetaByKey[item.widget];
      const widgetMeta = w || {};
      return {
        id: item.id,
        component: w?.component || WidgetNotFound,
        meta: widgetMeta,
        name: item.widget,
        settings: item.settings,
      };
    });
  }, [dashboardState.dataToRender, widgetMetaByKey]);

  const handleLayoutChange = (newLayout) => {
    const dataToRender = _.cloneDeep(dashboardState.dataToRender);
    const byId = _.keyBy(dataToRender, 'id');
    newLayout.forEach((item) => {
      Object.assign(byId[item.i].grid, {
        w: item.w,
        h: item.h,
        x: item.x,
        y: item.y,
      });
    });
    setDashboardState((s) => ({ ...s, dataToRender }));
  };

  return (
    <div className="h-96">
      <RequestStatus pending={pending} error={error} />
      <DashboardToolbar
        title={title}
        defaultLayout={defaultLayout}
        nameQuery={nameQuery}
        dashboardKey={dashboardKey}
        dashboardState={dashboardState}
        setDashboardState={setDashboardState}
      />
      <ResponsiveGridLayout
        className="muse-dashboard_dashboard"
        isDraggable={dashboardState.editing}
        isResizable={dashboardState.editing}
        cols={12}
        rowHeight={30}
        margin={[20, 20]}
        onLayoutChange={handleLayoutChange}
        layout={layout}
        width={1200}
      >
        {widgets.map((widget) => {
          return (
            <div key={widget.id}>
              <Widget
                setDashboardState={setDashboardState}
                editing={dashboardState.editing}
                dashboardContext={dashboardContext}
                {...widget}
              />
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
};
export default Dashboard;
