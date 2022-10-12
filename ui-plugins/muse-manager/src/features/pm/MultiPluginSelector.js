import React, { useState, useCallback } from 'react';
import _ from 'lodash';
import { Select, Button, Col, Row, message } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import PluginReleaseSelect from './PluginReleaseSelect';
import { useMuseData } from '../../hooks';

const { Option } = Select;
export default function MultiPluginSelector({ value, onChange, app }) {
  const [adding, setAdding] = useState(true);
  const { data: allPlugins } = useMuseData('muse.plugins');
  const { data: latestReleases } = useMuseData(`muse.plugins.latest-releases`);

  const rows = [...(value || [])];

  if (adding) {
    rows.push({}); // empty row for add
  }

  const pluginById = _.keyBy(allPlugins, 'name');

  const handlePluginChange = (value, index) => {
    if (index === rows.length - 1) {
      // if last value changed, set adding to false
      setAdding(false);
    }

    const latest = latestReleases[value] && latestReleases[value].version;
    const newValue = _.cloneDeep(rows);
    newValue[index].name = value;
    newValue[index].version = latest ? latest.replace('v', '') : undefined;
    onChange(newValue.filter(v => v.name));
  };

  const handleVersionChange = (value, index) => {
    const newValue = _.cloneDeep(rows);
    newValue[index].version = value;
    onChange(newValue.filter(v => v.name));
  };

  const handleAdd = useCallback(() => {
    if (value.some(v => !v.name || !v.version)) {
      message.warn('Select version first.');
      return;
    }
    setAdding(true);
  }, [setAdding, value]);

  const handleRemove = index => {
    const newValue = _.cloneDeep(rows);
    newValue.splice(index, 1);

    onChange(newValue.filter(v => v.name));
  };

  const leftPlugins = allPlugins?.filter(
    p => latestReleases?.[p?.name] && !_.find(rows, { name: p.name }),
  );
  leftPlugins?.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="plugin-manager_home-plugins-select">
      {rows.map((item, i) => {
        const p = item.name ? pluginById[item.name] : null;
        return (
          <Row gutter={10} key={i}>
            <Col span="12">
              <Select
                showSearch
                dropdownMatchSelectWidth={false}
                placeholder="Select a plugin"
                value={item.name}
                onChange={v => handlePluginChange(v, i)}
              >
                {leftPlugins?.map(p => (
                  <Option key={p.name} value={p.name}>
                    {p.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span="10">
              <PluginReleaseSelect
                app={app}
                plugin={p || {}}
                placeholder="Select a version"
                value={item.version}
                onChange={v => handleVersionChange(v, i)}
                disabled={!item.name}
              />
            </Col>
            <Col span={2} style={{ textAlign: 'right' }}>
              {item.name && <MinusCircleOutlined onClick={() => handleRemove(i)} />}
            </Col>
          </Row>
        );
      })}
      {leftPlugins?.length > 0 && (
        <Button type="link" onClick={handleAdd}>
          <PlusOutlined /> Add
        </Button>
      )}
    </div>
  );
}
