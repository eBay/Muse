import React from 'react';
import { Select, Tooltip, Tag } from 'antd';
import TimeAgo from 'react-time-ago';
import useMuse from '../../hooks/useMuse';

const { Option } = Select;

export default function PluginReleaseSelect({
  value,
  onChange,
  pluginName,
  appId,
  app,
  filter,
  ...rest
}) {
  const { data: releases, error, pending } = useMuse(
    'data.get',
    `muse.plugin-releases.${pluginName}`,
  );
  if (!releases) return 'Loading...';
  // let releases = pluginReleases;
  // if (filter && releases) releases = releases.filter(filter);

  return (
    <div className="plugin-manager_home-plugin-release-select">
      <Select value={value} onChange={onChange} {...rest} dropdownMatchSelectWidth={false}>
        {releases &&
          releases.map(r => {
            const mapName = name => (name === 'production' ? 'prod' : name);
            const tags = [];
            if (app) {
              Object.entries(app.envs).forEach(([envName, env]) => {
                // const onEnv = env.plugins && env.plugins.find(a => 'v' + a.meta.version === r.tag_name)
                if (
                  env.plugins &&
                  env.plugins.find(a => a.id === pluginName && 'v' + a.meta.version === r.tag_name)
                ) {
                  // on env
                  tags.push(
                    <Tooltip key={envName} title={`Already on ${envName}`}>
                      <Tag color={envName === 'production' ? 'green' : 'orange'}>
                        {mapName(envName)}
                      </Tag>
                    </Tooltip>,
                  );
                }
              });
            }

            return (
              <Option key={r.version} value={r.version.replace('v', '')}>
                <span style={{ marginRight: '15px' }}>{r.version}</span>
                {tags}
                <span style={{ color: '#999', marginLeft: '5px' }}>
                  built from <Tag>{r.branch || 'unknown'}</Tag>
                  by {r.createdBy} <TimeAgo date={new Date(r.createdAt)} />
                </span>
              </Option>
            );
          })}
      </Select>
    </div>
  );
}
