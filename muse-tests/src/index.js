#!/usr/bin/env zx
import debug from 'debug';
import 'dotenv/config';
import jsPlugin from 'js-plugin';
import setupMuse from './setup/index.js';
import { asyncInvoke } from './utils.js';
import { $ } from 'zx';
import mainFlow from './plugins/main-flow/index.js';
import museCli from './plugins/muse-cli/index.js';
import reporter from './reporter.js';

$.verbose = true;

console.log('abc');
if (!process.env.DEBUG) {
  // we use debug as logger
  debug.enable('muse:*');
}

jsPlugin.config.throws = true;

const allPlugins = [museCli, mainFlow];

allPlugins.forEach((p) => {
  // jsPlugin.register(p);
});

await setupMuse();

await asyncInvoke('preStart');
await asyncInvoke('start');
await asyncInvoke('postStart');
await asyncInvoke('preEnd');
await asyncInvoke('end');
await asyncInvoke('postEnd');
await reporter.report();
