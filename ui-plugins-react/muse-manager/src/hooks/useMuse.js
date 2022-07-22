import { useEffect, useState } from 'react';
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
const invokeMuse = ({ apiPath, args, dispatch, setData, setPending, setError }) => {
  setPending(true);
  setError(null);
  return _.invoke(museClient, apiPath, ...args)
    .then(d => {
      if (apiPath === 'data.get') {
        dispatch(setMuseData(args[0], d));
      }
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

  const dispatch = useDispatch();
  useEffect(() => {
    if (!data) {
      invokeMuse({ apiPath, setData, dispatch, setPending, setError, args });
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
    return invokeMuse({ apiPath, setData, setPending, setError, args });
  };

  return { data, action, error, pending };
}

const pollers = {};
export function usePollingMuseData(dataKey, args = { interval: 1000000 }) {
  const { data } = useSelector(
    state => ({
      data: state.pluginEbayMuseManager.museData[dataKey],
    }),
    shallowEqual,
  );
  const dispatch = useDispatch();

  const pollerKey = dataKey;
  let poller = pollers[pollerKey];
  if (!poller) {
    poller = pollers[pollerKey] = polling({
      task: async () => {
        const d = await museClient.data.get(dataKey);
        dispatch(setMuseData(dataKey, d));
      },
      interval: args.interval || 10000,
    });
  } else if (poller.stopped) {
    poller.start();
  }

  return {
    data,
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
