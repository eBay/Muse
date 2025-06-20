/**
 * This script uses pnpm workspace publish command to publish all packages in the workspace.
 * This script is used for automated publishing of workspace packages to the npm registry.
 * It is used in the CI/CD pipeline and public github actions.
 */
import { $ } from 'zx';
import path from 'path';
import debug from 'debug';

if (!process.env.DEBUG) {
  // we use debug as logger
  debug.enable('muse:*');
}

$.verbose = true;

const log = debug('muse:scripts:publish-core-packages');

const registryUrl = process.env.NPM_REGISTRY_TO_PUBLISH || 'http://localhost:5873/';

const workspaceDir = path.join(process.cwd(), '../workspace');

await $`cd ${workspaceDir} && pnpm publish -r --access public --registry=${registryUrl} --no-git-checks`;

log('Done.');
