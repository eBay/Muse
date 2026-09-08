import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  isValidPluginName,
  isValidPluginType,
  isValidPluginVersion,
  isForcePluginsAllowed,
  parseForcePlugins,
  applyForcePlugins,
} from './forcePlugins.js';

describe('isValidPluginName', () => {
  it('accepts unscoped and scoped names', () => {
    expect(isValidPluginName('my-plugin')).toBe(true);
    expect(isValidPluginName('@ebay/muse-lib-react')).toBe(true);
  });

  it('rejects HTML and path junk', () => {
    expect(isValidPluginName('poc<img')).toBe(false);
    expect(isValidPluginName('../etc')).toBe(false);
    expect(isValidPluginName('@ebay/foo/bar')).toBe(false);
  });
});

describe('isValidPluginType', () => {
  it('accepts known Muse plugin types', () => {
    expect(isValidPluginType('boot')).toBe(true);
    expect(isValidPluginType('init')).toBe(true);
    expect(isValidPluginType('lib')).toBe(true);
    expect(isValidPluginType('normal')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isValidPluginType('Init')).toBe(false);
    expect(isValidPluginType('')).toBe(false);
    expect(isValidPluginType(undefined)).toBe(false);
  });
});

describe('isValidPluginVersion', () => {
  it('accepts semver and the null sentinel', () => {
    expect(isValidPluginVersion('1.0.29')).toBe(true);
    expect(isValidPluginVersion('1.2.3-beta.1')).toBe(true);
    expect(isValidPluginVersion('null')).toBe(true);
  });

  it('rejects HTML payloads and incomplete versions', () => {
    expect(isValidPluginVersion('<img src=x onerror=alert(1)>')).toBe(false);
    expect(isValidPluginVersion('1.0')).toBe(false);
    expect(isValidPluginVersion('v1.0.0')).toBe(false);
  });
});

describe('isForcePluginsAllowed', () => {
  it('is off for deployed apps by default', () => {
    expect(isForcePluginsAllowed({ isDev: false, isLocal: false, appConfig: {} })).toBe(false);
  });

  it('is on for local/dev or Muse e2e', () => {
    expect(isForcePluginsAllowed({ isDev: true })).toBe(true);
    expect(isForcePluginsAllowed({ isLocal: true })).toBe(true);
    expect(isForcePluginsAllowed({ isE2eTest: true })).toBe(true);
  });
});

describe('parseForcePlugins', () => {
  it('parses scoped names, types, and multiple entries', () => {
    expect(parseForcePlugins('@ebay/my-plugin!lib@1.2.3;other-plugin@2.0.0')).toEqual({
      '@ebay/my-plugin': { version: '1.2.3', type: 'lib' },
      'other-plugin': { version: '2.0.0', type: undefined },
    });
  });

  it('parses the pentest-style name!type@version form', () => {
    expect(parseForcePlugins('poc!init@1.0.0')).toEqual({
      poc: { version: '1.0.0', type: 'init' },
    });
  });
});

describe('applyForcePlugins', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const deployed = [
    { name: '@ebay/muse-lib-react', type: 'lib', version: '1.0.0' },
    { name: 'my-feature', type: 'normal', version: '2.0.0' },
  ];

  it('overrides an existing plugin version', () => {
    expect(applyForcePlugins(deployed, '@ebay/muse-lib-react@3.1.4')).toEqual([
      { name: '@ebay/muse-lib-react', type: 'lib', version: '3.1.4' },
      { name: 'my-feature', type: 'normal', version: '2.0.0' },
    ]);
  });

  it('removes a plugin when version is null', () => {
    expect(applyForcePlugins(deployed, 'my-feature@null')).toEqual([
      { name: '@ebay/muse-lib-react', type: 'lib', version: '1.0.0' },
    ]);
  });

  it('adds a plugin only with a valid name, type, and version', () => {
    expect(applyForcePlugins(deployed, 'extra!init@1.0.1')).toEqual([
      ...deployed,
      { name: 'extra', type: 'init', version: '1.0.1' },
    ]);
  });

  it('drops XSS payloads instead of constructing plugin URLs from them', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const payload = 'poc!init@<img src=x onerror="alert(1)">';
    expect(applyForcePlugins(deployed, payload)).toEqual(deployed);
    expect(warn).toHaveBeenCalled();
  });

  it('does not add a plugin without a valid type', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(applyForcePlugins(deployed, 'mystery@1.0.0')).toEqual(deployed);
    expect(warn).toHaveBeenCalled();
  });
});
