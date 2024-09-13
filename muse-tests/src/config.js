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

// Special config
export const WORKING_DIR = '/testspace';
export const MUSE_REPO_LOCAL = '/testspace'; //path.join(WORKING_DIR, 'muse-repo');
export const VERDACCIO_STORAGE =
  process.env.VERDACCIO_STORAGE || path.join(WORKING_DIR, 'verdaccio-store');
export const LOCAL_NPM_REGISTRY_PORT = process.env.LOCAL_NPM_REGISTRY_PORT || 5873;
export const LOCAL_NPM_REGISTRY = `http://localhost:${LOCAL_NPM_REGISTRY_PORT}/`;

/**
 * The npm registry used to install dependencies of workspace and ui-plugins
 */

export const assertVariablesExist = () => {
  assert(WORKING_DIR, 'WORKING_DIR not exist');
  assert(MUSE_REPO_LOCAL, 'MUSE_REPO_LOCAL not exist');
  assert(VERDACCIO_STORAGE, 'VERDACCIO_STORAGE not exist');
  assert(LOCAL_NPM_REGISTRY_PORT, 'LOCAL_NPM_REGISTRY_PORT not exist');
  assert(LOCAL_NPM_REGISTRY, 'LOCAL_NPM_REGISTRY not exist');
  assert(get('UPCOMING_NPM_REGISTRY'), 'MUSE_TESTS_CONFIG_UPCOMING_NPM_REGISTRY not exist');
};
