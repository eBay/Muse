import { useState } from 'react';
import { Radio, Input } from 'antd';
import semver from 'semver';

function VersionSelect({ value = '1.0.0', onChange, baseVersion = '1.0.0' }) {
  //
  const [type, setType] = useState('patch');
  const handleTypeChange = e => {
    const type = e.target.value;
    setType(type);
    if (type === 'custom') return;
    onChange(semver.inc(baseVersion, type));
  };
  return (
    <div style={{ marginTop: 5 }}>
      <Radio.Group onChange={handleTypeChange} defaultValue="patch">
        <Radio value="patch">Patch</Radio>
        <Radio value="minor">Minor</Radio>
        <Radio value="major">Major</Radio>
        <Radio value="custom">Custom</Radio>
      </Radio.Group>

      <Input
        disabled={type !== 'custom'}
        style={{ marginTop: 10 }}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
export default VersionSelect;
