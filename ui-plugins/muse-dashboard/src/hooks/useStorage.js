import { useState, useEffect, useCallback } from 'react';
import storageApi from '../storageApi';
const mockData = [
  { id: 'uid1', widget: 'dashboardNote', settings: null, grid: { w: 6, x: 0, y: 0, h: 12 } },
  { id: 'uid2', widget: 'dashboardNote', settings: null, grid: { w: 6, x: 6, y: 0, h: 6 } },
  { id: 'uid3', widget: 'favoritePools', settings: null, grid: { w: 6, x: 6, y: 6, h: 6 } },
];
export default function useStorage(apiKey, args) {
  if (!storageApi[apiKey]) throw new Error(`Unknown dashboard storage key: ${apiKey}.`);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [data, setData] = useState();

  const action = useCallback(
    (...args) => {
      setPending(true);
      storageApi[apiKey](...args)
        .then(d => {
          console.log('get', apiKey, d, args);
          setPending(false);
          setData(d);
        })
        .catch(err => {
          setPending(false);
          setError(err);
        });
    },
    [apiKey],
  );

  useEffect(() => {
    if (args && data === undefined) action(...args);
  }, []);
  return {
    error,
    pending,
    data,
    dismissError: () => setError(null),
    action,
  };
}
