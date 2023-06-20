import { invoke, isObject } from 'lodash';
import { useQuery, useMutation } from '@tanstack/react-query';
import museClient from '../museClient';

/**
 compatible with: useMuseQuery(queryArgs, apiPath, ...args)
 */
export function useMuseQuery(apiPath, ...args) {
  let queryArgs = {};

  if (isObject(apiPath)) {
    queryArgs = apiPath;
    apiPath = args.shift();
  }
  const query = useQuery({
    queryKey: ['muse-query', apiPath, ...args],
    queryFn: () => {
      return invoke(museClient, apiPath, ...args);
    },
    retry: 0,
    refetchOnWindowFocus: false,
    ...queryArgs,
  });
  return query;
}

export function useMuseData(dataKey, args) {
  let queryArgs = {};
  if (isObject(dataKey)) {
    queryArgs = dataKey;
    dataKey = args;
  }
  return useMuseQuery(queryArgs, 'data.get', dataKey);
}

export function usePollingMuseQuery(...args) {
  const last = args[args.length - 1];
  const queryArgs = { refetchInterval: 10000 };

  if (isObject(last)) {
    args.pop();
    Object.assign(queryArgs, last);
  }
  args.unshift(queryArgs);

  return useMuseQuery(...args);
}

export function usePollingMuseData(...args) {
  return usePollingMuseQuery('data.get', ...args);
}

export function useMuseMutation(apiPath) {
  const mutation = useMutation({
    mutationFn: (...args) => {
      return invoke(museClient, apiPath, ...args);
    },
  });
  return mutation;
}
