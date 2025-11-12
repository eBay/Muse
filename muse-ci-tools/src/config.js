import path from 'path';
import assert from 'node:assert';
import 'dotenv/config';

// Flag config: usually used to enable/disable certain parts of the tests
export const isFlagEnabled = (flag) => {
  if (!flag.startsWith('MUSE_TESTS_FLAG_')) flag = 'MUSE_TESTS_FLAG_' + flag;
  return process.env[flag] === '1' || process.env[flag] === 'true';
};

// Flexible config
export const get = (key) => {
  if (!key.startsWith('MUSE_TESTS_CONFIG_')) key = 'MUSE_TESTS_CONFIG_' + key;

  return process.env[key];
};

export const MUSE_REPO_REMOTE = path.join(process.cwd(), '..');

// Special config
export const WORKING_DIR = isFlagEnabled('GITHUB_ACTIONS')
  ? path.join(process.cwd(), '..')
  : path.join(process.cwd(), 'tmp');
export const MUSE_REPO_LOCAL = isFlagEnabled('GITHUB_ACTIONS')
  ? WORKING_DIR
  : path.join(WORKING_DIR, 'muse-repo');
export const VERDACCIO_STORAGE =
  process.env.VERDACCIO_STORAGE || path.join(WORKING_DIR, 'verdaccio-store');
export const TARGET_NPM_REGISTRY_PORT = process.env.TARGET_NPM_REGISTRY_PORT || 5873;
export const TARGET_NPM_REGISTRY =
  process.env.TARGET_NPM_REGISTRY || `http://localhost:${TARGET_NPM_REGISTRY_PORT}/`;
export const UPCOMING_NPM_REGISTRY =
  process.env.UPCOMING_NPM_REGISTRY || 'https://registry.npmjs.org/';

export const IS_TESTING = TARGET_NPM_REGISTRY.startsWith('http://localhost:');

/**
 * The npm registry used to install dependencies of workspace and ui-plugins
 */

export const assertVariablesExist = () => {
  assert(WORKING_DIR, 'WORKING_DIR not exist');
  assert(MUSE_REPO_LOCAL, 'MUSE_REPO_LOCAL not exist');
  assert(VERDACCIO_STORAGE, 'VERDACCIO_STORAGE not exist');
  assert(TARGET_NPM_REGISTRY_PORT, 'TARGET_NPM_REGISTRY_PORT not exist');
  assert(TARGET_NPM_REGISTRY, 'TARGET_NPM_REGISTRY not exist');
  assert(UPCOMING_NPM_REGISTRY, 'UPCOMING_NPM_REGISTRY not exist');
};
