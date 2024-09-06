import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
export const MUSE_REPO_REMOTE = process.env.MUSE_REPO_REMOTE || path.join(__dirname, '../../');
export const WORKING_DIR = process.env.WORKING_DIR || path.join(__dirname, '../tmp');
export const MUSE_REPO_LOCAL = path.join(WORKING_DIR, 'muse-repo');
export const VERDACCIO_STORAGE = path.join(WORKING_DIR, 'verdaccio-storage');
export const LOCAL_NPM_REGISTRY_PORT = process.env.LOCAL_NPM_REGISTRY_PORT || 4873;
export const LOCAL_NPM_REGISTRY = `http://localhost:${LOCAL_NPM_REGISTRY_PORT}/`;

/**
 * The npm registry used to install dependencies of workspace and ui-plugins
 */
export const NPM_REGISTRY = isFlagEnabled('VERIFICATION_TEST')
  ? process.env.UPCOMING_NPM_REGISTRY || 'https://registry.npmjs.org/'
  : LOCAL_NPM_REGISTRY;

export const assertVariablesExist = () => {
  const varsToExist = [
    MUSE_REPO_REMOTE,
    WORKING_DIR,
    MUSE_REPO_LOCAL,
    VERDACCIO_STORAGE,
    LOCAL_NPM_REGISTRY_PORT,
    LOCAL_NPM_REGISTRY,
    NPM_REGISTRY,
    get('UPCOMING_NPM_REGISTRY'),
  ];

  varsToExist.forEach((v) => {
    if (!v) throw new Error('Some env variables not exist');
  });
};
