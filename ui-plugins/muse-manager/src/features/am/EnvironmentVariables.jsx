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
          <AppVariables app={app} />
        </>
      )}
      {scope === 'plugin' && (
        <>
          <PluginVariables app={app} />
        </>
      )}
    </>
  );
}
