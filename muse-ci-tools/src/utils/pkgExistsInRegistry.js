import getPkgInRegistry from 'package-json';
import * as config from '../config.js';
import debug from 'debug';

const log = debug('muse:utils:pkg-exists-in-registry');
// Mostly a utility used during development to save time
const pkgExistsInRegistry = async (pkgName) => {
  log('checking if package exists in registry', pkgName, config.LOCAL_NPM_REGISTRY);
  try {
    const pkg = await getPkgInRegistry(pkgName, {
      registryUrl: config.LOCAL_NPM_REGISTRY,
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
