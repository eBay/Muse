import { message } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import museClient from '../museClient';

// This hook sync registry cache and re-fetch muse data.
// Usually used after some registry data updated and need to show them on the UI.
const useSyncStatus = (dataKey) => {
  const queryClient = useQueryClient();
  return async () => {
    const hide = message.loading('Syncing status...', 0);
    await museClient.data.syncCache();
    await queryClient.refetchQueries({
      queryKey: ['muse-query', 'data.get', dataKey],
      exact: true,
    });
    hide();
  };
};
export default useSyncStatus;
