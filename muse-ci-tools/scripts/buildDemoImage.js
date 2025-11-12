/**
 * This script is used for:
 *  - Demo Muse features with musemanager, examples
 *  - Verify all public npm packages work correctly together by manually testing
 *  - Examples development
 *
 * It includes below steps:
 *  - Install latest Muse command line @ebay/muse-cli
 *  - Run "muse init" to initialize a muse workspace
 *  - Install muse-runner
 *  - Mount local examples folder to /workspace/examples
 *  - Optionally create examples app, build and deploy example plugins
 */
import path from 'path';
import fs from 'fs-extra';
import assert from 'node:assert';
import 'dotenv/config';
import { $ } from 'zx';

$.verbose = true;
const cwd = process.cwd();

// Ensure the script is run from the muse-ci-tools package
const pkgJson = fs.readJsonSync(path.join(cwd, 'package.json'));
assert(
  pkgJson.name === '@ebay/muse-ci-tools',
  'This script should be run under the @ebay/muse-ci-tools project.',
);

console.log('Build and start docker...');

await $`docker build -f Dockerfile.demo -t muse-demo .`;

// To reset npm registry, delete tmp/verdaccio-store folder
// To reset pnpm store, delete tmp/pnpm-store folder
// await $`docker run \
//   -it \
//   -v ${path.join(cwd, 'tmp/demo-folder')}:/workspace \
//   -v ${path.join(cwd, '../examples')}:/workspace/examples \
//   -v ${path.join(cwd, 'tmp/demo-folder/pnpm-store')}:/pnpm-store \
//   -p 127.0.0.1:5000-6000:5000-6000 \
//   muse-demo`;
