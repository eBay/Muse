import React, { useState } from 'react';
import { Radio } from 'antd';
import AppVariables from './AppVariables';
import PluginVariables from './PluginVariables';

export default function EnvironmentVariables({ app }) {
  const [environmentSelection, setEnvironmentSelection] = useState('App');
  const plainOptions = [
    { label: 'App. Level', value: 'App' },
    { label: 'Plugin Level', value: 'Plugin' },
  ];

  const onChangeRadio = ({ target: { value } }) => {
    setEnvironmentSelection(value);
  };

  return (
    <>
      <Radio.Group
        options={plainOptions}
        onChange={onChangeRadio}
        value={environmentSelection}
        optionType="button"
        buttonStyle="solid"
        style={{ marginBottom: '10px' }}
      />
      {environmentSelection === 'App' && <AppVariables app={app} />}
      {environmentSelection === 'Plugin' && <PluginVariables app={app} />}
    </>
  );
}
