import { invoke } from 'lodash';
import { useQuery, useMutation } from '@tanstack/react-query';
import museClient from '../museClient';

export function useMuseData(dataKey, queryArgs = {}) {
  const query = useQuery({
    queryKey: ['muse-data', dataKey],
    queryFn: () => {
      return museClient.data.get(dataKey);
    },
    retry: 0,
    refetchOnWindowFocus: false,
    ...queryArgs,
  });
  return query;
}

export function usePollingMuseData(dataKey, queryArgs = {}) {
  return useMuseData(dataKey, {
    refetchInterval: 10000,
    ...queryArgs,
  });
}

export function useMuseApi(apiPath) {
  const mutation = useMutation({
    mutationFn: (...args) => {
      return invoke(museClient, apiPath, ...args);
    },
  });
  return mutation;
}
