import { useEffect, useState } from 'react';
import museClient from '../museClient';
import _ from 'lodash';

const doAction = ({ apiPath, args, setData, setPending, setError }) => {
  setPending(true);
  setError(null);
  return _.invoke(museClient, apiPath, ...args)
    .then(d => {
      setData(d);
      setPending(false);
      setError(null);
    })
    .catch(err => {
      console.log('failed', err);
      setPending(false);
      setError(err);
      return Promise.reject(err);
    });
};

export function useMuse(apiPath, ...args) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!data) {
      doAction({ apiPath, setData, setPending, setError, args });
    }
  }, [apiPath, ...args]); // eslint-disable-line

  return { data, error, pending };
}

export function useMuseData(...args) {
  return useMuse('data.get', ...args);
}

export function useMuseApi(apiPath) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  const action = (...args) => {
    return doAction({ apiPath, setData, setPending, setError, args });
  };

  return { data, action, error, pending };
}
