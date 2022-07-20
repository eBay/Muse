import { useEffect, useState } from 'react';
import museClient from '../museClient';
import _ from 'lodash';

function _get(obj, prop) {
  var arr = prop.split('.');
  for (var i = 0; i < arr.length; i++) {
    if (!obj[arr[i]]) return undefined;
    obj = obj[arr[i]];
  }
  return obj;
}

const simpleInvoke = (obj, path, ...args) => {
  const arr = path.split('.');
  for (let i = 0; i < arr.length; i++) {
    if (!obj[arr[i]]) return undefined;
    obj = obj[arr[i]];
  }
  obj(args[0], args[1], args[2], args[3]);
};

function useMuse(apiPath, ...args) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!data) {
      simpleInvoke(museClient, apiPath, ...args)
        .then(d => {
          setData(d);
          setPending(false);
          setError(null);
        })
        .catch(err => {
          setPending(false);
          setError(err);
        });
    }
  }, [apiPath, ...args]); // eslint-disable-line

  return { data, error, pending };
}

export default useMuse;
