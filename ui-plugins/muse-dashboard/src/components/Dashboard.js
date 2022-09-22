import { useMemo, useState } from 'react';
import GridLayout, { WidthProvider } from 'react-grid-layout';
import { useSearchParam } from 'react-use';
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

/*
const defaultDashboard = [
  { id: 'uid1', widget: 'myWidget', settings: {}, w: 1, x: 0, y: 0, h: 1 },
  { id: 'uid1', widget: 'myWidget2', settings: {}, w: 1, x: 0, y: 0, h: 1 },
]
*/

export default function Dashboard({ dashboardKey, noToolbar, defaultDashboard = [], context }) {
  const widgetMetaByKey = useMemo(
    () => _.keyBy(_.flatten(jsPlugin.invoke('museDashboard.widget.getWidgets')), 'key'),
    [],
  );
  console.log(widgetMetaByKey);
  const [dashboardState, setDashboardState] = useState({ editing: false });
  const currentDashboardName = useSearchParam('current') || 'default';

  let { data, pending, error } = useStorage('dashboard', currentDashboardName);
  if (data === null) data = defaultDashboard;

  const loading = !data && !error;
  const layout = useMemo(() => {
    return data.map(item => {
      const g = {
        ...item.grid,
        i: item.id,
      };
      const widgetMeta = widgetMetaByKey[item.widget]?.meta || {};
      item.widgetMeta = widgetMeta;
      const width = _.castArray(widgetMeta.width);
      const height = _.castArray(widgetMeta.height);
      // width[0], height[0] means the default value
      if (width[1]) g.minW = width[1];
      if (width[2]) g.maxW = width[2];
      if (height[1]) g.minH = height[1];
      if (height[2]) g.maxH = height[2];

      return g;
    });
  }, [data, widgetMetaByKey]);

  const widgets = useMemo(() => {
    return data.map(item => {
      const w = widgetMetaByKey[item.widget];
      const widgetMeta = w?.meta || {};
      return {
        id: item.id,
        component: w?.component || WidgetNotFound,
        meta: widgetMeta,
        name: item.widget,
      };
    });
  }, [data, widgetMetaByKey]);

  const handleLayoutChange = newLayout => {
    console.log('newlayout: ', newLayout);
  };
  if (loading) return 'Loading...';
  return (
    <div className="h-96">
      <DashboardToolbar dashboardState={dashboardState} setDashboardState={setDashboardState} />
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
              <Widget editing={dashboardState.editing} {...widget} />
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
}
