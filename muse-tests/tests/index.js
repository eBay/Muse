#!/usr/bin/env zx
import debug from 'debug';
import jsPlugin from 'js-plugin';
import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import setupMuse from './setup/index.js';
import { asyncInvoke } from './utils.js';
import mainFlow from './main-flow/index.js';
import museCli from './muse-cli/index.js';
import reporter from './reporter.js';

if (!process.env.DEBUG) {
  // we use debug as logger
  debug.enable('muse:*');
}

jsPlugin.config.throws = true;
jsPlugin.register(museCli);
jsPlugin.register(mainFlow);

// Clone the repo and install muse-cli
await setupMuse();

// await fs.emptyDir(path.join(os.homedir(), 'muse-storage'));

// await await asyncInvoke('preStart');
// await asyncInvoke('start');
// await asyncInvoke('postStart');

// await asyncInvoke('end');

// await reporter.report();
