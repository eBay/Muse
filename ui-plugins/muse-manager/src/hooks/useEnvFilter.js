import { useState, useCallback } from 'react';
import { EnvFilterMenu } from '../features/pm';
import { FilterOutlined } from '@ant-design/icons';

export default function useEnvFilter(props = {}) {
  const [envFilterMap, setEnvFilterMap] = useState(props.envFilterMap || {});
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

  const getEnvFilterConfig = useCallback(
    (envName) => {
      return {
        filterDropdown: (
          <EnvFilterMenu
            selectedKeys={[envFilterMap[envName]]}
            onSelect={(args) => onEnvFilterChange(envName, args)}
          />
        ),
        filterIcon: (
          <FilterOutlined style={{ color: envFilterMap[envName] ? '#1890ff' : '#aaa' }} />
        ),
        filterDropdownVisible: envFilterDropdownOpenMap[envName],
        onFilterDropdownOpenChange: (visible) => onFilterOpenChange(envName, visible),
      };
    },
    [envFilterDropdownOpenMap, envFilterMap, onEnvFilterChange, onFilterOpenChange],
  );

  return { getEnvFilterConfig, envFilterMap, setEnvFilterMap };
}
