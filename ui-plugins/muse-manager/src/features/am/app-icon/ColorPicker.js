import React from 'react';
import { CompactPicker } from 'react-color';
import { Input, Dropdown } from 'antd';

export default function ColorPicker({ value, onChange }) {
  const colorpicker = (
    <CompactPicker
      color={value}
      onChange={v => {
        onChange(v.hex);
      }}
    />
  );

  const onColorChange = c => {
    onChange(c.target.value);
  };

  return (
    <Dropdown
      className="muse-app-manager_home-color-picker"
      overlay={colorpicker}
      trigger={['click']}
    >
      <Input value={value} onChange={onColorChange} />
    </Dropdown>
  );
}

ColorPicker.propTypes = {};
ColorPicker.defaultProps = {};
