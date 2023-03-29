import { useEffect, useState, useCallback } from 'react';
import { message } from 'antd';
import _ from 'lodash';
import polling from '@ebay/muse-lib-react/src/features/common/polling';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import museClient from '../museClient';

function setMuseData(key, value) {
  return {
    type: 'MUSE_MANAGER$SET_MUSE_DATA',
    data: {
      key,
      value,
    },
  };
}
export const reducer = (state = {}, action) => {
  switch (action?.type) {
    case 'MUSE_MANAGER$SET_MUSE_DATA': {
      // The request is success

      return {
        ...state,
        [action.data.key]: action.data.value,
      };
    }

    default:
      return state;
  }
};

// If useMuseData is called in parrell, ensure only one api call for one kind of muse data.
const ongoingGetApiCalls = {};
const invokeMuse = ({ apiPath, args, dispatch, setData, setPending, setError }) => {
  setPending(true);
  setError(null);

  const isDataGet = apiPath === 'data.get';
  const firstArg = args[0];
  let promise;
  if (isDataGet && ongoingGetApiCalls[firstArg]) {
    promise = ongoingGetApiCalls[firstArg];
  } else {
    promise = _.invoke(museClient, apiPath, ...args);
    if (isDataGet) {
      ongoingGetApiCalls[firstArg] = promise;
    }
  }
  promise
    .then((d) => {
      if (isDataGet) {
        dispatch(setMuseData(firstArg, d));
      }
      setData(d);
      setPending(false);
      setError(null);
      if (isDataGet) delete ongoingGetApiCalls[firstArg || ''];
    })
    .catch((err) => {
      console.log('failed', err);
      setPending(false);
      setError(err);
      if (isDataGet) delete ongoingGetApiCalls[firstArg || ''];
      return Promise.reject(err);
    });

  return promise;
};

export function useMuse(apiPath, ...args) {
  const isGet = apiPath === 'data.get';
  const [data, setData] = useState(apiPath === 'data.get' ? args[1] : null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  if (isGet) args.length = 1;
  const dispatch = useDispatch();
  useEffect(() => {
    if (!data) {
      invokeMuse({ apiPath, setData, dispatch, setPending, setError, args });
    }
  }, [apiPath, ...args]); // eslint-disable-line

  return { data, error, pending };
}

export function useMuseData(dataKey) {
  const { data } = useSelector(
    (state) => ({
      data: state.pluginEbayMuseManager.museData[dataKey],
    }),
    shallowEqual,
  );

  return useMuse('data.get', dataKey, data || undefined);
}

export function useMuseApi(apiPath) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  const action = (...args) => {
    return invokeMuse({ apiPath, setData, setPending, setError, args });
  };

  return { data, action, error, pending };
}

const pollers = {}; // persist global uniq poller for one data key
const lastData = {}; // cache last data so that we can update redux only if data is changed
const lastDataError = {};
export function usePollingMuseData(dataKey, args = { interval: 10000 }) {
  const errorKey = dataKey + '.error';
  const { data, dataError } = useSelector(
    (state) => ({
      data: state.pluginEbayMuseManager.museData[dataKey],
      dataError: state.pluginEbayMuseManager.museData[errorKey],
    }),
    shallowEqual,
  );
  lastData[dataKey] = data;
  lastDataError[errorKey] = dataError;
  const dispatch = useDispatch();

  const pollerKey = dataKey;
  let poller = pollers[pollerKey];
  if (!poller) {
    poller = pollers[pollerKey] = polling({
      retries: 5,
      task: async () => {
        const newData = await museClient.data.get(dataKey);
        const oldData = lastData[dataKey];
        if (!_.isEqual(oldData, newData)) {
          dispatch(setMuseData(dataKey, newData));
        }
        if (lastDataError[errorKey]) {
          dispatch(setMuseData(errorKey, null));
        }
      },
      onError: (err) => {
        dispatch(setMuseData(errorKey, err.message || errorKey));
      },
      interval: 10000000000, //args.interval || 10000,
    });
  } else if (poller.stopped) {
    poller.start();
  }

  return {
    data,
    // if the last polling failed, there's error.
    // The usage side should decide how to handle polling error if data already exists or not.
    pollingError: dataError,
    error: !data && dataError,
    stopPolling: () => {
      poller.stop();
      delete pollers[pollerKey];
    },
    pollNow: () => poller.restart(),
    syncStatus: async () => {
      const hide = message.loading('Syncing status...', 0);
      await museClient.data.syncCache();
      await poller.restart();
      hide();
    },
  };
}
