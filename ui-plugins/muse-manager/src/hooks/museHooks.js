import { invoke, isObject } from 'lodash';
import { useQuery, useMutation } from '@tanstack/react-query';
import museClient from '../museClient';

export function useMuseQuery(apiPath, ...args) {
  const last = args[args.length - 1];
  let queryArgs = {};
  if (isObject(last)) {
    queryArgs = last;
    args.pop();
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

export function useMuseData(dataKey, queryArgs = {}) {
  return useMuseQuery('data.get', dataKey, queryArgs);
}

export function usePollingMuseQuery(...args) {
  const last = args[args.length - 1];
  const queryArgs = { refetchInterval: 10000 };

  if (isObject(last)) {
    args.pop();
    Object.assign(queryArgs, last);
  }
  args.push(queryArgs);

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
