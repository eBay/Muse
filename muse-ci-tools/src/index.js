#!/usr/bin/env zx
import debug from 'debug';
import 'dotenv/config';
// import assert from 'node:assert';
// import isDocker from 'is-docker';
import jsPlugin from 'js-plugin';
import setupMuse from './setup/index.js';
import { asyncInvoke } from './utils.js';
import { $, os, usePwsh } from 'zx';
import mainFlow from './plugins/main-flow/index.js';
import museCli from './plugins/muse-cli/index.js';
import reporter from './reporter.js';
import { assertVariablesExist } from './config.js';

// We need to run this script in a docker container because we need to modify
// source code files under the whole mono repo.
// assert(isDocker(), 'This script must be run in a docker container');

console.log('Testing started.');

$.verbose = true;

if (os.platform() === 'win32') {
  // use powershell v7+ on windows
  usePwsh();
}

// assertVariablesExist();

if (!process.env.NO_DEBUG) {
  // we use debug as logger
  console.log('using debug mode');
  debug.enable('muse:*');
}

jsPlugin.config.throws = true;

const allPlugins = [museCli, mainFlow];

allPlugins.forEach((p) => {
  jsPlugin.register(p);
});

// await $`node -v`;
// await $`pnpm -v`;
console.log('start setup');
await setupMuse();
console.log('setup finished');

await asyncInvoke('preStart');
await asyncInvoke('start');
await asyncInvoke('postStart');
await asyncInvoke('preEnd');
await asyncInvoke('end');
await asyncInvoke('postEnd');

reporter.report();
