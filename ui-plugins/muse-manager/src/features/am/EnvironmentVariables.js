import React, { useState } from 'react';
import { Radio } from 'antd';
import AppVariables from './AppVariables';
import PluginVariables from './PluginVariables';

export default function EnvironmentVariables({ app }) {
  const [environmentSelection, setEnvironmentSelection] = useState('App');
  const plainOptions = ['App', 'Plugin'];

  const onChange1 = ({ target: { value } }) => {
    setEnvironmentSelection(value);
  };

  return (
    <>
      <Radio.Group
        options={plainOptions}
        onChange={onChange1}
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
