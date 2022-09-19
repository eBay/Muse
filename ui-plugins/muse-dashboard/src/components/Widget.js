import { useMemo } from 'react';
import jsPlugin from 'js-plugin';
import _ from 'lodash';
import './Widget.less';
const Widget = ({ name, id, component: WidgetComp }) => {
  return (
    <div className="muse-dashboard_widget">
      <div className="muse-dashboard_widget-toolbar">Toolbar</div>
      <WidgetComp name={name} />
    </div>
  );
};
export default Widget;
