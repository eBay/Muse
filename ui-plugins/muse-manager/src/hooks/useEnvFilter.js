import { useState, useCallback } from 'react';

export default function useEnvFilter(props) {
  const [envFilterMap, setEnvFilterMap] = useState({});
  const [envFilterDropdownOpenMap, setEnvFilterDropdownOpenMap] = useState({});

  const onEnvFilterChange = useCallback(
    (envName, { key }) => {
      setEnvFilterMap({
        ...envFilterMap,
        [envName]: key === 'clear' ? null : key,
      });
      setEnvFilterDropdownOpenMap({
        ...envFilterDropdownOpenMap,
        [envName]: false,
      });
    },
    [envFilterMap, envFilterDropdownOpenMap],
  );

  const onFilterOpenChange = useCallback(
    (envName, visible) => {
      setEnvFilterDropdownOpenMap({
        ...envFilterDropdownOpenMap,
        [envName]: visible,
      });
    },
    [envFilterDropdownOpenMap],
  );

  return { envFilterMap, envFilterDropdownOpenMap, onEnvFilterChange, onFilterOpenChange };
}
