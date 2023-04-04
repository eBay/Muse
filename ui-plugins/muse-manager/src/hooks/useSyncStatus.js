import { message } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import museClient from '../museClient';

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
