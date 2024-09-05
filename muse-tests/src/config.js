import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Special config
export const MUSE_REPO_REMOTE = process.env.MUSE_REPO_REMOTE || path.join(__dirname, '../../');
export const WORKING_DIR = process.env.WORKING_DIR || path.join(__dirname, '../tmp');
export const MUSE_REPO_LOCAL = path.join(WORKING_DIR, 'muse-repo');
export const VERDACCIO_STORAGE = path.join(WORKING_DIR, 'verdaccio-storage');
export const LOCAL_NPM_REGISTRY_PORT = process.env.LOCAL_NPM_REGISTRY_PORT || 4873;
export const LOCAL_NPM_REGISTRY = `http://localhost:${LOCAL_NPM_REGISTRY_PORT}/`;

// Flexible config
export const get = (key) => {
  if (!key.startsWith('MUSE_TESTS_CONFIG_')) key = 'MUSE_TESTS_CONFIG_' + key;

  return process.env[key];
};

// Flag config: usually used to enable/disable certain parts of the tests
export const isFlagEnabled = (flag) => {
  if (!flag.startsWith('MUSE_TESTS_FLAG_')) flag = 'MUSE_TESTS_FLAG_' + flag;
  return process.env[flag] === '1' || process.env[flag] === 'true';
};
