/**
 * This script is only used for local development and testing.
 * On CI or github actions, run "node src/index.js"
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

// Clone the Muse mono repo (from local folder) to a tmp folder
// Only for local development and testing
// This simulates the scenario where muse-ci-tools is tested by Github actions
// To reset the testing, just delete the tmp/muse-repo folder
const mountedRepoFolder = path.join(cwd, 'tmp/muse-repo');
if (!fs.existsSync(mountedRepoFolder)) {
  console.log('Cloning muse repo');
  await $`git clone ../ ${mountedRepoFolder}`;
}

// Overwrite the src, package.json and pnpm-lock.yaml files from muse-ci-tools
// This is to apply code changes from muse-tests folder for development testing.
const dest = path.join(cwd, 'tmp/muse-repo/muse-ci-tools');
const pathsToOverwrite = ['src', 'package.json', 'pnpm-lock.yaml', '.env'];
for (const p of pathsToOverwrite) {
  fs.removeSync(path.join(dest, p));
  fs.copySync(path.join(cwd, p), path.join(dest, p));
}

console.log('Build and start docker...');

await $`docker build -t muse-ci-tools .`;

// To reset npm registry, delete tmp/verdaccio-store folder
// To reset pnpm store, delete tmp/pnpm-store folder
await $`docker run \
  -it \
  -v ${mountedRepoFolder}:/testspace \
  -v ${path.join(cwd, 'tmp/pnpm-store')}:/pnpm-store \
  -v ${path.join(cwd, 'tmp/verdaccio-store')}:/verdaccio-store \
  -p 127.0.0.1:5000-6000:5000-6000 \
  muse-ci-tools`;
