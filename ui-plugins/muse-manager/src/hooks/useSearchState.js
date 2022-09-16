import { useCallback } from 'react';
import { useLocation, useSearchParam } from 'react-use';

export default function useSearchState(key, defaultValue) {
  const location = useLocation();
  const state = useSearchParam(key) || defaultValue;

  const setState = useCallback(
    v => {
      const { pathname, hash, search } = location;
      const searchParams = new URLSearchParams(search);
      searchParams.set(key, v);
      window.history.pushState({}, '', `${pathname}?${searchParams.toString()}${hash}`);
    },
    [location, key],
  );

  return [state, setState];
}
