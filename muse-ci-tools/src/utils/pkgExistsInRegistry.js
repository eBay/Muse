import getPkgInRegistry from 'package-json';
import * as config from '../config.js';
import debug from 'debug';

const log = debug('muse:utils:pkg-exists-in-registry');
// Mostly a utility used during development to save time
const pkgExistsInRegistry = async (pkgName, { registryUrl, version } = {}) => {
  log(
    'checking if package exists in registry',
    pkgName,
    version,
    registryUrl || config.TARGET_NPM_REGISTRY,
  );
  try {
    const pkg = await getPkgInRegistry(pkgName, {
      registryUrl: registryUrl || config.TARGET_NPM_REGISTRY,
      version,
    });
    return pkg;
  } catch (err) {
    if (err.toString().includes('could not be found')) {
      return false;
    }
    throw err;
  }
};

export default pkgExistsInRegistry;
