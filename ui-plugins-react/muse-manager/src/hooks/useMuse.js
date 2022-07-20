import { useEffect, useState } from 'react';
import museClient from '../museClient';
import _ from 'lodash';

function useMuse(apiPath, ...args) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!data) {
      _.get(
        museClient,
        apiPath,
      )(...args)
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
