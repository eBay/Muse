import React from 'react';
import './WidgetNotFound.less';

export default function WidgetNotFound({ name }) {
  return (
    <div className="dashboard-widget-not-found">
      <h4>Widget Not Found: {name}</h4>
      <div>
        The widget <b>"{name}"</b> is unavailable in the current dashboard. This may be caused by:
        <ul>
          <li>You are in an environment in which not all plugins are loaded.</li>
          <li>The widget was removed by the widget provider.</li>
          <li>You added some testing widgets to the dashboard in local dev environment.</li>
        </ul>
      </div>
    </div>
  );
}
