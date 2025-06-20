import { Popover } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import PluginsSelector from './PluginsSelector';
import './DemoController.less';
import MovingEyes from './MovingEyes';

const DemoController = () => {
  return (
    <Popover
      content={
        <div style={{ width: '350px' }}>
          <PluginsSelector />
        </div>
      }
      placement="bottom"
      className="demo-controller"
      trigger="hover"
    >
      <MovingEyes />
      <label>Select Plugins</label>
      <DownOutlined />
    </Popover>
  );
};

export default DemoController;
