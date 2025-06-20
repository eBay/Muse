import semverValid from 'semver/functions/valid';
import semverDiff from 'semver/functions/diff';

export const getPluginId = (name) => (name.startsWith('@') ? name.replace('/', '.') : name);

export const versionDiff = (version1, version2) => {
  const v1 = semverValid(version1);
  const v2 = semverValid(version2);
  if (v1 === null || v2 === null) return null;
  const diff = semverDiff(v1, v2); // major, premajor, minor, preminor, patch, prepatch, or prerelease, or null if the same
  return diff === null ? 'null' : diff;
};
