import React from 'react';
import { Select, Tooltip, Tag } from 'antd';
import TimeAgo from 'react-time-ago';
import { usePollingMuseData } from '../../hooks';

const { Option } = Select;

export default function PluginReleaseSelect({ value, onChange, plugin, app, filter, ...rest }) {
  let { data: releases, error } = usePollingMuseData(`muse.plugin-releases.${plugin?.name}`);

  if (plugin) {
    return PluginReleaseSelectWithPlugin({
      value,
      onChange,
      plugin,
      app,
      filter,
      releases,
      error,
      ...rest,
    });
  } else {
    return (
      <div className="plugin-manager_home-plugin-release-select">
        <Select
          value={value}
          placeholder={`Select a version to deploy`}
          onChange={onChange}
          {...rest}
          popupMatchSelectWidth={false}
          disabled
        />
      </div>
    );
  }
}

// plugin is truthy
function PluginReleaseSelectWithPlugin({
  value,
  onChange,
  plugin,
  app,
  filter,
  releases,
  error,
  ...rest
}) {
  // let { data: releases, error } = usePollingMuseData(`muse.plugin-releases.${plugin.name}`);
  if (error) return 'Failed, please refresh to retry.';
  if (filter && releases) releases = releases.filter(filter);

  return (
    <div className="plugin-manager_home-plugin-release-select">
      <Select
        value={value}
        loading={!releases}
        placeholder={releases ? `Select a version to deploy` : 'Loading...'}
        onChange={onChange}
        {...rest}
        popupMatchSelectWidth={false}
        disabled={!releases}
      >
        {releases &&
          releases.map((r) => {
            const tags = [];
            if (app) {
              Object.entries(app.envs).forEach(([envName, env]) => {
                // const onEnv = env.plugins && env.plugins.find(a => 'v' + a.meta.version === r.tag_name)
                if (env.plugins?.find((a) => a.name === plugin.name && a.version === r.version)) {
                  // on env
                  tags.push(
                    <Tooltip key={envName} title={`Already on ${envName}`}>
                      <Tag
                        color={envName === 'production' ? 'green' : 'orange'}
                        style={{ verticalAlign: 'middle', lineHeight: '20px' }}
                      >
                        {envName}
                      </Tag>
                    </Tooltip>,
                  );
                }
              });
            }

            return (
              <Option
                key={r.version}
                value={r.version.startsWith('v') ? r.version.substring(1) : r.version}
              >
                <span style={{ marginRight: '15px', verticalAlign: 'middle' }}>{r.version}</span>
                {tags}
                <span style={{ color: '#999', marginLeft: '5px', verticalAlign: 'middle' }}>
                  {r.branch && (
                    <>
                      built from <Tag>{r.branch || 'unknown'}</Tag>
                    </>
                  )}
                  by {r.createdBy} <TimeAgo date={new Date(r.createdAt)} />
                </span>
              </Option>
            );
          })}
      </Select>
    </div>
  );
}
