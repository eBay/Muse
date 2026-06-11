import { Select } from 'antd';
import { useMuseData } from '../../hooks';

const { Option } = Select;

export default function MspSelect({ onChange, value }) {
  const { data: mspData, isLoading } = useMuseData('muse.msp');

  return (
    <Select
      allowClear
      placeholder="No MSP constraint"
      loading={isLoading}
      disabled={isLoading}
      value={isLoading ? null : value || undefined}
      onChange={onChange}
      style={{ width: '100%' }}
    >
      {mspData &&
        Object.entries(mspData).map(([presetName, presetInfo]) => (
          <Option value={presetName} key={presetName}>
            <span>{presetName}</span>
            {presetInfo.description && (
              <span style={{ color: '#999', marginLeft: 8, fontSize: 12 }}>
                {presetInfo.description}
              </span>
            )}
          </Option>
        ))}
    </Select>
  );
}
