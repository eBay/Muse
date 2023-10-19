import React from 'react';
import { Radio, Alert } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import AppVariables from './AppVariables';
import PluginVariables from './PluginVariables';

export default function EnvironmentVariables({ app }) {
  const { scope = 'app' } = useParams();
  const navigate = useNavigate();

  const plainOptions = [
    {
      label: <span>App</span>,
      value: 'app',
    },
    {
      label: <span>Plugin</span>,
      value: 'plugin',
    },
  ];

  const onChangeRadio = ({ target: { value } }) => {
    navigate(`/app/${app.name}/variables/${value}`);
  };

  return (
    <>
      <Radio.Group
        options={plainOptions}
        onChange={onChangeRadio}
        value={scope}
        optionType="button"
        buttonStyle="solid"
        style={{ marginBottom: '10px' }}
      />
      {scope === 'app' && (
        <>
          <Alert
            type="info"
            showIcon
            message="You can use 'window.MUSE_GLOBAL.getAppVariables()[varName]' to get an app variable value."
          />
          <AppVariables app={app} />
        </>
      )}
      {scope === 'plugin' && (
        <>
          <Alert
            type="info"
            showIcon
            message="You can use 'window.MUSE_GLOBAL.getPluginVariables(pluginName)[varName]' to get a plugin variable value."
          />
          <PluginVariables app={app} />
        </>
      )}
    </>
  );
}
