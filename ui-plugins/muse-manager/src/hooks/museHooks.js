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
  if (args[0] === 'muse.requests') console.log(apiPath, args);
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

export function usePollingMuseQuery(apiPath, ...args) {
  let queryArgs = {};

  if (isObject(apiPath)) {
    queryArgs = apiPath;
    apiPath = args.shift();
  }
  if (!queryArgs.refetchInterval) {
    queryArgs.refetchInterval = 10000;
  }

  return useMuseQuery(queryArgs, apiPath, ...args);
}

export function usePollingMuseData(...args) {
  if (isObject(args[0])) {
    args.splice(1, 0, 'data.get');
  } else {
    args.unshift('data.get');
  }
  return usePollingMuseQuery(...args);
}

export function useMuseMutation(apiPath) {
  const mutation = useMutation({
    mutationFn: (args) => {
      // _museParams to support multiple arguments: https://github.com/TanStack/query/discussions/1226
      if (args._museParams) return invoke(museClient, apiPath, ...args._museParams);
      return invoke(museClient, apiPath, args);
    },
  });
  return mutation;
}
