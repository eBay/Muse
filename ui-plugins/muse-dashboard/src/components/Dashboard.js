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

const ResponsiveGridLayout = WidthProvider(props => {
  const minWidth = 800;
  return <GridLayout {...props} width={Math.max(minWidth, props.width)} />;
});

// defaultLayout is used if no layouts provided
const defaultLayout = [
  { id: 'uid3', widget: 'favoritePools', settings: null, grid: { w: 6, x: 6, y: 6, h: 6 } },
];
export default function Dashboard({
  dashboardKey = 'muse-default-dashboard',
  noToolbar,
  defaultDashboard = defaultLayout,
  context,
}) {
  const widgetMetaByKey = useMemo(
    () => _.keyBy(_.flatten(jsPlugin.invoke('museDashboard.widget.getWidgets')), 'key'),
    [],
  );

  const [dashboardState, setDashboardState] = useState({ editing: false, dataToRender: [] });
  const dashboardName = useSearchParam('current') || 'default';

  let { data, pending, error } = useStorage('getDashboard', [dashboardKey, dashboardName]);
  if (data === null) data = defaultDashboard;
  console.log('data: ', data);

  // Clone data  allows to be updated
  // const [dataToRender, setDataToRender] = useState([]);
  useEffect(() => {
    if (!data) return;
    setDashboardState(s => ({
      ...s,
      rawData: data,
      dataToRender: _.clone(data),
    }));
  }, [data]);
  console.log('dashboardState: ', dashboardState);

  // Original layout
  const layout = useMemo(() => {
    return dashboardState.dataToRender.map(item => {
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
    return dashboardState.dataToRender.map(item => {
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

  const handleLayoutChange = newLayout => {
    console.log('newlayout: ', newLayout);
  };

  return (
    <div className="h-96">
      <RequestStatus pending={pending} error={error} />
      <DashboardToolbar
        dashboardKey={dashboardKey}
        dashboardName={dashboardName}
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
        {widgets.map(widget => {
          return (
            <div key={widget.id}>
              <Widget
                setDashboardState={setDashboardState}
                editing={dashboardState.editing}
                {...widget}
              />
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
}
