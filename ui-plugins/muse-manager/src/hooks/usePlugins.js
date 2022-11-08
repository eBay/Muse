import { useMemo } from 'react';
import _ from 'lodash';
import mapValues from 'lodash/fp/mapValues';
import flow from 'lodash/fp/flow';
import semverDiff from 'semver/functions/diff';

// Get plugin list table data
export default function usePlugins({ app, allPlugins, latestReleases, npmVersions }) {
  const pluginList = useMemo(() => {
    const pluginByEnv = _.mapValues(app?.envs, env => {
      return _.keyBy(env.plugins || [], 'name');
    });

    return allPlugins?.map(p => {
      const latestRelease = latestReleases?.[p.name];
      const latestVersion = latestRelease?.version?.replace('v', '');
      const envs = flow(
        mapValues(v => {
          const p2 = pluginByEnv[v.name][p.name];
          return p2
            ? {
                ...p2,
                versionDiff: (latestVersion && semverDiff(p2.version, latestVersion)) || null,
              }
            : null;
        }),
      )(app?.envs || {});

      const npmInfo = {};
      if (npmVersions) {
        const npmVersion = npmVersions[`@ebay/${p.name}`] || npmVersions[p.name];
        if (npmVersion && latestVersion) {
          npmInfo.npmVersion = npmVersion;
          npmInfo.npmDiff = semverDiff(npmVersion, latestVersion);
        }
      }

      return {
        ...p,
        latestRelease,
        ...npmInfo,
        envs,
        // status,
      };
    });
  }, [app, allPlugins, latestReleases, npmVersions]);

  return { data: pluginList };
}
