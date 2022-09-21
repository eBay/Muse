import { useMemo } from 'react';
import jsPlugin from 'js-plugin';
import { Button } from 'antd';
import _ from 'lodash';
import './Widget.less';
const Widget = ({ name, id, editing, meta, component: WidgetComp }) => {
  const handleRemove = () => {};
  const handleSettings = () => {};
  return (
    <div className="muse-dashboard_widget">
      {editing && (
        <div className="muse-dashboard_widget-toolbar">
          {!meta.settingsForm && (
            <div className="widget-toolbar-btn">
              <i className="gg-more-vertical-alt" />
            </div>
          )}
          <div className="widget-toolbar-btn">
            <i className="gg-close" />
          </div>
        </div>
      )}
      {editing && <div className="dragging-overlay" />}

      <WidgetComp name={name} />
    </div>
  );
};
export default Widget;
