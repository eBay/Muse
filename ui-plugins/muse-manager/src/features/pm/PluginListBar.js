import NiceModal from '@ebay/nice-modal-react';
import { Radio, Button } from 'antd';
import SearchBox from '../common/SearchBox';
import { useSearchState } from '../../hooks';
export default function PluginListBar({ app }) {
  const [scope, setScope] = useSearchState('scope', 'my');
  return (
    <div className="flex mb-2">
      <SearchBox
        placeholder="Search by plugin name or owners..."
        className="flex-none min-w-[100px] max-w-[400px]"
      />
      <div className="grow flex justify-end gap-2">
        <Radio.Group onChange={evt => setScope(evt.target.value)} value={scope}>
          <Radio.Button value="my" key="my">
            My Plugins
          </Radio.Button>
          {app && (
            <Radio.Button value="deployed" key="deployed">
              Deployed Plugins
            </Radio.Button>
          )}
          <Radio.Button value="all" key="all">
            All Plugins
          </Radio.Button>
        </Radio.Group>
        <Button
          className="float-right"
          type="primary"
          onClick={() => NiceModal.show('muse-manager.create-plugin-modal')}
        >
          Create Plugin
        </Button>
      </div>
    </div>
  );
}
