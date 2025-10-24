import React from 'react';
import { Select, Tooltip, Tag } from 'antd';
import TimeAgo from 'react-time-ago';
import { usePollingMuseData } from '../../hooks';
import { extendArray } from '@ebay/muse-lib-antd/src/utils';

export default function PluginReleaseSelect({ value, onChange, plugin, app, filter, ...rest }) {
  let {
    data: releases,
    error,
    isLoading,
  } = usePollingMuseData(`muse.plugin-releases.${plugin?.name}`);

  if (plugin) {
    return PluginReleaseSelectWithPlugin({
      value,
      onChange,
      plugin,
      app,
      filter,
      releases,
      error,
      loading: isLoading,
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
  loading,
  ...rest
}) {
  // let { data: releases, error } = usePollingMuseData(`muse.plugin-releases.${plugin.name}`);
  if (error) return 'Failed, please refresh to retry.';
  if (filter && releases) releases = releases.filter(filter);

  const options = releases
    ? releases.map((r) => {
        const tags = [];
        if (app) {
          Object.entries(app.envs).forEach(([envName, env]) => {
            if (env.plugins?.find((a) => a.name === plugin.name && a.version === r.version)) {
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
        return {
          key: r.version,
          value: r.version.startsWith('v') ? r.version.substring(1) : r.version,
          label: (
            <>
              <span style={{ marginRight: '15px', verticalAlign: 'middle' }}>{r.version}</span>
              {tags}
              <span style={{ color: '#999', marginLeft: '5px', verticalAlign: 'middle' }}>
                {r.branch && (
                  <>
                    built from{' '}
                    <Tag>
                      {/^[0-9a-f]{40}$/.test(r.branch)
                        ? r.branch.substring(0, 6)
                        : r.branch || 'unknown'}
                    </Tag>
                  </>
                )}
                by {r.createdBy} <TimeAgo date={new Date(r.createdAt)} />
              </span>
            </>
          ),
        };
      })
    : [];

  extendArray(options, 'options', 'museManager.pm.pluginReleaseSelect', { options, plugin, app });

  return (
    <div className="plugin-manager_home-plugin-release-select">
      <Select
        value={value}
        placeholder={`Select a version to deploy`}
        onChange={onChange}
        {...rest}
        popupMatchSelectWidth={false}
        disabled={loading}
        loading={loading}
        options={options}
      />
    </div>
  );
}
