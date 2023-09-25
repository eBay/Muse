import { message } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import museClient from '../museClient';

// This hook sync registry cache and re-fetch muse data.
// Usually used after some registry data updated and need to show them on the UI.
const useSyncStatus = (...dataKeys) => {
  const queryClient = useQueryClient();
  return async () => {
    const hide = message.loading('Syncing status...', 0);
    try {
      await museClient.data.syncCache();
    } catch (e) {
      console.warn('Failed to sync cache: ', e);
      // if sync cache fails, we can still continue
    }
    try {
      await Promise.all(
        dataKeys.map(
          async (dataKey) =>
            await queryClient.refetchQueries({
              queryKey: ['muse-query', 'data.get', dataKey],
              exact: true,
            }),
        ),
      );
    } catch (err) {
      console.error(err);
      message.error('Failed to sync status, please refresh the page to see update.');
    }
    hide();
  };
};
export default useSyncStatus;
