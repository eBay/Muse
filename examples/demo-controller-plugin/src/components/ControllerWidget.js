import PluginsSelector from './PluginsSelector';
import './ControllerWidget.less';

const ControllerWidget = () => {
  return (
    <div style={{ padding: 20 }} className="controller-widget">
      <h2>Plugins Selector</h2>
      <PluginsSelector />
    </div>
  );
};
export default ControllerWidget;
