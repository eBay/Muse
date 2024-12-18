import pkgExistsInRegistry from './tests/utils/pkgExistsInRegistry.js';
import startNpmRegistry from './tests/setup/startNpmRegistry.js';

await startNpmRegistry();
console.log(await pkgExistsInRegistry('@ebay/muse-cli'));
