import { Select } from 'antd';
import { useMuseData } from '../../hooks';

const { Option } = Select;

export default function AppSelect({ onChange, value }) {
  const { data: apps } = useMuseData('muse.apps');

  return (
    <Select
      className="w-48"
      disabled={!apps}
      value={apps ? value : null}
      onChange={onChange}
      showSearch
    >
      {!apps && <Option value="">Loading...</Option>}
      {apps &&
        apps.map((app) => (
          <Option value={app.name} key={app.name}>
            {app.name}
          </Option>
        ))}
    </Select>
  );
}
