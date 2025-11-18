// import pkgExistsInRegistry from './tests/utils/pkgExistsInRegistry.js';
// import startNpmRegistry from './tests/setup/startNpmRegistry.js';

// await startNpmRegistry();
// console.log(await pkgExistsInRegistry('@ebay/muse-cli'));
import { $ } from 'zx';

$.verbose = true;
await $`echo hi`;
const args = [];
args.push('--no-git-check');
args.push('--force');
args.push('--access', 'public');
args.push('--registry=http://localhost:4873');

await $`pnpm publish ${args}`;
