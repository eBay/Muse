import { usePollingMuseData } from './useMuse';
import { message } from 'antd';
import museClient from '../museClient';

const useSyncStatus = dataKey => {
  const { pollNow } = usePollingMuseData(dataKey);
  return async () => {
    const hide = message.loading('Syncing status...', 0);
    await museClient.data.syncCache();
    await pollNow();
    hide();
  };
};
export default useSyncStatus;
